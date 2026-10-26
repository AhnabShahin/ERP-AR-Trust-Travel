'use client';

// =====================================================================
// Drivers — managed as USER accounts with the driver-guide role (drivers
// live in the users table). Dedicated CRUD menu for this role, backed by
// /api/users. Each driver can be linked to fleet vehicles (shown here).
// =====================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Save, Loader2, Car, Pencil, X, Phone, CircleCheck, CircleSlash } from 'lucide-react';
import { api } from '../../../lib/api';
import type { UserAccount, FleetVehicle } from '../../types';

const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');

interface DriverForm {
  id?: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  department: string;
  password: string;
  status: 'active' | 'inactive';
}

const blank = (): DriverForm => ({ name: '', username: '', email: '', phone: '', department: 'Chauffeur Fleet & Transfers', password: '', status: 'active' });

export function DriversManagerView() {
  const [drivers, setDrivers] = useState<UserAccount[]>([]);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<DriverForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [users, fleet] = await Promise.all([
        api.get<UserAccount[]>('/api/users'),
        api.get<FleetVehicle[]>('/api/fleet?take=200').catch(() => []),
      ]);
      setDrivers((Array.isArray(users) ? users : []).filter((u) => u.role === 'driver-guide'));
      setVehicles(Array.isArray(fleet) ? fleet : []);
    } catch {
      setMsg('Failed to load drivers.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const vehiclesFor = (id: string) => vehicles.filter((v) => v.assignedDriverId === id);

  const startEdit = (u: UserAccount) =>
    setEditing({ id: u.id, name: u.name, username: u.username, email: u.email, phone: u.phone || '', department: u.department || '', password: '', status: u.status });

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) { setMsg('Name is required.'); return; }
    setSaving(true); setMsg('');
    try {
      if (editing.id) {
        await api.patch(`/api/users/${editing.id}`, {
          name: editing.name, phone: editing.phone, department: editing.department, status: editing.status,
          ...(editing.password ? { password: editing.password } : {}),
        });
      } else {
        const username = (editing.username || slug(editing.name)).toLowerCase();
        const email = editing.email || `${username}@artrust.qa`;
        const created = await api.post<UserAccount>('/api/users', {
          name: editing.name, username, email, phone: editing.phone,
          department: editing.department, role: 'driver-guide', password: editing.password || 'Driver@2026',
        });
        // New accounts start inactive — activate when requested.
        if (editing.status === 'active' && created?.id) {
          await api.patch(`/api/users/${created.id}`, { status: 'active' });
        }
      }
      setEditing(null);
      await load();
    } catch (e) {
      setMsg(`Save failed: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this driver account?')) return;
    try { await api.delete(`/api/users/${id}`); await load(); } catch (e) { setMsg(`Delete failed: ${(e as Error).message}`); }
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white';

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-cyan-500" /> Drivers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chauffeur accounts (user role: driver-guide), linked to fleet vehicles.</p>
        </div>
        <button onClick={() => setEditing(blank())} className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add driver
        </button>
      </div>

      {msg && <div className="text-xs font-medium px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{msg}</div>}

      {loading ? (
        <div className="py-20 flex justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {drivers.map((d) => {
            const vs = vehiclesFor(d.id);
            return (
              <div key={d.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{d.name}</p>
                    <p className="text-[11px] text-slate-400">@{d.username}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${d.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {d.status === 'active' ? <CircleCheck className="w-3 h-3" /> : <CircleSlash className="w-3 h-3" />} {d.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  {d.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {d.phone}</p>}
                  <p className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-slate-400" />
                    {vs.length ? vs.map((v) => `${v.name}${v.plateNumber ? ` (${v.plateNumber})` : ''}`).join(', ') : <span className="text-slate-400">No vehicle linked</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <button onClick={() => startEdit(d)} className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 flex items-center gap-1"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => remove(d.id)} className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            );
          })}
          {drivers.length === 0 && <div className="col-span-full py-10 text-center text-sm text-slate-500">No drivers yet. Add one, or run the seed.</div>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">{editing.id ? 'Edit driver' : 'Add driver'}</h2>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <L label="Full name *"><input className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></L>
              {!editing.id && (
                <div className="grid grid-cols-2 gap-3">
                  <L label="Username"><input className={inputCls} value={editing.username} onChange={(e) => setEditing({ ...editing, username: e.target.value })} placeholder="auto from name" /></L>
                  <L label="Email"><input className={inputCls} value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} placeholder="auto @artrust.qa" /></L>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <L label="Phone"><input className={inputCls} value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} placeholder="+974…" /></L>
                <L label="Status">
                  <select className={inputCls} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as 'active' | 'inactive' })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </L>
              </div>
              <L label="Department"><input className={inputCls} value={editing.department} onChange={(e) => setEditing({ ...editing, department: e.target.value })} /></L>
              <L label={editing.id ? 'New password (leave blank to keep)' : 'Password'}><input className={inputCls} type="text" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} placeholder={editing.id ? '' : 'Driver@2026'} /></L>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 flex items-center gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
              </button>
              <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      {children}
    </div>
  );
}
