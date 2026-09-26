import React from 'react';
import { 
  Box, 
  TrendingUp, 
  Layers, 
  Users, 
  Flame, 
  ArrowRight 
} from 'lucide-react';

interface MetricCardProps {
  type: 'opening' | 'net' | 'closing' | 'assigned' | 'expended';
  title: string;
  value: number | string;
  subtitle?: string;
  onClick?: () => void;
  clickable?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  type,
  title,
  value,
  subtitle,
  onClick,
  clickable = false,
}) => {
  // Safe config fallback
  const configMap: Record<string, {
    icon: typeof Box;
    iconBg: string;
    cardBg: string;
    watermarkColor: string;
  }> = {
    opening: {
      icon: Box,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      cardBg: 'bg-white border-slate-200/90 hover:border-slate-300',
      watermarkColor: 'text-emerald-500/10',
    },
    net: {
      icon: TrendingUp,
      iconBg: 'bg-amber-100 text-amber-800 border-amber-200',
      cardBg: 'bg-gradient-to-br from-[#fffdf5] via-[#fffbf0] to-[#fff8e6] border-2 border-amber-300/90 shadow-sm hover:border-amber-400',
      watermarkColor: 'text-amber-500/15',
    },
    closing: {
      icon: Layers,
      iconBg: 'bg-blue-50 text-blue-700 border-blue-100',
      cardBg: 'bg-white border-slate-200/90 hover:border-slate-300',
      watermarkColor: 'text-blue-500/10',
    },
    assigned: {
      icon: Users,
      iconBg: 'bg-purple-50 text-purple-700 border-purple-100',
      cardBg: 'bg-white border-slate-200/90 hover:border-slate-300',
      watermarkColor: 'text-purple-500/10',
    },
    expended: {
      icon: Flame,
      iconBg: 'bg-orange-50 text-orange-700 border-orange-100',
      cardBg: 'bg-white border-slate-200/90 hover:border-slate-300',
      watermarkColor: 'text-orange-500/10',
    },
  };

  const config = configMap[type] || configMap.opening;
  const Icon = config.icon;

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
        config.cardBg
      } ${
        clickable ? 'cursor-pointer hover:shadow-md' : 'shadow-2xs'
      }`}
    >
      <div>
        {/* Top Header Row with Icon & Label */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${config.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </h3>
        </div>

        {/* Value Display */}
        <div className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 leading-none">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-[11px] text-slate-500 font-medium mt-1.5 leading-snug">
            {subtitle}
          </p>
        )}
      </div>

      {/* Net Movement Extra Button */}
      {type === 'net' && (
        <div className="pt-3 mt-auto relative z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
            className="inline-flex items-center gap-1.5 bg-[#fef3c7] hover:bg-[#fde68a] text-amber-900 border border-amber-300/80 px-3 py-1 rounded-full text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <span>Click for Details</span>
            <ArrowRight className="w-3 h-3 text-amber-700" />
          </button>
        </div>
      )}

      {/* Decorative SVG Graphic in Background Corner */}
      <div className={`absolute right-2 bottom-1.5 pointer-events-none select-none ${config.watermarkColor}`}>
        {type === 'opening' && (
          /* Tank outline */
          <svg className="w-16 h-10 stroke-current fill-none stroke-[1.2]" viewBox="0 0 80 40">
            <rect x="10" y="20" width="55" height="14" rx="7" />
            <circle cx="20" cy="27" r="4" />
            <circle cx="32" cy="27" r="4" />
            <circle cx="44" cy="27" r="4" />
            <circle cx="56" cy="27" r="4" />
            <path d="M22,20 L28,12 L50,12 L56,20 Z" />
            <line x1="50" y1="15" x2="72" y2="15" strokeWidth="2.5" />
          </svg>
        )}

        {type === 'net' && (
          /* Mini bar graph */
          <div className="flex items-end gap-1 h-8 opacity-40 pr-2">
            <div className="w-1.5 h-3 bg-amber-500 rounded-t-xs" />
            <div className="w-1.5 h-5 bg-amber-500 rounded-t-xs" />
            <div className="w-1.5 h-4 bg-amber-500 rounded-t-xs" />
            <div className="w-1.5 h-7 bg-amber-600 rounded-t-xs" />
          </div>
        )}

        {type === 'closing' && (
          /* Stepped bars */
          <div className="flex items-end gap-1 h-8 opacity-40 pr-2">
            <div className="w-1.5 h-2 bg-blue-500 rounded-t-xs" />
            <div className="w-1.5 h-4 bg-blue-500 rounded-t-xs" />
            <div className="w-1.5 h-6 bg-blue-500 rounded-t-xs" />
            <div className="w-1.5 h-8 bg-blue-600 rounded-t-xs" />
          </div>
        )}

        {type === 'assigned' && (
          /* Squad icons */
          <div className="flex items-center gap-0.5 opacity-35 pr-1">
            <Users className="w-9 h-9" />
          </div>
        )}

        {type === 'expended' && (
          /* Blast explosion */
          <svg className="w-14 h-12 stroke-current fill-none stroke-[1.2] opacity-40" viewBox="0 0 50 40">
            <path d="M25,5 L28,15 L38,10 L33,20 L45,22 L35,27 L42,37 L30,32 L27,42 L22,32 L10,38 L16,27 L5,22 L17,20 L12,10 L22,15 Z" />
          </svg>
        )}
      </div>
    </div>
  );
};
