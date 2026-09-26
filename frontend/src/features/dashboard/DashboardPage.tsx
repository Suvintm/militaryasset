import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  PieChart, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown, 
  ArrowLeftRight, 
  Users, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Box
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { FiltersBar } from './FiltersBar';
import { NetMovementModal } from './NetMovementModal';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import type { Base, EquipmentType, DashboardSummary } from '../../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [bases, setBases] = useState<Base[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  
  const [selectedBase, setSelectedBase] = useState<string>(
    user?.role === 'BASE_COMMANDER' && user?.baseId ? user.baseId : ''
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Dynamic Summary from Database
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

  // Dynamic Trend Movements
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  // Dynamic Category Distribution
  const [categoryData, setCategoryData] = useState<{
    totalStock: number;
    categories: any[];
  }>({
    totalStock: 0,
    categories: [],
  });

  // Dynamic Recent Transactions
  const [transactions, setTransactions] = useState<any[]>([]);

  // Dynamic Base Summary
  const [baseSummaries, setBaseSummaries] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    purchases: any[];
    transfersIn: any[];
    transfersOut: any[];
  }>({ purchases: [], transfersIn: [], transfersOut: [] });
  const [, setLoading] = useState(false);

  // Asset Trend Period State
  const [trendPeriod, setTrendPeriod] = useState<'Monthly' | 'Quarterly'>('Monthly');
  const [distributionBase, setDistributionBase] = useState<string>('all');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  useEffect(() => {
    // Fetch master filters from DB
    apiClient.get(ENDPOINTS.BASES).then(res => setBases(res.data.data)).catch(() => {});
    apiClient.get(ENDPOINTS.EQUIPMENT_TYPES).then(res => setEquipmentTypes(res.data.data)).catch(() => {});
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedBase) params.baseId = selectedBase;
      if (selectedEquipment) params.equipmentTypeId = selectedEquipment;
      if (startDate) params.from = startDate;
      if (endDate) params.to = endDate;
      const catBaseId = distributionBase !== 'all' ? distributionBase : selectedBase;

      const [summaryRes, trendsRes, catRes, txRes, basesRes] = await Promise.all([
        apiClient.get(ENDPOINTS.DASHBOARD.SUMMARY, { params }).catch(() => null),
        apiClient.get(ENDPOINTS.DASHBOARD.TRENDS, { params }).catch(() => null),
        apiClient.get(ENDPOINTS.DASHBOARD.CATEGORY_DISTRIBUTION, { params: { baseId: catBaseId } }).catch(() => null),
        apiClient.get(ENDPOINTS.DASHBOARD.RECENT_TRANSACTIONS, { params: { baseId: selectedBase } }).catch(() => null),
        apiClient.get(ENDPOINTS.DASHBOARD.BASE_SUMMARY).catch(() => null),
      ]);

      if (summaryRes?.data?.data) {
        const d = summaryRes.data.data;
        setSummary({
          openingBalance: d.openingBalance || 0,
          closingBalance: d.closingBalance || 0,
          netMovement: d.netMovement || 0,
          purchases: d.purchases || 0,
          transfersIn: d.transfersIn || 0,
          transfersOut: d.transfersOut || 0,
          assigned: d.assigned || 0,
          expended: d.expended || 0,
        });
      }

      if (trendsRes?.data?.data) {
        setMonthlyData(trendsRes.data.data);
      }

      if (catRes?.data?.data) {
        setCategoryData(catRes.data.data);
      }

      if (txRes?.data?.data) {
        setTransactions(txRes.data.data);
      }

      if (basesRes?.data?.data?.bases) {
        setBaseSummaries(basesRes.data.data.bases);
      }
    } catch (err) {
      console.error('Error fetching dynamic dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedBase, selectedEquipment, startDate, endDate, distributionBase]);

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
    } catch {
      setModalData({ purchases: [], transfersIn: [], transfersOut: [] });
      setIsModalOpen(true);
    }
  };

  const handleResetFilters = () => {
    setSelectedBase(user?.role === 'BASE_COMMANDER' && user?.baseId ? user.baseId : '');
    setSelectedEquipment('');
    setStartDate('');
    setEndDate('');
  };

  // SVG Chart Dimensions & dynamic scaling
  const chartWidth = 620;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;
  const zeroY = paddingY + plotHeight * 0.72; // Baseline 0 position

  // Find max value in monthly data for responsive scaling
  const maxDataVal = monthlyData.length > 0 
    ? Math.max(...monthlyData.map(d => Math.max(d.purchases || 0, d.transferIn || 0, d.transferOut || 0, Math.abs(d.netMovement || 0))))
    : 1000;
  const chartScaleMax = maxDataVal > 0 ? Math.ceil(maxDataVal / 1000) * 1000 : 10000;
  const scale = (plotHeight * 0.65) / chartScaleMax;

  // Format large numbers in Indian Lakh format
  const formatIndianNumber = (num: number): string => {
    return num.toLocaleString('en-IN');
  };

  // Net movement sign display
  const movementSign = summary.netMovement >= 0 ? '+' : '';

  // Operational Readiness rate
  const totalAssetsCount = categoryData.totalStock || summary.closingBalance;
  const operationalReadiness = totalAssetsCount > 0
    ? Math.min(100, Math.max(0, Math.round(((totalAssetsCount - summary.expended) / totalAssetsCount) * 100)))
    : 0;

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* 1. TOP HEADER & PANORAMIC MILITARY BANNER */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs">
        {/* Desktop Layout: Full-Width Panoramic Banner */}
        <div className="hidden lg:block relative w-full h-[95px] xl:h-[105px]">
          <img
            src="/hero_panoramic_banner.jpg"
            alt="Logistics & Asset Overview - Self Reliant India, Stronger Defence"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden p-3.5 space-y-2.5">
          <div className="relative rounded-xl overflow-hidden shadow-xs border border-slate-200 h-28 sm:h-36">
            <img
              src="/mob_dashboard_banner.jpg"
              alt="Military Patrol Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="flex h-1.5 w-4 rounded-full overflow-hidden">
                    <div className="w-1/3 bg-[#FF9933]" />
                    <div className="w-1/3 bg-white" />
                    <div className="w-1/3 bg-[#138808]" />
                  </div>
                  <span className="text-[9px] font-bold text-amber-400 tracking-wider">MAMS DEFENCE</span>
                </div>
                <div className="text-white font-black text-sm leading-tight mt-0.5">
                  MILITARY ASSET MANAGEMENT
                </div>
              </div>
              <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                SECURE ASSETS • STRONGER NATION
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
              Logistics & Asset Overview
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live operational inventory tracking and movements across all bases
            </p>
          </div>
        </div>
      </div>

      {/* 2. FILTER BAR */}
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
        onApplyFilters={fetchDashboardData}
        onResetFilters={handleResetFilters}
        isBaseDisabled={user?.role === 'BASE_COMMANDER'}
      />

      {/* 3. FIVE KEY METRIC CARDS (Dynamic Values from DB) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Opening Balance */}
        <MetricCard
          type="opening"
          title="OPENING BALANCE"
          value={formatIndianNumber(summary.openingBalance)}
          subtitle="Stock before period"
        />

        {/* Card 2: Net Movement (Interactive Drill-Down Card) */}
        <MetricCard
          type="net"
          title="NET MOVEMENT"
          value={`${movementSign}${formatIndianNumber(summary.netMovement)}`}
          subtitle="Purchases + In − Out"
          clickable={true}
          onClick={handleOpenMovementModal}
        />

        {/* Card 3: Closing Balance */}
        <MetricCard
          type="closing"
          title="CLOSING BALANCE"
          value={formatIndianNumber(summary.closingBalance)}
          subtitle="Opening + Net Movement"
        />

        {/* Card 4: Assigned Assets */}
        <MetricCard
          type="assigned"
          title="ASSIGNED"
          value={summary.assigned.toString()}
          subtitle="Active deployed units"
        />

        {/* Card 5: Expended Assets */}
        <div className="col-span-2 md:col-span-1">
          <MetricCard
            type="expended"
            title="EXPENDED"
            value={formatIndianNumber(summary.expended)}
            subtitle="Consumed / Operations"
          />
        </div>
      </div>

      {/* 4. CHARTS ROW: ASSET MOVEMENT TREND & CATEGORY DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left: Asset Movement Trend (7 Columns on desktop) */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                Asset Movement Trend
              </h2>
            </div>

            {/* Monthly / Quarterly Period Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setTrendPeriod('Monthly')}
                className={`px-2.5 py-1 rounded-md transition ${
                  trendPeriod === 'Monthly'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setTrendPeriod('Quarterly')}
                className={`px-2.5 py-1 rounded-md transition ${
                  trendPeriod === 'Quarterly'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Quarterly
              </button>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[11px] text-slate-600 font-medium mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#15803d]" />
              <span>Purchases</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
              <span>Transfer In</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
              <span>Transfer Out</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-[#14532d] rounded-full" />
              <span className="w-2 h-2 rounded-full border-2 border-[#14532d] bg-white -ml-2" />
              <span>Net Movement</span>
            </div>
          </div>

          {/* Dual Bar + Spline Trend Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              className="w-full min-w-[500px] h-48 select-none"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            >
              {/* Horizontal Gridlines */}
              {[-chartScaleMax/2, 0, chartScaleMax/2, chartScaleMax].map((val) => {
                const y = zeroY - (val / chartScaleMax) * (plotHeight * 0.65);
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke={val === 0 ? '#cbd5e1' : '#f1f5f9'}
                      strokeWidth={val === 0 ? 1.5 : 1}
                      strokeDasharray={val === 0 ? undefined : '3,3'}
                    />
                    <text
                      x={paddingX - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-slate-400 font-mono font-medium"
                    >
                      {val === 0 ? '0' : val >= 1000 ? `${Math.round(val / 1000)}K` : val}
                    </text>
                  </g>
                );
              })}

              {/* Bars & Line Points */}
              {monthlyData.map((d, i) => {
                const step = monthlyData.length > 1 ? plotWidth / (monthlyData.length - 1) : plotWidth;
                const x = paddingX + i * step;
                const barWidth = 10;

                const purchasesHeight = (d.purchases || 0) * scale;
                const transferInHeight = (d.transferIn || 0) * scale;
                const transferOutHeight = (d.transferOut || 0) * scale;

                return (
                  <g 
                    key={d.month + i}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredMonth(i)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Positive Stacked Bar: Purchases */}
                    {purchasesHeight > 0 && (
                      <rect
                        x={x - barWidth / 2}
                        y={zeroY - purchasesHeight}
                        width={barWidth}
                        height={purchasesHeight}
                        fill="#15803d"
                        rx="2"
                        className="transition-opacity group-hover:opacity-85"
                      />
                    )}

                    {/* Positive Stacked Bar: Transfer In */}
                    {transferInHeight > 0 && (
                      <rect
                        x={x - barWidth / 2}
                        y={zeroY - purchasesHeight - transferInHeight}
                        width={barWidth}
                        height={transferInHeight}
                        fill="#3b82f6"
                        rx="2"
                        className="transition-opacity group-hover:opacity-85"
                      />
                    )}

                    {/* Downward Negative Bar: Transfer Out */}
                    {transferOutHeight > 0 && (
                      <rect
                        x={x - barWidth / 2}
                        y={zeroY}
                        width={barWidth}
                        height={transferOutHeight}
                        fill="#f97316"
                        rx="2"
                        className="transition-opacity group-hover:opacity-85"
                      />
                    )}

                    {/* X-axis Month Label */}
                    <text
                      x={x}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      className={`text-[10px] font-semibold ${
                        hoveredMonth === i ? 'fill-emerald-800 font-bold' : 'fill-slate-500'
                      }`}
                    >
                      {d.month}
                    </text>
                  </g>
                );
              })}

              {/* Connecting Spline Line for Net Movement */}
              {monthlyData.length > 0 && (
                <path
                  d={monthlyData.reduce((acc, d, i) => {
                    const step = monthlyData.length > 1 ? plotWidth / (monthlyData.length - 1) : plotWidth;
                    const x = paddingX + i * step;
                    const y = zeroY - (d.netMovement || 0) * scale;
                    return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="#14532d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points for Net Movement */}
              {monthlyData.map((d, i) => {
                const step = monthlyData.length > 1 ? plotWidth / (monthlyData.length - 1) : plotWidth;
                const x = paddingX + i * step;
                const y = zeroY - (d.netMovement || 0) * scale;
                const isHovered = hoveredMonth === i;

                return (
                  <g key={`pt-${d.month}-${i}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3.5}
                      fill="#ffffff"
                      stroke="#14532d"
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all"
                    />
                    {isHovered && (
                      <g>
                        <rect
                          x={x - 30}
                          y={y - 24}
                          width="60"
                          height="18"
                          rx="4"
                          fill="#0f172a"
                        />
                        <text
                          x={x}
                          y={y - 12}
                          textAnchor="middle"
                          fill="#ffffff"
                          className="text-[9px] font-bold"
                        >
                          {(d.netMovement || 0) >= 0 ? '+' : ''}{(d.netMovement || 0).toLocaleString()}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right: Asset Distribution by Category (5 Columns on desktop) */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <PieChart className="w-4 h-4" />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                Asset Distribution by Category
              </h2>
            </div>

            <div className="relative">
              <select
                value={distributionBase}
                onChange={(e) => setDistributionBase(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 pr-6 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Bases</option>
                {bases.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Donut Chart and Breakdown Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-3">
            {/* SVG Donut Chart */}
            <div className="sm:col-span-5 flex justify-center relative">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                {/* Background Track Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="16"
                />

                {/* Slices computed dynamically */}
                {(() => {
                  let cumulativePercent = 0;
                  const circumference = 238.76; // 2 * PI * 38
                  return categoryData.categories.map((cat, idx) => {
                    if (cat.percentage <= 0) return null;
                    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
                    cumulativePercent += cat.percentage;

                    return (
                      <circle
                        key={cat.key || idx}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke={cat.color || '#15803d'}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300"
                      />
                    );
                  });
                })()}
              </svg>
              {/* Center Donut Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-black text-slate-900 leading-tight">
                  {formatIndianNumber(categoryData.totalStock || 0)}
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Total Assets</span>
              </div>
            </div>

            {/* Category Breakdown List */}
            <div className="sm:col-span-7 space-y-2 text-xs">
              {categoryData.categories.length === 0 || categoryData.totalStock === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No stock items in database yet.
                </div>
              ) : (
                categoryData.categories.map((cat) => (
                  <div key={cat.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-semibold text-slate-800">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono text-[11px]">{cat.percentage}%</span>
                      <span className="font-bold text-slate-900 w-16 text-right">
                        {formatIndianNumber(cat.count)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM ROW: RECENT TRANSACTIONS & BASE-WISE ASSET SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left: Recent Transactions Table (7 Columns on desktop) */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                Recent Transactions
              </h2>
            </div>

            <button
              onClick={() => navigate('/purchases')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[540px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-2">DATE & TIME</th>
                  <th className="pb-2">TYPE</th>
                  <th className="pb-2">ASSET</th>
                  <th className="pb-2 text-right">QTY</th>
                  <th className="pb-2">FROM</th>
                  <th className="pb-2">TO</th>
                  <th className="pb-2">CREATED BY</th>
                  <th className="pb-2 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      No asset transactions recorded in database yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          tx.type === 'PURCHASE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : tx.type === 'TRANSFER'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-slate-900">{tx.asset}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        {tx.isPositive ? '+' : '-'}{formatIndianNumber(tx.quantity)}
                      </td>
                      <td className="py-2.5 text-[11px] text-slate-500">{tx.from}</td>
                      <td className="py-2.5 text-[11px] text-slate-500">{tx.to}</td>
                      <td className="py-2.5 text-[11px] text-slate-600">{tx.createdBy}</td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Base-wise Asset Summary (5 Columns on desktop) */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                Base-wise Asset Summary
              </h2>
            </div>

            <button
              onClick={() => navigate('/transfers')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-12 gap-3 items-center">
            {/* India Map Pin Graphic */}
            <div className="col-span-4 rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center">
              <img
                src="/base_map_pins.jpg"
                alt="Command Base Map"
                className="w-full h-auto object-contain rounded-lg opacity-90"
              />
            </div>

            {/* Base Table */}
            <div className="col-span-8 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[9.5px] tracking-wider">
                    <th className="pb-1.5">BASE</th>
                    <th className="pb-1.5 text-right">TOTAL ASSETS</th>
                    <th className="pb-1.5 text-right">NET MOVEMENT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {baseSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400 text-xs">
                        No bases registered in database.
                      </td>
                    </tr>
                  ) : (
                    baseSummaries.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80">
                        <td className="py-1.5 font-bold text-slate-900">
                          {b.name}
                        </td>
                        <td className="py-1.5 text-right font-mono font-bold text-slate-900">
                          {formatIndianNumber(b.total)}
                        </td>
                        <td className={`py-1.5 text-right font-mono font-bold ${
                          b.isPositive ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {b.isPositive ? '+' : ''}{formatIndianNumber(b.netMovement)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 6. MOBILE EXCLUSIVE MODULES */}
      <div className="lg:hidden space-y-4 pt-2">
        {/* Quick Actions (2x2 Grid) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Box className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => navigate('/purchases')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-left active:scale-98 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800">New Purchase</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/transfers')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-left active:scale-98 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-bold text-slate-800">Initiate Transfer</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/assignments')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-left active:scale-98 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-slate-800">Create Assignment</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/audit-logs')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-left active:scale-98 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-700" />
                <span className="text-xs font-bold text-slate-800">View Audit Logs</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Operational Readiness Radial Gauge */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Operational Readiness
              </div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {operationalReadiness}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
                <span>•</span>
                <span>{summary.expended} Expended</span>
              </div>
            </div>

            {/* Circular Gauge SVG */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="3.5"
                  strokeDasharray={`${operationalReadiness}, 100`}
                />
              </svg>
              <span className="absolute text-xs font-bold text-slate-800">
                {operationalReadiness}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bonus Net Movement Modal */}
      <NetMovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={modalData}
      />
    </div>
  );
};
