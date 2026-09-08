import { CardContent, Card } from "@/components/ui/card";
import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  CheckCircle2,
  ChevronLeft,
  Italic,
  List,
  ListOrdered,
  Mail,
  Send,
  Underline,
  UserRound,
  X,
} from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type TemplateEmailRouteState = {
  source: string;
  templateId: string;
  templateName: string;
  ministry: string;
  indicatorGroup: string;
  format: string;
  version: string;
  status: string;
  updatedOn: string;
  toEmailAddresses: string[];
  ccEmailAddresses: string[];
};

const emptyTemplateEmailRouteState: TemplateEmailRouteState = {
  source: "",
  templateId: "",
  templateName: "",
  ministry: "",
  indicatorGroup: "",
  format: "",
  version: "",
  status: "",
  updatedOn: "",
  toEmailAddresses: [],
  ccEmailAddresses: [],
};

type EmailErrors = Partial<Record<"to" | "cc" | "subject" | "body", string>>;

function stateValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stateStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
}

function asTemplateState(value: unknown): TemplateEmailRouteState {
  if (!value || typeof value !== "object") return emptyTemplateEmailRouteState;
  const record = value as Record<string, unknown>;
  return {
    source: stateValue(record.source),
    templateId: stateValue(record.templateId),
    templateName: stateValue(record.templateName),
    ministry: stateValue(record.ministry),
    indicatorGroup: stateValue(record.indicatorGroup),
    format: stateValue(record.format),
    version: stateValue(record.version),
    status: stateValue(record.status),
    updatedOn: stateValue(record.updatedOn),
    toEmailAddresses: stateStringArray(record.toEmailAddresses),
    ccEmailAddresses: stateStringArray(record.ccEmailAddresses),
  };
}

function recipientIsValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function bodyText(html: string) {
  const element = document.createElement("div");
  element.innerHTML = html;
  return element.textContent?.trim() ?? "";
}

function buildDefaultBody(templateName: string, ministry: string) {
  return [
    "<p>Dear Sir/Madam,</p>",
    `<p>Please find the selected data collection template <strong>${templateName || "template"}</strong> for your review and submission.</p>`,
    ministry ? `<p>Ministry: ${ministry}</p>` : "",
    "<p>Regards,<br/>SSD Data Team</p>",
  ].filter(Boolean).join("");
}

