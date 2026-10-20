import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// =====================================================================
// QrCodeImage — renders a real, scannable QR code for `value` as a PNG data
// URL. Used by the voucher pass. The payload is whatever string is passed in
// (typically a verification URL), so any standard scanner can read it.
// =====================================================================

export interface QrCodeImageProps {
  value: string;
  size?: number;
  className?: string;
  /** Dark module color (default near-black). */
  dark?: string;
  /** Light background color (default white). */
  light?: string;
}

export const QrCodeImage: React.FC<QrCodeImageProps> = ({
  value,
  size = 180,
  className = '',
  dark = '#05161D',
  light = '#ffffff',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value || ' ', {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: size * 2, // render at 2x for crisp scaling/printing
      color: { dark, light },
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size, dark, light]);

  if (error || !dataUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-[10px] text-slate-400 ${className}`}
        style={{ width: size, height: size }}
      >
        {error ? 'QR error' : '…'}
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="QR code" width={size} height={size} className={className} />;
};
