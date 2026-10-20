'use client';

import React from 'react';
import { UserCheck } from 'lucide-react';
import type { AuditMeta } from '../../types';

// Renders "Updated by <name> · <when>" from a record's audit metadata, with the
// created-by shown on hover. Falls back gracefully when the fields are absent
// (older rows written before audit tracking existed).
export const LastUpdatedBy: React.FC<{
  record: AuditMeta | null | undefined;
  className?: string;
}> = ({ record, className = '' }) => {
  if (!record) return null;
  const { updatedByName, updatedAt, createdByName, createdAt } = record;
  if (!updatedByName && !createdByName) return null;

  const when = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleString();
  };

  const title = createdByName
    ? `Created by ${createdByName}${createdAt ? ` · ${when(createdAt)}` : ''}`
    : undefined;

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 ${className}`}
    >
      <UserCheck className="w-3 h-3" />
      <span>
        {updatedByName
          ? `Updated by ${updatedByName}`
          : `Created by ${createdByName}`}
        {updatedAt ? ` · ${when(updatedAt)}` : ''}
      </span>
    </span>
  );
};
