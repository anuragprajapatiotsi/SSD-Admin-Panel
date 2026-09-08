import { InputGroupTextarea } from "@/components/ui/input-group";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLayoutEffect, useRef, useState, type ComponentProps, type CSSProperties, type Ref } from "react";
import { useTranslation } from "react-i18next";

type HighlightedVariableTextareaProps = Omit<ComponentProps<typeof InputGroupTextarea>, "value"> & {
  value: string;
  variableValues?: Readonly<Record<string, string | undefined>>;
  caretOffset?: number;
  caretAnchorRef?: Ref<HTMLSpanElement>;
};

/** A visual mirror only: the native textarea still owns editing, selection and undo. */
export function HighlightedVariableTextarea({ value, variableValues, caretOffset, caretAnchorRef, ref, className, onScroll, onMouseMove, onMouseLeave, onSelect, onBlur, ...props }: HighlightedVariableTextareaProps) {
  const { t } = useTranslation("common");
  const input = useRef<HTMLTextAreaElement>(null);
  const mirror = useRef<HTMLDivElement>(null);
  const tooltipAnchor = useRef<Element | null>(null);
  const [activeVariable, setActiveVariable] = useState<string | null>(null);
  const [mirrorStyle, setMirrorStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    const textarea = input.current;
    if (!textarea) return;
    function synchronize() {
      if (!textarea || !mirror.current) return;
      const style = getComputedStyle(textarea);
      setMirrorStyle({
        width: textarea.clientWidth,
        height: textarea.clientHeight,
        padding: style.padding,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontStyle: style.fontStyle,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        wordSpacing: style.wordSpacing,
        textIndent: style.textIndent,
        textAlign: style.textAlign as CSSProperties["textAlign"],
        tabSize: style.tabSize,
      });
      mirror.current.scrollTop = textarea.scrollTop;
      mirror.current.scrollLeft = textarea.scrollLeft;
    }
    synchronize();
    const observer = new ResizeObserver(synchronize);
    observer.observe(textarea);
    return () => observer.disconnect();
  }, [className]);

  useLayoutEffect(() => {
    setActiveVariable(null);
    if (mirror.current && input.current) {
      mirror.current.scrollTop = input.current.scrollTop;
      mirror.current.scrollLeft = input.current.scrollLeft;
    }
  }, [value]);

  function showValue(element: HTMLElement | undefined) {
    tooltipAnchor.current = element ?? null;
    setActiveVariable(element?.dataset.variable ?? null);
  }

  return (
    <div className="relative w-full min-w-0 flex-1">
      <InputGroupTextarea
        {...props}
        ref={(node) => {
          input.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        value={value}
        className={cn(className, mirrorStyle && "text-transparent caret-foreground")}
        onScroll={(event) => {
          if (mirror.current) {
            mirror.current.scrollTop = event.currentTarget.scrollTop;
            mirror.current.scrollLeft = event.currentTarget.scrollLeft;
          }
          setActiveVariable(null);
          onScroll?.(event);
        }}
        onMouseMove={(event) => {
          const tokens = mirror.current?.querySelectorAll<HTMLElement>("[data-variable]") ?? [];
          showValue([...tokens].find((token) => [...token.getClientRects()].some((rect) => (
            event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
          ))));
          onMouseMove?.(event);
        }}
        onMouseLeave={(event) => { setActiveVariable(null); onMouseLeave?.(event); }}
        onSelect={(event) => {
          const caret = event.currentTarget.selectionStart;
          const tokens = mirror.current?.querySelectorAll<HTMLElement>("[data-variable]") ?? [];
          showValue([...tokens].find((token) => caret > Number(token.dataset.start) && caret <= Number(token.dataset.end)));
          onSelect?.(event);
        }}
        onBlur={(event) => { setActiveVariable(null); onBlur?.(event); }}
      />
      <div
        ref={mirror}
        aria-hidden="true"
        className="pointer-events-none absolute start-0 top-0 overflow-hidden whitespace-pre-wrap break-words text-foreground"
        style={mirrorStyle ?? { visibility: "hidden" }}
      >
        {value.split(/(\{[a-z0-9_]+\})/gi).map((part, index, parts) => {
          const start = parts.slice(0, index).join("").length;
          const containsCaret = caretOffset !== undefined && caretOffset >= start
            && (caretOffset < start + part.length || (index === parts.length - 1 && caretOffset === start + part.length));
          const content = containsCaret ? <>
            {part.slice(0, caretOffset - start)}
            <span ref={caretAnchorRef} className="inline-block w-0 align-text-bottom" style={{ height: "1em" }} />
            {part.slice(caretOffset - start)}
          </> : part;
          return /^\{[a-z0-9_]+\}$/i.test(part)
            ? <span key={`${start}:${part}`} data-variable={part.slice(1, -1)} data-start={start} data-end={start + part.length} className="rounded-sm bg-primary/10 text-primary underline decoration-primary/30 underline-offset-2">{content}</span>
            : <span key={`text:${index}`}>{content}</span>;
        })}
        {"\u200b"}
      </div>
      <Tooltip
        triggerRef={tooltipAnchor}
        isOpen={!props.disabled && activeVariable !== null}
        onOpenChange={(open) => { if (!open) setActiveVariable(null); }}
        placement="top"
        className="whitespace-pre-wrap break-words"
      >
        {activeVariable ? variableValues?.[activeVariable]?.trim() || t("variableMessage.unavailable") : null}
      </Tooltip>
    </div>
  );
}
