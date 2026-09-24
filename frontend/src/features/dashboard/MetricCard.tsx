import React from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  onClick?: () => void;
  clickable?: boolean;
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  onClick,
  clickable = false,
  highlight = false,
}) => {
  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`p-5 rounded-lg border transition-all ${
        highlight
          ? 'bg-amber-50 border-amber-300 shadow-sm'
          : 'bg-white border-slate-200'
      } ${
        clickable
          ? 'cursor-pointer hover:shadow-md hover:border-amber-400'
          : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </h3>
        {clickable && (
          <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
            Click for Detail
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight">
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
};
