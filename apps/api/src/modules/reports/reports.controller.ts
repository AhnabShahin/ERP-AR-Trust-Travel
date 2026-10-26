import type { Request, Response } from 'express';
import * as service from './reports.service.js';

const dateParam = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;
};

export async function overview(req: Request, res: Response) {
  const data = await service.overview({
    from: dateParam(req.query.from),
    to: dateParam(req.query.to),
  });
  res.json({ ok: true, data });
}
