import React from 'react';
import { Search, RotateCcw, Calendar, ChevronDown, Landmark, Layers } from 'lucide-react';
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
  onApplyFilters?: () => void;
  onResetFilters?: () => void;
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
  onApplyFilters,
  onResetFilters,
  isBaseDisabled = false,
}) => {
  return (
    <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        {/* 1. Base Dropdown */}
        <div className="lg:col-span-3 space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Base
          </label>
          <div className="relative flex items-center bg-white border border-slate-200/90 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0e2c1c] focus-within:border-transparent transition shadow-2xs">
            <Landmark className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
            <select
              value={selectedBase}
              onChange={(e) => onSelectBase(e.target.value)}
              disabled={isBaseDisabled}
              className="w-full text-xs font-semibold bg-transparent appearance-none focus:outline-none cursor-pointer text-slate-800 disabled:opacity-75 pr-5"
            >
              <option value="">All Bases (HQ)</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
          </div>
        </div>

        {/* 2. Equipment Type Dropdown */}
        <div className="lg:col-span-3 space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Equipment Type
          </label>
          <div className="relative flex items-center bg-white border border-slate-200/90 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0e2c1c] focus-within:border-transparent transition shadow-2xs">
            <Layers className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
            <select
              value={selectedEquipment}
              onChange={(e) => onSelectEquipment(e.target.value)}
              className="w-full text-xs font-semibold bg-transparent appearance-none focus:outline-none cursor-pointer text-slate-800 pr-5"
            >
              <option value="">All Equipment</option>
              {equipmentTypes.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.category})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
          </div>
        </div>

        {/* 3. From Date */}
        <div className="lg:col-span-2 space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            From Date
          </label>
          <div className="relative flex items-center bg-white border border-slate-200/90 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0e2c1c] focus-within:border-transparent transition shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full text-xs font-semibold bg-transparent focus:outline-none text-slate-800"
            />
          </div>
        </div>

        {/* 4. To Date */}
        <div className="lg:col-span-2 space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            To Date
          </label>
          <div className="relative flex items-center bg-white border border-slate-200/90 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#0e2c1c] focus-within:border-transparent transition shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full text-xs font-semibold bg-transparent focus:outline-none text-slate-800"
            />
          </div>
        </div>

        {/* 5. Buttons */}
        <div className="lg:col-span-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onApplyFilters}
            className="flex-1 py-2 px-3.5 bg-[#0e2c1c] hover:bg-[#15422a] text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer border border-[#1b4c32]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>

          <button
            type="button"
            onClick={onResetFilters}
            className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-semibold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
