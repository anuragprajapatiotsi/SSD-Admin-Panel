import React from "react";
type Props = {
    tooltip: string;
    iconId: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    disabled?: boolean;
    selected?: boolean;
    children?: React.ReactNode;
};
declare const Button: React.FC<Props>;
export default Button;
