import { NumericInput } from './NumericInput';

export interface Column {
  key: string;
  header: string;
  align: 'left' | 'right' | 'center';
  width?: string;
  input?: boolean; // 入力セルかどうか
}

export interface Row {
  [key: string]: string | number | boolean | null | undefined;
  _isHeader?: boolean; // ヘッダー行として扱う
}

interface DataTableProps {
  columns: Column[];
  rows: Row[];
  values?: Record<string, number | null>;
  onValueChange?: (rowIndex: number, columnKey: string, value: number | null) => void;
}

export function DataTable({ columns, rows, values = {}, onValueChange }: DataTableProps) {
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const inputCells = document.querySelectorAll<HTMLInputElement>(
        '[data-cell-input="true"]'
      );
      const currentIndex = Array.from(inputCells).findIndex(
        (el) =>
          el.dataset.rowIndex === String(rowIndex) &&
          el.dataset.colIndex === String(colIndex)
      );

      if (e.shiftKey) {
        // Shift+Enter: 前のセルへ
        if (currentIndex > 0) {
          inputCells[currentIndex - 1].focus();
        }
      } else {
        // Enter: 次のセルへ
        if (currentIndex < inputCells.length - 1) {
          inputCells[currentIndex + 1].focus();
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-[var(--bk-border-strong)] bg-[var(--bk-surface)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2 text-xs font-semibold tracking-wide text-[var(--bk-text-muted)] border-r border-[var(--bk-border)] last:border-r-0 ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                }`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-[var(--bk-border)] hover:bg-[var(--bk-surface)] transition-colors ${
                row._isHeader ? 'bg-[var(--bk-surface)] font-semibold' : ''
              }`}
            >
              {columns.map((col, colIndex) => {
                const cellValue = row[col.key];
                const isInputCell = col.input && !row._isHeader;
                const valueKey = `${rowIndex}-${col.key}`;

                return (
                  <td
                    key={col.key}
                    className={`px-3 py-2 border-r border-[var(--bk-border)] last:border-r-0 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    }`}
                  >
                    {isInputCell ? (
                      <NumericInput
                        value={values[valueKey] ?? null}
                        onChange={(value) => onValueChange?.(rowIndex, col.key, value)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                        className="w-full"
                        placeholder=""
                      />
                    ) : typeof cellValue === 'number' ? (
                      <span className="font-mono tabular-nums">
                        {cellValue.toLocaleString('ja-JP')}
                      </span>
                    ) : (
                      cellValue
                    )}
                    {isInputCell && (
                      <input
                        type="hidden"
                        data-cell-input="true"
                        data-row-index={rowIndex}
                        data-col-index={colIndex}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
