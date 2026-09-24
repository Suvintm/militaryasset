import React, { useState, useEffect } from 'react';
import { MetricCard } from './MetricCard';
import { FiltersBar } from './FiltersBar';
import { NetMovementModal } from './NetMovementModal';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import type { Base, EquipmentType, DashboardSummary } from '../../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [bases, setBases] = useState<Base[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  
  const [selectedBase, setSelectedBase] = useState<string>(
    user?.role === 'BASE_COMMANDER' && user?.baseId ? user.baseId : ''
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [summary, setSummary] = useState<DashboardSummary>({
    openingBalance: 0,
    closingBalance: 0,
    netMovement: 0,
    purchases: 0,
    transfersIn: 0,
    transfersOut: 0,
    assigned: 0,
    expended: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    purchases: any[];
    transfersIn: any[];
    transfersOut: any[];
  }>({ purchases: [], transfersIn: [], transfersOut: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch master filters
    apiClient.get(ENDPOINTS.BASES).then(res => setBases(res.data.data)).catch(() => {});
    apiClient.get(ENDPOINTS.EQUIPMENT_TYPES).then(res => setEquipmentTypes(res.data.data)).catch(() => {});
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedBase) params.baseId = selectedBase;
      if (selectedEquipment) params.equipmentTypeId = selectedEquipment;
      if (startDate) params.from = startDate;
      if (endDate) params.to = endDate;

      const res = await apiClient.get(ENDPOINTS.DASHBOARD.SUMMARY, { params });
      setSummary(res.data.data);
    } catch (err) {
      console.error('Error fetching dashboard summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedBase, selectedEquipment, startDate, endDate]);

  const handleOpenMovementModal = async () => {
    try {
      const params: any = {};
      if (selectedBase) params.baseId = selectedBase;
      if (selectedEquipment) params.equipmentTypeId = selectedEquipment;
      if (startDate) params.from = startDate;
      if (endDate) params.to = endDate;

      const res = await apiClient.get(ENDPOINTS.DASHBOARD.NET_MOVEMENT_DETAIL, { params });
      setModalData(res.data.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to load detail movements', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Logistics & Asset Overview</h1>
          <p className="text-xs text-slate-500">Live operational inventory tracking and movements</p>
        </div>
      </div>

      <FiltersBar
        bases={bases}
        equipmentTypes={equipmentTypes}
        selectedBase={selectedBase}
        onSelectBase={setSelectedBase}
        selectedEquipment={selectedEquipment}
        onSelectEquipment={setSelectedEquipment}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        isBaseDisabled={user?.role === 'BASE_COMMANDER'}
      />

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <MetricCard
            title="Opening Balance"
            value={summary.openingBalance}
            subtitle="Stock before period"
          />
          <MetricCard
            title="Net Movement"
            value={summary.netMovement > 0 ? `+${summary.netMovement}` : summary.netMovement}
            subtitle="Purchases + In - Out"
            clickable
            highlight
            onClick={handleOpenMovementModal}
          />
          <MetricCard
            title="Closing Balance"
            value={summary.closingBalance}
            subtitle="Opening + Net Movement"
          />
          <MetricCard
            title="Assigned"
            value={summary.assigned}
            subtitle="Active deployed units"
          />
          <MetricCard
            title="Expended"
            value={summary.expended}
            subtitle="Consumed / Operations"
          />
        </div>
      )}

      <NetMovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={modalData}
      />
    </div>
  );
};