export function TemplateEmailCompositionPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = asTemplateState(location.state);
  const selectedTemplate = {
    templateId: routeState.templateId,
    templateName: routeState.templateName,
    ministry: routeState.ministry,
    indicatorGroup: routeState.indicatorGroup,
    format: routeState.format,
    version: routeState.version,
    status: routeState.status,
    updatedOn: routeState.updatedOn,
  };
  const arrivedFromTemplates = routeState.source === "ingestion-templates";
  const defaultBody = useMemo(
    () => buildDefaultBody(selectedTemplate.templateName, selectedTemplate.ministry),
    [selectedTemplate.templateName, selectedTemplate.ministry],
  );
  const editorRef = useRef<HTMLDivElement>(null);
  const [toRecipients, setToRecipients] = useState<string[]>(routeState.toEmailAddresses);
  const [ccRecipients, setCcRecipients] = useState<string[]>(routeState.ccEmailAddresses);
  const [toDraft, setToDraft] = useState("");
  const [ccDraft, setCcDraft] = useState("");
  const [subject, setSubject] = useState(
    selectedTemplate.templateName ? `Data collection template: ${selectedTemplate.templateName}` : "",
  );
  const [bodyHtml, setBodyHtml] = useState(defaultBody);
  const [errors, setErrors] = useState<EmailErrors>({});
  const [sent, setSent] = useState(false);

  useLayoutEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = defaultBody;
  }, [defaultBody]);

  function addRecipient(kind: "to" | "cc", value: string) {
    const email = value.trim().replace(/,$/, "");
    if (!email) return;
    const setRecipients = kind === "to" ? setToRecipients : setCcRecipients;
    setRecipients((current) => current.some((item) => item.toLowerCase() === email.toLowerCase()) ? current : [...current, email]);
    if (kind === "to") setToDraft("");
    else setCcDraft("");
  }

  function removeRecipient(kind: "to" | "cc", email: string) {
    const setRecipients = kind === "to" ? setToRecipients : setCcRecipients;
    setRecipients((current) => current.filter((item) => item !== email));
  }

  function handleRecipientKeyDown(kind: "to" | "cc", event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "," || event.key === "Tab") {
      const value = event.currentTarget.value;
      if (!value.trim()) return;
      event.preventDefault();
      addRecipient(kind, value);
    }
  }

  function applyFormat(command: "bold" | "italic" | "underline" | "insertUnorderedList" | "insertOrderedList") {
    editorRef.current?.focus();
    document.execCommand(command);
    setBodyHtml(editorRef.current?.innerHTML ?? "");
  }

  function validateDraft() {
    const nextErrors: EmailErrors = {};
    const toWithDraft = [...toRecipients];
    const ccWithDraft = [...ccRecipients];
    if (toDraft.trim()) toWithDraft.push(toDraft.trim());
    if (ccDraft.trim()) ccWithDraft.push(ccDraft.trim());
    if (!toWithDraft.length) nextErrors.to = "Add at least one recipient.";
    else if (toWithDraft.some((email) => !recipientIsValid(email))) nextErrors.to = "Enter valid email addresses in To.";
    if (ccWithDraft.some((email) => !recipientIsValid(email))) nextErrors.cc = "Enter valid email addresses in CC.";
    if (!subject.trim()) nextErrors.subject = "Email subject is required.";
    if (!bodyText(bodyHtml)) nextErrors.body = "Email body is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function sendEmail() {
    if (!validateDraft()) return;
    if (toDraft.trim()) addRecipient("to", toDraft);
    if (ccDraft.trim()) addRecipient("cc", ccDraft);
    setSent(true);
  }

  function goBack() {
    if (window.history.length > 1) navigate(-1);
    else navigate("/ingestion/excel-templates");
  }

  const recipientCount = toRecipients.length + ccRecipients.length + (toDraft.trim() ? 1 : 0) + (ccDraft.trim() ? 1 : 0);

  if (sent) {
    return (
      <PageSection className="flex min-w-0 flex-col gap-4 content-stack">
        <Card className="min-w-0" aria-live="polite"><CardContent className="flex min-w-0 flex-col gap-3">
          <span><CheckCircle2 size={28} /></span>
          <div>
            <small>Email queued</small>
            <h3>Template email is ready for delivery</h3>
            <p>The selected template email has been validated and queued in the mock delivery workflow.</p>
          </div>
          <dl>
            <div><dt>Template</dt><dd>{selectedTemplate.templateId}</dd></div>
            <div><dt>Recipients</dt><dd>{recipientCount}</dd></div>
            <div><dt>Subject</dt><dd>{subject}</dd></div>
          </dl>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" type="button" onClick={() => navigate("/ingestion/excel-templates")}>
              Back to Templates
            </Button>
          </div>
        </CardContent></Card>
      </PageSection>
    );
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4 content-stack">
      <PageHeader>
        <div>
          <h1>Email Composition</h1>
          <p>{t("pages.sourcesMinistries.templateEmailDescription")}</p>
        </div>
      </PageHeader>

      {!arrivedFromTemplates ? (
        <div className="text-sm text-destructive" role="status">
          No template selection was received. Showing the default available template.
        </div>
      ) : null}

      <div className="grid min-w-0 grid-cols-1 gap-4">
        <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3">
          <header>
            <div><span><Mail size={15} /></span><strong>New Template Email</strong></div>
            <small>Draft email</small>
          </header>

          <div className="flex min-w-0 flex-col gap-3">
            <div className="text-xs text-muted-foreground">
              <span>From</span>
              <strong><UserRound size={14} /> SSD Data Team <small>ssd.notifications@example.gov.in</small></strong>
              <div />
            </div>

            <RecipientField
              error={errors.to}
              label="To"
              onAdd={(value) => addRecipient("to", value)}
              onKeyDown={(event) => handleRecipientKeyDown("to", event)}
              onRemove={(email) => removeRecipient("to", email)}
              placeholder="Add recipients and press Enter"
              value={toDraft}
              values={toRecipients}
              onChange={setToDraft}
            />

            <RecipientField
              error={errors.cc}
              label="CC"
              onAdd={(value) => addRecipient("cc", value)}
              onKeyDown={(event) => handleRecipientKeyDown("cc", event)}
              onRemove={(email) => removeRecipient("cc", email)}
              placeholder="Add CC recipients"
              value={ccDraft}
              values={ccRecipients}
              onChange={setCcDraft}
            />

            <label className="flex min-w-0 flex-col gap-2">
              <span>Subject</span>
              <Input value={subject} placeholder="Email subject" onChange={(event) => setSubject(event.target.value)} />
              {errors.subject ? <small className="text-sm text-destructive">{errors.subject}</small> : null}
            </label>

            <div className="overflow-hidden rounded-md border border-input">
              <div className="flex flex-wrap items-center gap-2" aria-label="Email body formatting">
                <Button type="button" title="Bold" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat("bold")}><Bold size={14} /></Button>
                <Button type="button" title="Italic" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat("italic")}><Italic size={14} /></Button>
                <Button type="button" title="Underline" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat("underline")}><Underline size={14} /></Button>
                <Button type="button" title="Bulleted list" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat("insertUnorderedList")}><List size={14} /></Button>
                <Button type="button" title="Numbered list" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat("insertOrderedList")}><ListOrdered size={14} /></Button>
              </div>
              <div
                ref={editorRef}
                className={`min-h-64 p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 ${errors.body ? "border border-destructive" : ""}`}
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                aria-label="Email Body"
                aria-multiline="true"
                onInput={(event) => setBodyHtml(event.currentTarget.innerHTML)}
              />
              {errors.body ? <small className="text-sm text-destructive">{errors.body}</small> : null}
            </div>
          </div>

          <footer>
            <Button variant="outline" type="button" onClick={goBack}>
              <ChevronLeft size={14} /> Cancel
            </Button>
            <div>
              <Button type="button" onClick={sendEmail}>
                <Send size={15} /> Send
              </Button>
            </div>
          </footer>
        </CardContent></Card>

      </div>
    </PageSection>
  );
}

type RecipientFieldProps = {
  error?: string;
  label: string;
  onAdd: (value: string) => void;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onRemove: (email: string) => void;
  placeholder: string;
  value: string;
  values: string[];
};

function RecipientField({ error, label, onAdd, onChange, onKeyDown, onRemove, placeholder, value, values }: RecipientFieldProps) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span>{label}</span>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {values.map((email) => (
          <Badge key={email}>
            {email}
            <Button type="button" aria-label={`Remove ${email}`} onClick={() => onRemove(email)}><X size={12} /></Button>
          </Badge>
        ))}
        <Input
          value={value}
          placeholder={placeholder}
          onBlur={(event) => onAdd(event.currentTarget.value)}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      {error ? <small className="text-sm text-destructive">{error}</small> : null}
    </label>
  );
}
