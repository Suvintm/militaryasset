import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { useAuthStore } from '../../store/authStore';
import type { Base, EquipmentType, Purchase } from '../../types';

export const PurchasesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [baseId, setBaseId] = useState(user?.baseId || '');
  const [equipmentTypeId, setEquipmentTypeId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [supplier, setSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [filterBase, setFilterBase] = useState(user?.role === 'BASE_COMMANDER' && user?.baseId ? user.baseId : '');
  const [filterEquipment, setFilterEquipment] = useState('');

  useEffect(() => {
    apiClient.get(ENDPOINTS.BASES).then(res => setBases(res.data.data)).catch(() => {});
    apiClient.get(ENDPOINTS.EQUIPMENT_TYPES).then(res => setEquipmentTypes(res.data.data)).catch(() => {});
  }, []);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterBase) params.baseId = filterBase;
      if (filterEquipment) params.equipmentTypeId = filterEquipment;
      const res = await apiClient.get(ENDPOINTS.PURCHASES, { params });
      setPurchases(res.data.data);
    } catch (err) {
      console.error('Failed to load purchases', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, [filterBase, filterEquipment]);

  const handleRecordPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await apiClient.post(ENDPOINTS.PURCHASES, {
        baseId: user?.role === 'BASE_COMMANDER' ? user.baseId : baseId,
        equipmentTypeId,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        supplier,
        purchaseDate: new Date(purchaseDate).toISOString(),
        notes,
      });
      setMessage({ text: 'Purchase recorded successfully and stock updated.', type: 'success' });
      setQuantity('');
      setUnitPrice('');
      setSupplier('');
      setNotes('');
      loadPurchases();
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || 'Failed to record purchase.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Asset Purchases</h1>
        <p className="text-xs text-slate-500">Record asset acquisition and view purchase history</p>
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

      {/* Record Purchase Form */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Record New Purchase</h2>
        <form onSubmit={handleRecordPurchase} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Destination Base</label>
            <select
              value={user?.role === 'BASE_COMMANDER' ? user.baseId || '' : baseId}
              onChange={(e) => setBaseId(e.target.value)}
              disabled={user?.role === 'BASE_COMMANDER'}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select Base</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Equipment Type</label>
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
              placeholder="e.g. 50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Unit Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
              placeholder="e.g. 1200.00"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Supplier</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
              placeholder="e.g. Defense Dynamics Ltd"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Purchase Date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded transition"
            >
              {submitting ? 'Recording...' : 'Record Purchase'}
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Purchase History</h2>
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
              value={filterEquipment}
              onChange={(e) => setFilterEquipment(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded px-2 py-1"
            >
              <option value="">All Equipment</option>
              {equipmentTypes.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Base</th>
                <th className="p-3">Equipment</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Loading records...
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No purchase records found.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                    <td className="p-3 font-medium text-slate-900">{p.base?.name}</td>
                    <td className="p-3">{p.equipmentType?.name}</td>
                    <td className="p-3 text-right font-semibold text-emerald-600">+{p.quantity}</td>
                    <td className="p-3 text-right font-mono">${Number(p.unitPrice).toFixed(2)}</td>
                    <td className="p-3">{p.supplier}</td>
                    <td className="p-3 text-slate-500">{p.recordedBy?.name || 'Logistics'}</td>
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
