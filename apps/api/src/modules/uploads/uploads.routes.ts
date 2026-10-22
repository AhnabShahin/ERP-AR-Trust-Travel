// =====================================================================
// Image uploads — optimized images stored as files on the backend disk.
//
//   POST   /api/uploads        (auth)   { dataUri | base64, mime?, variant? }
//                                        -> { id, ref: "/api/uploads/<id>" }
//   GET    /api/uploads/:id     (public) streams the stored image file
//   DELETE /api/uploads/:id     (auth)   removes the DB row AND the disk file
//
// Files live under UPLOAD_DIR (default <api>/uploads). The DB only keeps a
// host-less reference ("/api/uploads/<id>") plus the disk filename — never the
// host and never the bytes — so links survive a host change and the database
// stays small. `imgSrc` on the web side prepends the API origin at render time.
// Deleting or replacing an image unlinks the physical file, so the uploads
// folder does not grow with orphaned files.
// =====================================================================

import { Router } from 'express';
import { z } from 'zod';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { prisma } from '../../config/prisma.js';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler, HttpError } from '../../middleware/error.js';

export const uploadsRouter = Router();

/** Absolute directory where uploaded files are stored on disk. */
export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(process.cwd(), 'uploads');

/** Ensure the uploads directory exists before we try to write into it. */
async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

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

/** Resolve a stored filename to an absolute path, guarding against traversal. */
function resolveStoredPath(filename: string): string {
  const abs = path.resolve(UPLOAD_DIR, filename);
  if (abs !== UPLOAD_DIR && !abs.startsWith(UPLOAD_DIR + path.sep)) {
    throw new HttpError(400, 'Invalid file path');
  }
  return abs;
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

    // One id → one row → one file. Filename is the id so the file is easy to
    // locate from the host-less ref and to unlink on delete.
    const id = randomUUID();
    const filename = `${id}.webp`;

    await ensureUploadDir();
    await fs.writeFile(resolveStoredPath(filename), optimized.data);

    await prisma.upload.create({
      data: {
        id,
        mime: 'image/webp',
        path: filename,
        width: optimized.info.width,
        height: optimized.info.height,
        size: optimized.info.size,
      },
      select: { id: true },
    });

    res.status(201).json({ ok: true, data: { id, ref: `/api/uploads/${id}` } });
  })
);

uploadsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const row = await prisma.upload.findUnique({ where: { id: req.params.id } });
    if (!row) throw new HttpError(404, 'Image not found');

    let data: Buffer;
    try {
      data = await fs.readFile(resolveStoredPath(row.path));
    } catch {
      throw new HttpError(404, 'Image file missing');
    }

    res.setHeader('Content-Type', row.mime);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Length', String(data.length));
    res.end(data);
  })
);

uploadsRouter.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    // Remove the file from disk first (best-effort), then the DB row. Deleting
    // an already-gone image is not an error.
    const row = await prisma.upload.findUnique({ where: { id: req.params.id } });
    if (row) {
      try {
        await fs.unlink(resolveStoredPath(row.path));
      } catch {
        /* file already gone — fine */
      }
    }
    await prisma.upload.deleteMany({ where: { id: req.params.id } });
    res.json({ ok: true, data: { id: req.params.id } });
  })
);
