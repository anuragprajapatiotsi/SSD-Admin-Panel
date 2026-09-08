import { CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { HighlightedVariableTextarea } from "@/components/common/highlighted-variable-textarea";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupText } from "@/components/ui/input-group";
import { Popover } from "@/components/ui/popover";
import { Tooltip } from "@/components/ui/tooltip";
import { useId, useRef, useState, type ReactNode, type Ref } from "react";
import { useTranslation } from "react-i18next";

type VariableMessageInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  variables: readonly string[];
  variableValues?: Readonly<Record<string, string | undefined>>;
  label: string;
  icon?: ReactNode;
  name?: string;
  inputRef?: Ref<HTMLTextAreaElement>;
  onBlur?: () => void;
  disabled?: boolean;
  errorMessage?: string;
};

/** Inserts literal {variable} tokens; resolving their values belongs to the sender. */
export function VariableMessageInput({ value, onValueChange, variables, variableValues, label, icon, name, inputRef, onBlur, disabled, errorMessage }: VariableMessageInputProps) {
  const { t } = useTranslation("common");
  const id = useId();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const caretAnchor = useRef<HTMLSpanElement>(null);
  const composing = useRef(false);
  const tooltipAnchor = useRef<Element | null>(null);
  const [previewVariable, setPreviewVariable] = useState<string | null>(null);
  const [query, setQuery] = useState<{ start: number; end: number; term: string; text: string } | null>(null);
  const [focusSuggestions, setFocusSuggestions] = useState(false);
  const options = [...new Set(variables)].filter((variable) => variable.toLowerCase().includes(query?.term.toLowerCase() ?? ""));
  const open = !disabled && query !== null && query.text === value;

  function updateQuery(input: HTMLTextAreaElement) {
    const { selectionStart: end, selectionEnd, value: text } = input;
    const match = selectionEnd === end ? /(?:^|\s)\/([a-z0-9_]*)$/i.exec(text.slice(0, end)) : null;
    setQuery(match ? { start: end - match[1].length - 1, end, term: match[1], text } : null);
    setFocusSuggestions(false);
    setPreviewVariable(null);
  }

  function insertVariable(variable: string) {
    if (!query || query.text !== value || disabled) return;
    const token = `{${variable}}`;
    const caret = query.start + token.length;
    onValueChange(value.slice(0, query.start) + token + value.slice(query.end));
    setQuery(null);
    setPreviewVariable(null);
    requestAnimationFrame(() => {
      textarea.current?.focus();
      textarea.current?.setSelectionRange(caret, caret);
    });
  }

  return (
    <Field data-invalid={Boolean(errorMessage)} data-disabled={disabled}>
      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>{icon}{label}</InputGroupText>
        </InputGroupAddon>
        <HighlightedVariableTextarea
          variableValues={variableValues}
          caretOffset={open ? query.end : undefined}
          caretAnchorRef={caretAnchor}
          ref={(node) => {
            textarea.current = node;
            if (typeof inputRef === "function") inputRef(node);
            else if (inputRef) inputRef.current = node;
          }}
          name={name}
          value={value}
          disabled={disabled}
          className="min-h-36 resize-y"
          aria-label={label}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={`${id}-hint${errorMessage ? ` ${id}-error` : ""}`}
          aria-haspopup="menu"
          aria-controls={open ? `${id}-suggestions` : undefined}
          onBlur={onBlur}
          onChange={(event) => {
            onValueChange(event.target.value);
            if (!composing.current) updateQuery(event.target);
          }}
          onClick={(event) => updateQuery(event.currentTarget)}
          onScroll={() => { setQuery(null); setPreviewVariable(null); }}
          onCompositionStart={() => { composing.current = true; setQuery(null); }}
          onCompositionEnd={(event) => { composing.current = false; updateQuery(event.currentTarget); }}
          onKeyUp={(event) => {
            if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) updateQuery(event.currentTarget);
          }}
          onKeyDown={(event) => {
            if (!open || event.nativeEvent.isComposing) return;
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              setQuery(null);
            } else if (event.key === "ArrowDown" && options.length) {
              event.preventDefault();
              setFocusSuggestions(true);
            } else if (event.key === "Enter" && !event.shiftKey && options.length) {
              event.preventDefault();
              insertVariable(options[0]);
            } else if (event.key === "Tab") setQuery(null);
          }}
        />
      </InputGroup>
      <FieldDescription id={`${id}-hint`}>{t("variableMessage.hint")}</FieldDescription>
      {errorMessage ? <FieldError id={`${id}-error`}>{errorMessage}</FieldError> : null}
      <Popover
        key={open ? `${query.start}:${query.end}` : "closed"}
        triggerRef={caretAnchor}
        isOpen={open}
        onOpenChange={(nextOpen) => { if (!nextOpen) setQuery(null); }}
        isNonModal
        shouldCloseOnInteractOutside={(element) => element !== textarea.current}
        placement="bottom start"
        className="max-w-full data-entering:animate-none"
      >
        {options.length ? (
          <CommandList
            key={focusSuggestions ? "keyboard" : "typing"}
            id={`${id}-suggestions`}
            aria-label={t("variableMessage.variables")}
            autoFocus={focusSuggestions ? "first" : false}
            onAction={(key) => insertVariable(String(key))}
          >
            <CommandGroup heading={t("variableMessage.variables")}>
              {options.map((variable) => (
                <CommandItem
                  key={variable}
                  id={variable}
                  textValue={variable}
                  aria-describedby={previewVariable === variable ? `${id}-value` : undefined}
                  onHoverStart={(event) => {
                    tooltipAnchor.current = event.target;
                    setPreviewVariable(variable);
                  }}
                  onHoverEnd={() => setPreviewVariable(null)}
                  onFocus={(event) => {
                    tooltipAnchor.current = event.currentTarget;
                    setPreviewVariable(variable);
                  }}
                  onBlur={() => setPreviewVariable(null)}
                >
                  <span className="font-mono font-medium text-primary">{`{${variable}}`}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        ) : <CommandEmpty>{t("variableMessage.empty")}</CommandEmpty>}
        <Tooltip
          triggerRef={tooltipAnchor}
          isOpen={open && previewVariable !== null}
          onOpenChange={(nextOpen) => { if (!nextOpen) setPreviewVariable(null); }}
          placement="right"
          className="whitespace-pre-wrap break-words"
        >
          <span id={`${id}-value`}>
            {previewVariable ? variableValues?.[previewVariable]?.trim() || t("variableMessage.unavailable") : null}
          </span>
        </Tooltip>
      </Popover>
    </Field>
  );
}
