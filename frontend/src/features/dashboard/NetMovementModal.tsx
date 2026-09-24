import React, { useState } from 'react';

interface NetMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    purchases: any[];
    transfersIn: any[];
    transfersOut: any[];
  };
}

export const NetMovementModal: React.FC<NetMovementModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [activeTab, setActiveTab] = useState<'purchases' | 'transfersIn' | 'transfersOut'>('purchases');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Net Movement Breakdown</h2>
            <p className="text-xs text-slate-500">Purchases + Transfers In − Transfers Out</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold px-2 py-1 text-sm rounded"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b border-slate-200 px-5 gap-4 bg-slate-50">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'purchases'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Purchases ({data?.purchases?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('transfersIn')}
            className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'transfersIn'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Transfers In ({data?.transfersIn?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('transfersOut')}
            className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'transfersOut'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Transfers Out ({data?.transfersOut?.length || 0})
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === 'purchases' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Base</th>
                    <th className="pb-2">Equipment</th>
                    <th className="pb-2 text-right">Quantity</th>
                    <th className="pb-2">Supplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.purchases?.map((p: any) => (
                    <tr key={p.id} className="text-slate-700">
                      <td className="py-2">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                      <td className="py-2">{p.base?.name}</td>
                      <td className="py-2">{p.equipmentType?.name}</td>
                      <td className="py-2 text-right font-semibold text-green-600">+{p.quantity}</td>
                      <td className="py-2">{p.supplier}</td>
                    </tr>
                  ))}
                  {(!data?.purchases || data.purchases.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No purchase records for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'transfersIn' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">From Base</th>
                    <th className="pb-2">Equipment</th>
                    <th className="pb-2 text-right">Quantity</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.transfersIn?.map((t: any) => (
                    <tr key={t.id} className="text-slate-700">
                      <td className="py-2">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="py-2">{t.fromBase?.name}</td>
                      <td className="py-2">{t.equipmentType?.name}</td>
                      <td className="py-2 text-right font-semibold text-green-600">+{t.quantity}</td>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data?.transfersIn || data.transfersIn.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No inward transfers for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'transfersOut' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">To Base</th>
                    <th className="pb-2">Equipment</th>
                    <th className="pb-2 text-right">Quantity</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.transfersOut?.map((t: any) => (
                    <tr key={t.id} className="text-slate-700">
                      <td className="py-2">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="py-2">{t.toBase?.name}</td>
                      <td className="py-2">{t.equipmentType?.name}</td>
                      <td className="py-2 text-right font-semibold text-red-600">-{t.quantity}</td>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data?.transfersOut || data.transfersOut.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No outward transfers for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
