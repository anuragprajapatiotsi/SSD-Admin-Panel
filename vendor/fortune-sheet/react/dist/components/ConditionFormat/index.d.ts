import React from "react";
import "./index.css";
declare const ConditionalFormat: React.FC<{
    items: string[];
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>;
export default ConditionalFormat;
