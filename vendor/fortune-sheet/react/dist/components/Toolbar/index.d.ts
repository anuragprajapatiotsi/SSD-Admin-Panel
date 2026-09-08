import React from "react";
import "./index.css";
declare const Toolbar: React.FC<{
    setMoreItems: React.Dispatch<React.SetStateAction<React.ReactNode>>;
    moreItemsOpen: boolean;
}>;
export default Toolbar;
