import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import type { AuditLog } from '../../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [entityFilter, setEntityFilter] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (entityFilter) params.entityType = entityFilter;
      const res = await apiClient.get(ENDPOINTS.AUDIT_LOGS, { params });
      setLogs(res.data.data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [entityFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Security & Transaction Audit Logs</h1>
        <p className="text-xs text-slate-500">Immutable ledger of system events, logins, and inventory mutations</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">System Event Log</h2>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1"
          >
            <option value="">All Entities</option>
            <option value="PURCHASE">PURCHASE</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="ASSIGNMENT">ASSIGNMENT</option>
            <option value="EXPENDITURE">EXPENDITURE</option>
            <option value="AUTH">AUTH</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Method & Path</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">Loading audit records...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">No audit events recorded.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 font-sans">
                    <td className="p-3 font-mono text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-3 font-medium text-slate-800">{log.user?.email || 'SYSTEM'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-amber-700">{log.entityType}</td>
                    <td className="p-3 font-mono text-slate-600">{log.method} {log.path}</td>
                    <td className="p-3 font-mono text-slate-400">{log.ip || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
