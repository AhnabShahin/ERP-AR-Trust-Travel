import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';

// =====================================================================
// MoneyInput — a currency-aware number field.
//
// The ERP stores every monetary value in QAR (the base). This control lets a
// user type and read amounts in the *active display currency* while the value
// handed back to the form stays in QAR, so no submit/prefill logic has to
// change: a form that held a `priceQAR` number keeps holding a `priceQAR`
// number. When the active currency is QAR this is a plain number field.
//
// Usage: <MoneyInput valueQAR={priceQAR} onChangeQAR={setPriceQAR} />
// =====================================================================

export interface MoneyInputProps {
  /** The stored value in QAR (the base currency). */
  valueQAR: number;
  /** Called with the new value converted back to QAR. */
  onChangeQAR: (qar: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** Hide the currency-symbol prefix (e.g. when the label already shows it). */
  hideSymbol?: boolean;
  min?: number;
  required?: boolean;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  valueQAR,
  onChangeQAR,
  className = '',
  placeholder,
  disabled,
  id,
  hideSymbol,
  min = 0,
  required,
}) => {
  const { currency, convertAmount, toQAR } = useApp();

  // Local display string (in the active currency) so typing isn't fought by
  // float round-trips. Re-synced from the stored QAR value whenever the field
  // is not focused (covers edit-dialog prefill and external changes).
  const [display, setDisplay] = useState<string>('');
  const focused = useRef(false);

  const toDisplay = (qar: number): string => {
    if (!qar) return qar === 0 ? '' : '';
    const amt = convertAmount(qar, currency).amount;
    // Trim to at most 2 dp but drop trailing zeros for clean editing.
    return String(Math.round(amt * 100) / 100);
  };

  useEffect(() => {
    if (!focused.current) setDisplay(toDisplay(valueQAR));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueQAR, currency]);

  const symbol = convertAmount(0, currency).symbol;

  return (
    <div className="relative">
      {!hideSymbol && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-mono font-semibold text-slate-400 rtl:left-auto rtl:right-3">
          {symbol}
        </span>
      )}
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step="any"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={display}
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
          setDisplay(toDisplay(valueQAR));
        }}
        onChange={(e) => {
          const raw = e.target.value;
          setDisplay(raw);
          const parsed = parseFloat(raw);
          onChangeQAR(Number.isFinite(parsed) ? toQAR(parsed, currency) : 0);
        }}
        className={className + (!hideSymbol ? ' pl-10 rtl:pl-3 rtl:pr-10' : '')}
      />
    </div>
  );
};
