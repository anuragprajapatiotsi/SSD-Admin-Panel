export declare function useAlert(): {
    showAlert: (message: string, type?: "ok" | "yesno", onOk?: () => void, onCancel?: () => void) => void;
    hideAlert: () => void;
};
