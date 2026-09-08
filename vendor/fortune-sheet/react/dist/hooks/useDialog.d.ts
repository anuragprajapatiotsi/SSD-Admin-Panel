import React from "react";
export declare function useDialog(): {
    showDialog: (content: string | React.ReactNode, type?: "ok" | "yesno", onOk?: () => void, onCancel?: () => void) => void;
    hideDialog: () => void;
};
