import { useState, useEffect } from 'react';

interface NumericInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export function NumericInput({
  value,
  onChange,
  onKeyDown,
  placeholder = '0',
  className = '',
}: NumericInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === null || value === undefined) {
      setDisplayValue('');
    } else {
      // 桁区切りフォーマット
      setDisplayValue(value.toLocaleString('ja-JP'));
    }
  }, [value]);

  const normalizeInput = (input: string): string => {
    // 全角→半角変換
    let normalized = input.replace(/[０-９]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) - 0xfee0)
    );
    // カンマ、円記号、スペースを除去
    normalized = normalized.replace(/[,¥\s]/g, '');
    // △をマイナスに変換
    normalized = normalized.replace(/△/g, '-');
    return normalized;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const normalized = normalizeInput(input);

    // 空欄の場合
    if (normalized === '' || normalized === '-') {
      setDisplayValue(normalized);
      onChange(null);
      return;
    }

    // 数値に変換
    const numValue = parseFloat(normalized);
    if (!isNaN(numValue)) {
      onChange(numValue);
    } else {
      // 無効な入力は無視
      setDisplayValue(displayValue);
    }
  };

  const handleBlur = () => {
    // フォーカスが外れたら桁区切りフォーマットを適用
    if (value !== null && value !== undefined) {
      setDisplayValue(value.toLocaleString('ja-JP'));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // フォーカス時は桁区切りを解除
    if (value !== null && value !== undefined) {
      setDisplayValue(String(value));
    }
    e.target.select();
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={`border border-[var(--bk-border)] rounded px-3 py-2 text-right font-mono tabular-nums focus:outline-none focus:border-[var(--bk-accent)] hover:border-[var(--bk-border-strong)] transition-colors ${className}`}
    />
  );
}
