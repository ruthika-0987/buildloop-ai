import React, { useState, useEffect } from 'react';
import { Shield, Users, Trash2, RotateCcw, Download, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useTranslation, t } from '../i18n';
import { User, UserRole } from '../types';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { clearSampleData, resetSampleData, exportAllData, events, batches, demands, orders } = useData();
  const { showSuccess, showError } = useToast();
  const { currentLanguage } = useTranslation();

  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (targetId: string, newRole: UserRole) => {
    setUpdatingUser(targetId);
    try {
      const res = await fetch(`/api/auth/users/${targetId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || 'Failed to update role');
      } else {
        showSuccess('User role updated successfully');
        fetchUsers();
      }
    } catch (err: any) {
      showError(err.message || 'Error updating role');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleClearSample = async () => {
    if (window.confirm('Are you sure you want to clear all sample data? Genuine user listings will remain.')) {
      await clearSampleData();
      showSuccess('Sample listings and orders removed.');
    }
  };

  const handleResetSample = async () => {
    if (window.confirm('Reset sample records to standard Hyderabad pilot seed data?')) {
      await resetSampleData();
      showSuccess('Sample data restored.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            System Administration
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
          Admin Control & Data Tools
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Manage empanelled civil inspectors, export database state, and manage demo records.
        </p>
      </div>

      {/* Database State Actions */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
        <h2 className="font-bold text-base text-stone-900 dark:text-stone-100">
          Database Management & Export
        </h2>
        <p className="text-xs text-stone-500">
          Current state: <strong>{batches.length}</strong> batches, <strong>{demands.length}</strong> demands, <strong>{orders.length}</strong> orders, <strong>{events.length}</strong> ledger events.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportAllData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{t("Export all data (JSON)")}</span>
          </button>

          <button
            onClick={handleClearSample}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold transition"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span>{t("Clear sample data")}</span>
          </button>

          <button
            onClick={handleResetSample}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t("Reset sample data")}</span>
          </button>
        </div>
      </div>

      {/* User Management & Inspector Granting */}
      <section className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-base text-stone-900 dark:text-stone-100">
              {t("User Management")} & Inspector Privileges
            </h2>
          </div>
          <span className="text-xs text-stone-400 font-mono">{usersList.length} registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 text-stone-500">
              <tr>
                <th className="py-2.5 px-3">Name & Email</th>
                <th className="py-2.5 px-3">Current Role</th>
                <th className="py-2.5 px-3">Language</th>
                <th className="py-2.5 px-3">Assign Role (Admin Only)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                  <td className="py-3 px-3">
                    <strong className="text-stone-900 dark:text-stone-100 block">{u.name}</strong>
                    <span className="text-[11px] text-stone-400">{u.email}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : u.role === 'inspector'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 uppercase text-stone-500 font-mono">{u.language}</td>
                  <td className="py-3 px-3">
                    <select
                      value={u.role}
                      disabled={updatingUser === u.id}
                      onChange={e => handleUpdateRole(u.id, e.target.value as UserRole)}
                      className="px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold"
                    >
                      <option value="seller">Seller</option>
                      <option value="buyer">Buyer</option>
                      <option value="both">Both (Buyer & Seller)</option>
                      <option value="inspector">Civil Inspector (L3 Signoff)</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Audit Log Viewer */}
      <section className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <Clock className="w-5 h-5 text-stone-500" />
          <h2 className="font-bold text-base text-stone-900 dark:text-stone-100">
            System Ledger Audit Trail
          </h2>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {events.slice(0, 15).map(e => (
            <div
              key={e.id}
              className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 text-xs flex items-center justify-between gap-3"
            >
              <div>
                <span className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[10px] bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                  {e.eventType}
                </span>
                <span className="ml-2 font-mono text-stone-600 dark:text-stone-300">
                  {e.quantity > 0 ? `${e.quantity} ${e.unit}` : ''}
                </span>
                <p className="text-stone-500 text-[11px] mt-0.5">{e.notes}</p>
              </div>
              <div className="text-right text-[10px] text-stone-400 shrink-0">
                <span>{new Date(e.timestamp).toLocaleTimeString()}</span>
                <div className="font-medium text-stone-500">{e.actorName}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
