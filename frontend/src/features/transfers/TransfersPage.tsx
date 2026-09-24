import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { useAuthStore } from '../../store/authStore';
import type { Base, EquipmentType, Transfer } from '../../types';

export const TransfersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [fromBaseId, setFromBaseId] = useState(user?.baseId || '');
  const [toBaseId, setToBaseId] = useState('');
  const [equipmentTypeId, setEquipmentTypeId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [filterBase, setFilterBase] = useState(user?.role === 'BASE_COMMANDER' && user?.baseId ? user.baseId : '');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    apiClient.get(ENDPOINTS.BASES).then(res => setBases(res.data.data)).catch(() => {});
    apiClient.get(ENDPOINTS.EQUIPMENT_TYPES).then(res => setEquipmentTypes(res.data.data)).catch(() => {});
  }, []);

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterBase) params.baseId = filterBase;
      if (filterStatus) params.status = filterStatus;
      const res = await apiClient.get(ENDPOINTS.TRANSFERS.BASE, { params });
      setTransfers(res.data.data);
    } catch (err) {
      console.error('Failed to load transfers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, [filterBase, filterStatus]);

  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromBaseId === toBaseId) {
      setMessage({ text: 'Source and destination base cannot be the same.', type: 'error' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await apiClient.post(ENDPOINTS.TRANSFERS.BASE, {
        fromBaseId: user?.role === 'BASE_COMMANDER' ? user.baseId : fromBaseId,
        toBaseId,
        equipmentTypeId,
        quantity: Number(quantity),
        notes,
      });
      setMessage({ text: 'Transfer request initiated successfully.', type: 'success' });
      setQuantity('');
      setToBaseId('');
      setNotes('');
      loadTransfers();
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || 'Failed to initiate transfer.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (transferId: string, action: 'approve' | 'complete' | 'cancel') => {
    try {
      let endpoint = '';
      if (action === 'approve') endpoint = ENDPOINTS.TRANSFERS.APPROVE(transferId);
      if (action === 'complete') endpoint = ENDPOINTS.TRANSFERS.COMPLETE(transferId);
      if (action === 'cancel') endpoint = ENDPOINTS.TRANSFERS.CANCEL(transferId);

      await apiClient.patch(endpoint);
      loadTransfers();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${action} transfer`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">PENDING</span>;
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">APPROVED</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">CANCELLED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inter-Base Asset Transfers</h1>
        <p className="text-xs text-slate-500">Initiate, approve, and track asset movements between military bases</p>
      </div>

      {message && (
        <div
          className={`p-3 rounded text-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Initiate Asset Transfer</h2>
        <form onSubmit={handleInitiateTransfer} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">From Base (Source)</label>
            <select
              value={user?.role === 'BASE_COMMANDER' ? user.baseId || '' : fromBaseId}
              onChange={(e) => setFromBaseId(e.target.value)}
              disabled={user?.role === 'BASE_COMMANDER'}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select Origin</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">To Base (Destination)</label>
            <select
              value={toBaseId}
              onChange={(e) => setToBaseId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select Destination</option>
              {bases
                .filter((b) => b.id !== (user?.role === 'BASE_COMMANDER' ? user.baseId : fromBaseId))
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Equipment</label>
            <select
              value={equipmentTypeId}
              onChange={(e) => setEquipmentTypeId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select Equipment</option>
              {equipmentTypes.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
              placeholder="Units to transfer"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block font-semibold text-slate-600 mb-1">Authorization Notes / Directive</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
              placeholder="e.g. Operation Northern Shield relocation"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded transition"
            >
              {submitting ? 'Initiating...' : 'Submit Transfer'}
            </button>
          </div>
        </form>
      </div>

      {/* History & Workflow List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Transfer Registry & Approvals</h2>
          <div className="flex gap-2">
            <select
              value={filterBase}
              onChange={(e) => setFilterBase(e.target.value)}
              disabled={user?.role === 'BASE_COMMANDER'}
              className="text-xs bg-white border border-slate-300 rounded px-2 py-1"
            >
              <option value="">All Bases</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded px-2 py-1"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">From</th>
                <th className="p-3">To</th>
                <th className="p-3">Equipment</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3">Status</th>
                <th className="p-3">Initiated By</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">Loading transfers...</td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">No transfer records found.</td>
                </tr>
              ) : (
                transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 font-medium text-slate-800">{t.fromBase?.name}</td>
                    <td className="p-3 font-medium text-slate-800">{t.toBase?.name}</td>
                    <td className="p-3">{t.equipmentType?.name}</td>
                    <td className="p-3 text-right font-bold">{t.quantity}</td>
                    <td className="p-3">{getStatusBadge(t.status)}</td>
                    <td className="p-3 text-slate-500">{t.initiatedBy?.name}</td>
                    <td className="p-3 text-right space-x-1">
                      {/* Admin or Base Commander can approve PENDING */}
                      {t.status === 'PENDING' && (user?.role === 'ADMIN' || user?.role === 'BASE_COMMANDER') && (
                        <button
                          onClick={() => handleStatusUpdate(t.id, 'approve')}
                          className="px-2 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-500 text-[10px]"
                        >
                          Approve
                        </button>
                      )}
                      {/* Once APPROVED, complete executes atomic debit/credit */}
                      {t.status === 'APPROVED' && (user?.role === 'ADMIN' || user?.role === 'BASE_COMMANDER' || user?.role === 'LOGISTICS_OFFICER') && (
                        <button
                          onClick={() => handleStatusUpdate(t.id, 'complete')}
                          className="px-2 py-1 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-500 text-[10px]"
                        >
                          Complete Transfer
                        </button>
                      )}
                      {/* Cancel action */}
                      {(t.status === 'PENDING' || t.status === 'APPROVED') && (user?.role === 'ADMIN' || user?.role === 'BASE_COMMANDER') && (
                        <button
                          onClick={() => handleStatusUpdate(t.id, 'cancel')}
                          className="px-2 py-1 bg-slate-200 text-slate-700 rounded font-medium hover:bg-red-100 hover:text-red-700 text-[10px]"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
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
