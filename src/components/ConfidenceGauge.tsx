import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ConfidenceGaugeProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  value,
  size = 'md',
  showLabel = true,
}) => {
  const pct = Math.round(value * 100);
  const isLow = pct < 60;
  const isMedium = pct >= 60 && pct < 80;

  const dims = { sm: 48, md: 72, lg: 96 };
  const strokes = { sm: 4, md: 5, lg: 6 };
  const fonts = { sm: 'text-[10px]', md: 'text-sm', lg: 'text-lg' };

  const d = dims[size];
  const stroke = strokes[size];
  const r = (d - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  const color = isLow ? '#DC2626' : isMedium ? '#D97706' : '#059669';
  const bgColor = isLow ? '#FEE2E2' : isMedium ? '#FEF3C7' : '#D1FAE5';
  const label = isLow ? 'Baja' : isMedium ? 'Moderada' : 'Alta';
  const Icon = isLow ? ShieldAlert : isMedium ? AlertTriangle : ShieldCheck;

  return (
    <div className="flex items-center gap-2" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Confianza de traduccion: ${pct}%`}>
      <div className="relative" style={{ width: d, height: d }}>
        <svg width={d} height={d} className="-rotate-90">
          <circle
            cx={d / 2}
            cy={d / 2}
            r={r}
            fill="none"
            stroke={bgColor}
            strokeWidth={stroke}
          />
          <circle
            cx={d / 2}
            cy={d / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center font-black ${fonts[size]}`}
          style={{ color }}
        >
          {pct}%
        </span>
      </div>
      {showLabel && (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <Icon className="w-3.5 h-3.5" style={{ color }} />
            <span className="text-[11px] font-bold" style={{ color }}>
              Confianza {label}
            </span>
          </div>
          <span className="text-[10px] text-[#5C5450] block">
            {isLow
              ? 'Verificar con el paciente'
              : isMedium
              ? 'Revisar con cuidado'
              : 'Traduccion confiable'}
          </span>
        </div>
      )}
    </div>
  );
};
