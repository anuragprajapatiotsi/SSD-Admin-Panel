import type { RequestAccessAssignment, RequestAccessPreview, RequestAccessSessionDetail } from "@/api/requests.api";
import { ApiError } from "@/api/http-client";
import { clearProviderSession, readProviderSession, saveProviderSession } from "@/api/provider-session-storage";
import type { ProviderEntryMode } from "@/utils/provider-assignment";
import { useProviderAssignment, useProviderOtp, useProviderPreview, useProviderVerify } from "@/hooks/use-template-workflow";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { createRestoredTourUserKey, createTourUserKey } from "@/components/common/guided-tour/tour-progress";

type AccessStage =
  | { kind: "email" }
  | { kind: "otp"; email: string; resendAt: number }
  | { kind: "verified"; session: string; assignments: RequestAccessAssignment[]; detail?: RequestAccessSessionDetail }
  | { kind: "template"; session: string; assignments: RequestAccessAssignment[]; detail: RequestAccessSessionDetail; mode: ProviderEntryMode };

export function useProviderAccess(token: string) {
  const { t } = useTranslation("ingestion");
  const previewMutation = useProviderPreview();
  const otpMutation = useProviderOtp();
  const verifyMutation = useProviderVerify();
  const assignmentMutation = useProviderAssignment();
  const [preview, setPreview] = useState<RequestAccessPreview | null>(null);
  const [stage, setStage] = useState<AccessStage>({ kind: "email" });
  const [tourUserKey, setTourUserKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [pending, setPending] = useState<"send" | "verify" | "assignment" | null>(null);
  const inFlight = useRef(false);
  const active = useRef(true);
  const requestPreview = previewMutation.mutateAsync;
  const requestAssignment = assignmentMutation.mutateAsync;
  const messages = useRef(t);
  useEffect(() => { messages.current = t; }, [t]);

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  useEffect(() => {
    let current = true;
    if (!token) { setLoading(false); return; }
    void requestPreview({ token }).then(async (data) => {
      if (!current) return;
      setPreview(data);
      if (data.superseded) { clearProviderSession(token); return; }
      const saved = readProviderSession(token);
      if (!saved) return;
      try {
        // Restore only after the backend validates this short-lived provider session.
        const detail = await requestAssignment({ session: saved.session, run_item_code: saved.runItemCode });
        if (!current) return;
        if (detail.superseded) {
          clearProviderSession(token);
          setPreview({ ...data, superseded: true, message: detail.message });
          return;
        }
        const assignments = detail.assignments ?? (detail.assignment ? [detail.assignment] : []);
        const identity = saved.tourUserKey ?? await createRestoredTourUserKey(saved.session);
        if (!current) return;
        setTourUserKey(identity);
        saveProviderSession(token, saved.session, saved.runItemCode, saved.mode, identity ?? undefined);
        if (saved.runItemCode && detail.assignment?.runItemCode === saved.runItemCode) {
          setStage({ kind: "template", session: saved.session, assignments, detail, mode: saved.mode ?? "online" });
        } else {
          saveProviderSession(token, saved.session);
          setStage({ kind: "verified", session: saved.session, assignments, detail });
        }
      } catch (cause) {
        if (!current) return;
        if (isInvalidProviderSession(cause)) {
          clearProviderSession(token);
          setStage({ kind: "email" });
          setError(messages.current("providerAccess.sessionExpired"));
        } else {
          // A network/server failure must not discard a potentially valid session.
          setRestoreFailed(true);
          setError(messages.current("providerAccess.restoreError"));
        }
      }
    }).catch(() => {
      if (current) setError(messages.current("providerAccess.linkError"));
    }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [requestPreview, requestAssignment, token]);

  async function run(action: NonNullable<typeof pending>, task: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setError("");
    setPending(action);
    try { await task(); }
    catch (cause) {
      if (!active.current) return;
      if (isInvalidProviderSession(cause) && (stage.kind === "verified" || stage.kind === "template")) {
        clearProviderSession(token);
        setStage({ kind: "email" });
        setError(t("providerAccess.sessionExpired"));
      } else setError(cause instanceof Error ? cause.message : t("providerAccess.actionError"));
    } finally {
      inFlight.current = false;
      if (active.current) setPending(null);
    }
  }

  async function sendOtp(email: string) {
    if (!preview || preview.superseded) return;
    if (stage.kind === "otp" && Date.now() < stage.resendAt) return;
    await run("send", async () => {
      const result = await otpMutation.mutateAsync({ token, email }).catch((cause: unknown) => {
        // This specific rate limit means a code is already available to verify.
        // Other 429 responses must remain errors, not imply that an OTP was sent.
        if (cause instanceof ApiError && cause.status === 429 && /OTP already sent/i.test(cause.message)) {
          const seconds = Number(cause.message.match(/wait\s+(\d+)\s+seconds?/i)?.[1]);
          if (Number.isFinite(seconds) && seconds > 0) {
            return { otpSent: true, resendAllowedAt: new Date(Date.now() + seconds * 1000).toISOString() };
          }
        }
        throw cause;
      });
      if (result.otpSent !== true) throw new Error(t("providerAccess.otpNotSent"));
      const serverTime = result.resendAllowedAt ? Date.parse(result.resendAllowedAt) : NaN;
      if (active.current) setStage({ kind: "otp", email, resendAt: Number.isFinite(serverTime) ? serverTime : Date.now() + 30_000 });
    });
  }

  async function verify(otp: string) {
    if (stage.kind !== "otp") return;
    await run("verify", async () => {
      const result = await verifyMutation.mutateAsync({ token, email: stage.email, otp });
      if (result.verified !== true || !result.accessSession) throw new Error(t("providerAccess.verificationError"));
      const identity = await createTourUserKey(stage.email);
      if (active.current) {
        setTourUserKey(identity);
        saveProviderSession(token, result.accessSession, undefined, undefined, identity ?? undefined);
        setStage({ kind: "verified", session: result.accessSession, assignments: result.assignments ?? [] });
        const detail = await requestAssignment({ session: result.accessSession });
        if (active.current) {
          if (detail.superseded) { expire(); return; }
          setStage({ kind: "verified", session: result.accessSession, assignments: detail.assignments ?? result.assignments ?? (detail.assignment ? [detail.assignment] : []), detail });
        }
      }
    });
  }

  async function openAssignment(runItemCode: string, mode: ProviderEntryMode) {
    if (stage.kind !== "verified" && stage.kind !== "template") return;
    if (!stage.assignments.some((item) => item.runItemCode === runItemCode)) return;
    await run("assignment", async () => {
      const detail = await assignmentMutation.mutateAsync({ session: stage.session, run_item_code: runItemCode });
      if (detail.superseded) throw new Error(detail.message || t("providerAccess.superseded"));
      if (detail.assignment?.runItemCode !== runItemCode) throw new Error(t("providerAccess.assignmentError"));
      if (active.current) {
        saveProviderSession(token, stage.session, runItemCode, mode);
        setStage({ ...stage, kind: "template", detail, mode });
      }
    });
  }

  function back() {
    if (inFlight.current) return;
    setError("");
    if (stage.kind === "template") saveProviderSession(token, stage.session);
    setStage(stage.kind === "template"
      ? { kind: "verified", session: stage.session, assignments: stage.assignments, detail: stage.detail }
      : { kind: "email" });
  }

  function expire() {
    clearProviderSession(token);
    setStage({ kind: "email" });
    setError(t("providerAccess.sessionExpired"));
  }

  function logout() {
    if (inFlight.current) return;
    // No public revocation endpoint is exposed. Clear only this tab's provider access.
    clearProviderSession(token);
    previewMutation.reset();
    otpMutation.reset();
    verifyMutation.reset();
    assignmentMutation.reset();
    setRestoreFailed(false);
    setError("");
    setStage({ kind: "email" });
  }

  async function refreshAssignments() {
    if (stage.kind !== "verified" && stage.kind !== "template") return;
    await run("assignment", async () => {
      const detail = await requestAssignment({ session: stage.session });
      if (!active.current) return;
      if (detail.superseded) { expire(); return; }
      saveProviderSession(token, stage.session);
      setStage({ kind: "verified", session: stage.session, assignments: detail.assignments ?? (detail.assignment ? [detail.assignment] : []), detail });
    });
  }

  return { preview, stage, tourUserKey, error, loading, restoreFailed, pending, sendOtp, verify, openAssignment, back, expire, logout, refreshAssignments };
}

function isInvalidProviderSession(cause: unknown) {
  return cause instanceof ApiError && (cause.status === 401 || cause.status === 403
    || (cause.status === 400 && /session.*(expired|invalid)|(expired|invalid).*session/i.test(cause.message)));
}
