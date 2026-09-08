import React, { CSSProperties } from "react";
declare const Select: React.FC<{
    children?: React.ReactNode;
    style?: CSSProperties;
}>;
type OptionProps = {
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    iconId?: string;
    onMouseLeave?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseEnter?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};
declare const Option: React.FC<React.PropsWithChildren<OptionProps>>;
export { Option };
export default Select;
