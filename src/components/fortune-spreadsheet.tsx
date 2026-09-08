import { defaultSettings, type Sheet } from "@fortune-sheet/core";
import { Workbook, type WorkbookInstance } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { applyWorkbookFont } from "@/utils/fortune-font";

const toolbarItems = defaultSettings.toolbarItems
  .filter((item) => item !== "font")
  .filter((item, index, items) => item !== "|" || (index > 0 && items[index - 1] !== "|" && index < items.length - 1));

export type FortuneSpreadsheetHandle = {
  getSnapshot: () => Sheet[];
  commitAndGetSnapshot: () => Promise<Sheet[]>;
  addRow: () => void;
  addColumn: () => void;
};

type FortuneSpreadsheetProps = {
  initialData: Sheet[];
  loadingFallback: ReactNode;
  onChange?: (snapshot: Sheet[]) => void;
  onDirty?: () => void;
  readOnly?: boolean;
  showToolbar?: boolean;
};

const FortuneSpreadsheetComponent = forwardRef<FortuneSpreadsheetHandle, FortuneSpreadsheetProps>(
  function FortuneSpreadsheet({ initialData, loadingFallback, onChange, onDirty, readOnly = false, showToolbar = true }, ref) {
    const workbookData = useMemo<Sheet[]>(
      () => applyWorkbookFont(initialData).map((sheet) => ({ ...sheet, zoomRatio: 0.9 })),
      [initialData],
    );
    const workbookRef = useRef<WorkbookInstance | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const latestDataRef = useRef(workbookData);
    const changeFrameRef = useRef(0);
    const resizeFrameRef = useRef(0);
    const [isReady, setIsReady] = useState(false);

    const getSnapshot = useCallback(() => {
      return workbookRef.current?.getAllSheets() ?? latestDataRef.current;
    }, []);

    const handleWorkbookChange = useCallback((snapshot: Sheet[]) => {
      latestDataRef.current = snapshot;
      setIsReady(true);
    }, []);

    const notifyWorkbookChange = useCallback(() => {
      if (changeFrameRef.current) window.cancelAnimationFrame(changeFrameRef.current);
      changeFrameRef.current = window.requestAnimationFrame(() => {
        changeFrameRef.current = 0;
        const snapshot = getSnapshot();
        latestDataRef.current = snapshot;
        onDirty?.();
        onChange?.(snapshot);
      });
    }, [getSnapshot, onChange, onDirty]);

    useEffect(() => () => {
      if (changeFrameRef.current) window.cancelAnimationFrame(changeFrameRef.current);
    }, []);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let previousWidth = container.clientWidth;
      let previousHeight = container.clientHeight;
      const resizeObserver = new ResizeObserver(([entry]) => {
        if (!entry) return;

        const { width, height } = entry.contentRect;
        if (width === previousWidth && height === previousHeight) return;
        previousWidth = width;
        previousHeight = height;

        if (resizeFrameRef.current) window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = window.requestAnimationFrame(() => {
          resizeFrameRef.current = 0;
          window.dispatchEvent(new Event("resize"));
        });
      });

      resizeObserver.observe(container);
      return () => {
        resizeObserver.disconnect();
        if (resizeFrameRef.current) window.cancelAnimationFrame(resizeFrameRef.current);
      };
    }, []);

    useImperativeHandle(ref, () => ({
      getSnapshot,
      commitAndGetSnapshot: async () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
        return getSnapshot();
      },
      addRow: () => {
        const selection = workbookRef.current?.getSelection()?.[0];
        const activeSheet = workbookRef.current?.getSheet();
        const row = selection?.row[1] ?? Math.max((activeSheet?.row ?? 1) - 1, 0);
        workbookRef.current?.insertRowOrColumn("row", row, 1, "rightbottom");
      },
      addColumn: () => {
        const selection = workbookRef.current?.getSelection()?.[0];
        const activeSheet = workbookRef.current?.getSheet();
        const column = selection?.column[1] ?? Math.max((activeSheet?.column ?? 1) - 1, 0);
        workbookRef.current?.insertRowOrColumn("column", column, 1, "rightbottom");
      },
    }), [getSnapshot]);

    return (
      <div
        ref={containerRef}
        className="relative isolate size-full min-h-0 min-w-0 flex-1 overflow-hidden [&_.fortune-stat-area]:hidden! [&_.luckysheet-bottom-controll-row]:hidden! [&_.fortune-sheet-container]:min-h-0 [&_.fortune-sheet-container]:flex-1 [&_.fortune-col-body]:min-h-0 [&_.fortune-sheet-area]:min-h-0"
        aria-busy={!isReady}
      >
        <div className={cn("size-full", !isReady && "invisible")}>
          <Workbook
            data={workbookData}
            toolbarItems={toolbarItems}
            allowEdit={!readOnly}
            showToolbar={!readOnly && showToolbar}
            showFormulaBar={!readOnly}
            {...(readOnly ? { cellContextMenu: [], headerContextMenu: [], sheetTabContextMenu: [] } : {})}
            ref={workbookRef}
            onChange={handleWorkbookChange}
            onOp={notifyWorkbookChange}
          />
        </div>
        {!isReady ? <div className="absolute inset-0">{loadingFallback}</div> : null}
      </div>
    );
  },
);

export const FortuneSpreadsheet = memo(FortuneSpreadsheetComponent);
