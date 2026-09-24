import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { useAuthStore } from '../../store/authStore';
import type { Base, EquipmentType, Assignment, Expenditure } from '../../types';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'assignments' | 'expenditures'>('assignments');
  const [bases, setBases] = useState<Base[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  
  // Assignments state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [personnelName, setPersonnelName] = useState('');
  const [personnelId, setPersonnelId] = useState('');
  const [assignBaseId, setAssignBaseId] = useState(user?.baseId || '');
  const [assignEquipmentId, setAssignEquipmentId] = useState('');
  const [assignQty, setAssignQty] = useState<number | ''>('');
  const [assignNotes, setAssignNotes] = useState('');

  // Expenditures state
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [expendBaseId, setExpendBaseId] = useState(user?.baseId || '');
  const [expendEquipmentId, setExpendEquipmentId] = useState('');
  const [expendQty, setExpendQty] = useState<number | ''>('');
  const [expendReason, setExpendReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    apiClient.get(ENDPOINTS.BASES).then(res => setBases(res.data.data)).catch(() => {});
    apiClient.get(ENDPOINTS.EQUIPMENT_TYPES).then(res => setEquipmentTypes(res.data.data)).catch(() => {});
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (user?.role === 'BASE_COMMANDER' && user?.baseId) params.baseId = user.baseId;
      const res = await apiClient.get(ENDPOINTS.ASSIGNMENTS.BASE, { params });
      setAssignments(res.data.data);
    } catch (err) {
      console.error('Failed to load assignments', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenditures = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (user?.role === 'BASE_COMMANDER' && user?.baseId) params.baseId = user.baseId;
      const res = await apiClient.get(ENDPOINTS.EXPENDITURES, { params });
      setExpenditures(res.data.data);
    } catch (err) {
      console.error('Failed to load expenditures', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'assignments') {
      loadAssignments();
    } else {
      loadExpenditures();
    }
  }, [activeTab]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await apiClient.post(ENDPOINTS.ASSIGNMENTS.BASE, {
        baseId: user?.role === 'BASE_COMMANDER' ? user.baseId : assignBaseId,
        equipmentTypeId: assignEquipmentId,
        personnelName,
        personnelId,
        quantity: Number(assignQty),
        notes: assignNotes,
      });
      setMessage({ text: 'Asset successfully assigned to personnel.', type: 'success' });
      setPersonnelName('');
      setPersonnelId('');
      setAssignQty('');
      setAssignNotes('');
      loadAssignments();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Assignment failed.', type: 'error' });
    }
  };

  const handleReturnAsset = async (assignmentId: string) => {
    try {
      await apiClient.patch(ENDPOINTS.ASSIGNMENTS.RETURN(assignmentId));
      loadAssignments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark asset returned.');
    }
  };

  const handleCreateExpenditure = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await apiClient.post(ENDPOINTS.EXPENDITURES, {
        baseId: user?.role === 'BASE_COMMANDER' ? user.baseId : expendBaseId,
        equipmentTypeId: expendEquipmentId,
        quantity: Number(expendQty),
        reason: expendReason,
      });
      setMessage({ text: 'Expenditure recorded successfully.', type: 'success' });
      setExpendQty('');
      setExpendReason('');
      loadExpenditures();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Expenditure recording failed.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Personnel Assignments & Expenditures</h1>
        <p className="text-xs text-slate-500">Track assigned weapon/gear custodian status and consumed munitions</p>
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'assignments'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Assignments (Custody)
        </button>
        <button
          onClick={() => setActiveTab('expenditures')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'expenditures'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Expenditures (Consumed / Expended)
        </button>
      </div>

      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* New Assignment Form */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Assign Asset to Personnel</h2>
            <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Base</label>
                <select
                  value={user?.role === 'BASE_COMMANDER' ? user.baseId || '' : assignBaseId}
                  onChange={(e) => setAssignBaseId(e.target.value)}
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
                <label className="block font-semibold text-slate-600 mb-1">Equipment</label>
                <select
                  value={assignEquipmentId}
                  onChange={(e) => setAssignEquipmentId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">Select Equipment</option>
                  {equipmentTypes.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={assignQty}
                  onChange={(e) => setAssignQty(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
                  placeholder="Units"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Personnel Name</label>
                <input
                  type="text"
                  value={personnelName}
                  onChange={(e) => setPersonnelName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. Sgt. John Miller"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Service Number / Badge ID</label>
                <input
                  type="text"
                  value={personnelId}
                  onChange={(e) => setPersonnelId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. MIL-88219"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Notes</label>
                <input
                  type="text"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
                  placeholder="Deployment directive"
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded transition"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>

          {/* Assignments Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Assignments Registry</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Assigned Date</th>
                    <th className="p-3">Base</th>
                    <th className="p-3">Personnel</th>
                    <th className="p-3">Service ID</th>
                    <th className="p-3">Equipment</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400">Loading assignments...</td>
                    </tr>
                  ) : assignments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400">No active assignments recorded.</td>
                    </tr>
                  ) : (
                    assignments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="p-3">{new Date(a.assignedAt).toLocaleDateString()}</td>
                        <td className="p-3 font-medium text-slate-800">{a.base?.name}</td>
                        <td className="p-3 font-semibold text-slate-900">{a.personnelName}</td>
                        <td className="p-3 font-mono text-slate-500">{a.personnelId}</td>
                        <td className="p-3">{a.equipmentType?.name}</td>
                        <td className="p-3 text-right font-bold">{a.quantity}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              a.status === 'ACTIVE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {a.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleReturnAsset(a.id)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium text-[10px]"
                            >
                              Mark Returned
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
      )}

      {activeTab === 'expenditures' && (
        <div className="space-y-6">
          {/* Record Expenditure Form */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Record Expended Asset / Munitions</h2>
            <form onSubmit={handleCreateExpenditure} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Base</label>
                <select
                  value={user?.role === 'BASE_COMMANDER' ? user.baseId || '' : expendBaseId}
                  onChange={(e) => setExpendBaseId(e.target.value)}
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
                <label className="block font-semibold text-slate-600 mb-1">Equipment / Munitions</label>
                <select
                  value={expendEquipmentId}
                  onChange={(e) => setExpendEquipmentId(e.target.value)}
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
                <label className="block font-semibold text-slate-600 mb-1">Quantity Expended</label>
                <input
                  type="number"
                  min="1"
                  value={expendQty}
                  onChange={(e) => setExpendQty(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
                  placeholder="Units consumed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Reason / Operation</label>
                <input
                  type="text"
                  value={expendReason}
                  onChange={(e) => setExpendReason(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. Field Training Exercise"
                />
              </div>

              <div className="md:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 rounded transition"
                >
                  Record Expenditure
                </button>
              </div>
            </form>
          </div>

          {/* Expenditures Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Historical Expenditures</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Base</th>
                    <th className="p-3">Equipment</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Expended By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">Loading expenditures...</td>
                    </tr>
                  ) : expenditures.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">No expenditure records found.</td>
                    </tr>
                  ) : (
                    expenditures.map((ex) => (
                      <tr key={ex.id} className="hover:bg-slate-50">
                        <td className="p-3">{new Date(ex.expendedAt).toLocaleDateString()}</td>
                        <td className="p-3 font-medium text-slate-800">{ex.base?.name}</td>
                        <td className="p-3">{ex.equipmentType?.name}</td>
                        <td className="p-3 text-right font-bold text-rose-600">-{ex.quantity}</td>
                        <td className="p-3">{ex.reason}</td>
                        <td className="p-3 text-slate-500">{ex.expendedBy?.name}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
