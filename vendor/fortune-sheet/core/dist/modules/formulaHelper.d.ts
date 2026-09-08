import { CellMatrix, Context, FormulaCell } from "..";
export declare function setFormulaCellInfo(ctx: Context, formulaCell: FormulaCell, data?: CellMatrix): void;
export declare function executeAffectedFormulas(ctx: Context, formulaRunList: any[], calcChains: any): void;
export declare function getFormulaRunList(updateValueArray: any[], formulaCellInfoMap: any): any[];
export declare const arrayMatch: (arrayMatchCache: any, formulaDependency: any, _formulaCellInfoMap: any, _updateValueObjects: any, func: any) => void;
