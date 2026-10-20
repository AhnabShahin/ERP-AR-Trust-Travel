// =====================================================================
// Image uploads — optimized images stored as binary IN the database.
//
//   POST   /api/uploads        (auth)   { dataUri | base64, mime?, variant? }
//                                        -> { id, ref: "/api/uploads/<id>" }
//   GET    /api/uploads/:id     (public) streams the stored image bytes
//   DELETE /api/uploads/:id     (auth)   removes the row
//
// The reference handed back and persisted on records is host-less on purpose
// (just "/api/uploads/<id>"), so links don't break when the host changes.
// Images are re-optimized server-side with sharp: auto-rotated, downscaled to a
// sane cap for the variant, and re-encoded as WebP.
// =====================================================================

import { Router } from 'express';
import { z } from 'zod';
import sharp from 'sharp';
import { prisma } from '../../config/prisma.js';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler, HttpError } from '../../middleware/error.js';

export const uploadsRouter = Router();

// Max edge (px) per variant. Avatars are small; everything else is a photo.
const VARIANT_MAX_EDGE: Record<string, number> = {
  avatar: 512,
  default: 1600,
};

const postSchema = z.object({
  // Either a full data URI ("data:image/png;base64,....") or raw base64 + mime.
  dataUri: z.string().optional(),
  base64: z.string().optional(),
  mime: z.string().optional(),
  variant: z.string().optional(),
});

/** Extract the raw base64 payload from a data URI or a plain base64 string. */
function decodeImageInput(input: { dataUri?: string; base64?: string }): Buffer {
  let b64 = input.base64 ?? '';
  if (input.dataUri) {
    const match = input.dataUri.match(/^data:([^;]+);base64,(.*)$/s);
    if (!match) throw new HttpError(400, 'Invalid data URI');
    b64 = match[2];
  }
  if (!b64) throw new HttpError(400, 'No image data provided');
  const buf = Buffer.from(b64, 'base64');
  if (!buf.length) throw new HttpError(400, 'Empty image payload');
  // Guard against oversize payloads sneaking past the JSON limit.
  if (buf.length > 12 * 1024 * 1024) throw new HttpError(413, 'Image too large');
  return buf;
}

uploadsRouter.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const body = postSchema.parse(req.body);
    const input = decodeImageInput(body);

    const maxEdge = VARIANT_MAX_EDGE[body.variant ?? 'default'] ?? VARIANT_MAX_EDGE.default;

    let pipeline = sharp(input, { failOn: 'none' }).rotate(); // honour EXIF orientation
    const meta = await pipeline.metadata();
    if ((meta.width ?? 0) > maxEdge || (meta.height ?? 0) > maxEdge) {
      pipeline = pipeline.resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true });
    }
    const optimized = await pipeline.webp({ quality: 80 }).toBuffer({ resolveWithObject: true });

    const row = await prisma.upload.create({
      data: {
        mime: 'image/webp',
        bytes: new Uint8Array(optimized.data),
        width: optimized.info.width,
        height: optimized.info.height,
        size: optimized.info.size,
      },
      select: { id: true },
    });

    res.status(201).json({ ok: true, data: { id: row.id, ref: `/api/uploads/${row.id}` } });
  })
);

uploadsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const row = await prisma.upload.findUnique({ where: { id: req.params.id } });
    if (!row) throw new HttpError(404, 'Image not found');
    res.setHeader('Content-Type', row.mime);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Length', String(row.size));
    res.end(Buffer.from(row.bytes));
  })
);

uploadsRouter.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    // Best-effort: deleting an already-gone image is not an error.
    await prisma.upload.deleteMany({ where: { id: req.params.id } });
    res.json({ ok: true, data: { id: req.params.id } });
  })
);
