import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { uploadImage, deleteImage, imgSrc, type UploadVariant } from '../../../lib/uploads';

// =====================================================================
// ImageUploadField — drag/drop + click image upload with preview, replace and
// remove. Optimizes in the browser, uploads to the DB-backed endpoint, and
// hands back the host-less ref via onChange. Used for avatars, vehicle/fleet,
// hotel and package photos.
// =====================================================================

export interface ImageUploadFieldProps {
  /** Current stored ref ("/api/uploads/<id>") or an external URL. */
  value?: string | null;
  /** Called with the new ref, or null when removed. */
  onChange: (ref: string | null) => void;
  variant?: UploadVariant;
  /** 'square' (default) or 'round' preview (avatars). */
  shape?: 'square' | 'round';
  label?: string;
  hint?: string;
  /** Optional ready-made images the user can pick instead of uploading. */
  presets?: { url: string; label?: string }[];
  className?: string;
  disabled?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  variant = 'default',
  shape = 'square',
  label,
  hint,
  presets,
  className = '',
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const hasImage = !!value;
  const preview = imgSrc(value);
  const rounded = shape === 'round' ? 'rounded-full' : 'rounded-2xl';

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || disabled) return;
    setError(null);
    setBusy(true);
    try {
      const prev = value;
      const ref = await uploadImage(file, variant);
      onChange(ref);
      // Replace: drop the old upload once the new one is saved.
      if (prev && prev !== ref) await deleteImage(prev);
    } catch (e) {
      setError((e as Error).message || 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (disabled) return;
    const prev = value;
    onChange(null);
    await deleteImage(prev);
  };

  const applyPreset = async (url: string) => {
    if (disabled) return;
    const prev = value;
    onChange(url);
    // A preset replaces any previously uploaded image we own.
    if (prev) await deleteImage(prev);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`relative flex items-center gap-4 p-3 border-2 border-dashed transition-colors ${rounded === 'rounded-full' ? 'rounded-2xl' : 'rounded-2xl'} ${
          dragOver
            ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40'
        }`}
      >
        {/* Preview / placeholder */}
        <div
          className={`relative w-20 h-20 shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center ${rounded}`}
        >
          {busy ? (
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          ) : hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={label || 'image'} className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-7 h-7 text-slate-400" />
          )}
        </div>

        {/* Actions */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={disabled || busy}
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {hasImage ? <RefreshCw className="w-3.5 h-3.5" /> : <ImagePlus className="w-3.5 h-3.5" />}
              <span>{hasImage ? 'Replace' : 'Upload image'}</span>
            </button>

            {hasImage && (
              <button
                type="button"
                disabled={disabled || busy}
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>

          <p className="mt-1.5 text-[11px] text-slate-400 leading-snug">
            {hint || 'Drag & drop or click. Auto-optimized and stored securely.'}
          </p>

          {error && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{error}</span>
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Optional presets */}
      {presets && presets.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.url}
              type="button"
              disabled={disabled || busy}
              onClick={() => applyPreset(p.url)}
              className={`w-10 h-10 overflow-hidden border-2 transition cursor-pointer ${rounded} ${
                value === p.url ? 'border-blue-500' : 'border-transparent hover:border-slate-300'
              }`}
              title={p.label || 'Preset'}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc(p.url)} alt={p.label || 'preset'} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
