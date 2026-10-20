// =====================================================================
// Client helpers for the DB-backed image upload endpoint.
//
// Images are downscaled/compressed in the browser (canvas) before upload to
// save bandwidth; the server re-optimizes with sharp and stores the bytes.
// The value stored on records is the host-less ref the server returns
// ("/api/uploads/<id>"); `imgSrc` resolves it against the API origin only at
// render time, so the DB never holds a host name.
// =====================================================================

import { api } from './api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type UploadVariant = 'avatar' | 'default';

const VARIANT_MAX_EDGE: Record<UploadVariant, number> = {
  avatar: 512,
  default: 1600,
};

/** Resolve a stored image reference to a loadable URL at render time. */
export function imgSrc(ref?: string | null): string {
  if (!ref) return '';
  // Host-less API refs get the API origin; absolute URLs / data URIs pass through.
  if (ref.startsWith('/api/uploads/')) return `${BASE_URL}${ref}`;
  return ref;
}

/** True when a value is one of our managed upload refs (vs an external URL). */
export function isUploadRef(ref?: string | null): boolean {
  return !!ref && ref.startsWith('/api/uploads/');
}

/** Downscale + compress an image File in the browser, returning a data URI. */
async function optimizeInBrowser(file: File, variant: UploadVariant): Promise<string> {
  const maxEdge = VARIANT_MAX_EDGE[variant];
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Could not decode image'));
    el.src = dataUrl;
  });

  let { width, height } = img;
  if (width > maxEdge || height > maxEdge) {
    const scale = Math.min(maxEdge / width, maxEdge / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl; // no canvas → let the server optimize the original
  ctx.drawImage(img, 0, 0, width, height);
  // Prefer WebP; browsers that can't encode it fall back to JPEG.
  const out = canvas.toDataURL('image/webp', 0.82);
  return out.startsWith('data:image/webp') ? out : canvas.toDataURL('image/jpeg', 0.85);
}

/** Optimize + upload a file; resolves to the host-less ref to persist. */
export async function uploadImage(file: File, variant: UploadVariant = 'default'): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file');
  const dataUri = await optimizeInBrowser(file, variant);
  const { ref } = await api.post<{ id: string; ref: string }>('/api/uploads', { dataUri, variant });
  return ref;
}

/** Delete an uploaded image by its ref (no-op for external URLs). */
export async function deleteImage(ref?: string | null): Promise<void> {
  if (!isUploadRef(ref)) return;
  const id = ref!.replace('/api/uploads/', '');
  try {
    await api.delete(`/api/uploads/${id}`);
  } catch {
    /* best-effort cleanup */
  }
}
