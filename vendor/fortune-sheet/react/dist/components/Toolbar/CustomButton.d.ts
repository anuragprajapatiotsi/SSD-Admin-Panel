import React from "react";
type Props = {
    tooltip?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    selected?: boolean;
    children?: React.ReactNode;
    iconName?: string;
    icon?: React.ReactNode;
};
declare const CustomButton: React.FC<Props>;
export default CustomButton;
