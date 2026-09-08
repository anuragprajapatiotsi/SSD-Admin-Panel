import React from "react";
type ContentEditableProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & {
    initialContent?: string;
    innerRef?: (e: HTMLDivElement | null) => void;
    onChange?: (html: string, isBlur?: boolean) => void;
    onBlur?: (e: React.FocusEvent<HTMLDivElement, Element>) => void;
    autoFocus?: boolean;
    allowEdit?: boolean;
};
declare const ContentEditable: React.FC<ContentEditableProps>;
export default ContentEditable;
