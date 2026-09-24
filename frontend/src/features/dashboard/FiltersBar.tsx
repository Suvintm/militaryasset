import React from 'react';
import type { Base, EquipmentType } from '../../types';

interface FiltersBarProps {
  bases: Base[];
  equipmentTypes: EquipmentType[];
  selectedBase: string;
  onSelectBase: (id: string) => void;
  selectedEquipment: string;
  onSelectEquipment: (id: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  isBaseDisabled?: boolean;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  bases,
  equipmentTypes,
  selectedBase,
  onSelectBase,
  selectedEquipment,
  onSelectEquipment,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  isBaseDisabled = false,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shadow-sm">
      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
          Base
        </label>
        <select
          value={selectedBase}
          onChange={(e) => onSelectBase(e.target.value)}
          disabled={isBaseDisabled}
          className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
        >
          <option value="">All Bases</option>
          {bases.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
          Equipment Type
        </label>
        <select
          value={selectedEquipment}
          onChange={(e) => onSelectEquipment(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
        >
          <option value="">All Equipment</option>
          {equipmentTypes.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.name} ({eq.category})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
          From Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
          To Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
        />
      </div>
    </div>
  );
};
