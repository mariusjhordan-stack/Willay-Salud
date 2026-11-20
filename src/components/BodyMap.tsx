import React from 'react';
import { User } from 'lucide-react';

interface BodyMapProps {
  selectedZone: string;
  onSelectZone: (zone: string) => void;
}

const ZONES = [
  { id: 'cabeza', labelQuechua: 'Uma', labelEs: 'Cabeza' },
  { id: 'garganta', labelQuechua: 'Kunka', labelEs: 'Garganta' },
  { id: 'pecho', labelQuechua: 'Sonqo', labelEs: 'Pecho' },
  { id: 'barriga', labelQuechua: 'Wiksa', labelEs: 'Barriga' },
  { id: 'brazos', labelQuechua: 'Maki', labelEs: 'Brazos / Manos' },
  { id: 'piernas', labelQuechua: 'Chaki', labelEs: 'Piernas / Pies' },
  { id: 'espalda', labelQuechua: 'Wasa', labelEs: 'Espalda' },
];

export const BodyMap: React.FC<BodyMapProps> = ({ selectedZone, onSelectZone }) => {
  const zoneColor = (id: string) =>
    selectedZone === id
      ? 'fill-[#B84A28] stroke-[#8F3419] stroke-2'
      : 'fill-[#E8DFD3] hover:fill-[#D8CABE] stroke-[#C4B8A8] stroke-[0.5]';

  return (
    <div className="bg-white rounded-2xl p-4 border-2 border-[#E3DAC9] shadow-sm" role="group" aria-label="Mapa del cuerpo para seleccionar zona de dolor">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-[#2B2625] text-base flex items-center gap-2">
          <User className="w-5 h-5 text-[#B84A28]" />
          <span>Kurku Maymi (Mapa del Cuerpo)</span>
        </h3>
        <span className="text-xs bg-[#FAF6EF] text-[#B84A28] font-semibold px-2.5 py-1 rounded-full border border-[#E3DAC9]">
          Toca una zona
        </span>
      </div>

      <div className="flex gap-4 items-start">
        {/* SVG human silhouette */}
        <div className="relative w-40 h-72 bg-gradient-to-b from-[#FAF6EF] to-[#F0E8DC] rounded-xl flex items-center justify-center p-2 border border-[#E3DAC9] shrink-0">
          <svg
            viewBox="0 0 120 220"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Silueta del cuerpo humano interactiva"
          >
            {/* Head */}
            <circle
              cx="60"
              cy="24"
              r="16"
              className={`cursor-pointer transition-all duration-200 ${zoneColor('cabeza')}`}
              onClick={() => onSelectZone('cabeza')}
              role="button"
              aria-label="Cabeza - Uma"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectZone('cabeza')}
            />
            {/* Neck */}
            <rect
              x="54"
              y="40"
              width="12"
              height="10"
              rx="3"
              className={`cursor-pointer transition-all duration-200 ${zoneColor('garganta')}`}
              onClick={() => onSelectZone('garganta')}
              role="button"
              aria-label="Garganta - Kunka"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectZone('garganta')}
            />
            {/* Chest */}
            <path
              d="M38 52 C38 52, 30 58, 28 72 L38 75 L42 68 L42 90 L78 90 L78 68 L82 75 L92 72 C90 58, 82 52, 82 52 Z"
              className={`cursor-pointer transition-all duration-200 ${zoneColor('pecho')}`}
              onClick={() => onSelectZone('pecho')}
              role="button"
              aria-label="Pecho - Sonqo"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectZone('pecho')}
            />
            {/* Belly */}
            <rect
              x="42"
              y="92"
              width="36"
              height="30"
              rx="6"
              className={`cursor-pointer transition-all duration-200 ${zoneColor('barriga')}`}
              onClick={() => onSelectZone('barriga')}
              role="button"
              aria-label="Barriga - Wiksa"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectZone('barriga')}
            />
            {/* Left Arm */}
            <path
              d="M28 73 L16 128 A5 5 0 0 0 24 130 L36 77 Z"
              className={`cursor-pointer transition-all duration-200 ${zoneColor('brazos')}`}
              onClick={() => onSelectZone('brazos')}
              role="button"
              aria-label="Brazos - Maki"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectZone('brazos')}
            />
            {/* Left Hand */}
            <circle
              cx="18"
              cy="135"
              r="5"
              className={`cursor-pointer transition-all duration-200 ${zoneColor('brazos')}`}
              onClick={() => onSelectZone('brazos')}
            />
            {/* Right Arm */}
            <path
              d="M92 73 L104 128 A5 5 0 0 1 96 130 L84 77 Z"
              className={`cursor-pointer transition-all duration-200 ${zoneColor('brazos')}`}
              onClick={() => onSelectZone('brazos')}
            />
            {/* Right Hand */}
            <circle
              cx="102"
              cy="135"
              r="5"
              className={`cursor-pointer transition-all duration-200 ${zoneColor('brazos')}`}
              onClick={() => onSelectZone('brazos')}
            />
            {/* Left Leg */}
            <path
              d="M43 124 L40 195 A5 5 0 0 0 50 195 L56 135 Z"
              className={`cursor-pointer transition-all duration-200 ${zoneColor('piernas')}`}
              onClick={() => onSelectZone('piernas')}
              role="button"
              aria-label="Piernas - Chaki"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectZone('piernas')}
            />
            {/* Left Foot */}
            <ellipse
              cx="44"
              cy="200"
              rx="7"
              ry="4"
              className={`cursor-pointer transition-all duration-200 ${zoneColor('piernas')}`}
              onClick={() => onSelectZone('piernas')}
            />
            {/* Right Leg */}
            <path
              d="M64 135 L70 195 A5 5 0 0 0 80 195 L77 124 Z"
              className={`cursor-pointer transition-all duration-200 ${zoneColor('piernas')}`}
              onClick={() => onSelectZone('piernas')}
            />
            {/* Right Foot */}
            <ellipse
              cx="76"
              cy="200"
              rx="7"
              ry="4"
              className={`cursor-pointer transition-all duration-200 ${zoneColor('piernas')}`}
              onClick={() => onSelectZone('piernas')}
            />
            {/* Back indicator line (subtle dorsal stripe) */}
            <line
              x1="60"
              y1="52"
              x2="60"
              y2="120"
              stroke={selectedZone === 'espalda' ? '#8F3419' : '#D4C7B8'}
              strokeWidth={selectedZone === 'espalda' ? 3 : 1.5}
              strokeDasharray="4 3"
              className="cursor-pointer transition-all duration-200"
              onClick={() => onSelectZone('espalda')}
            />
          </svg>

          {/* Zone labels on hover */}
          {selectedZone && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#2B2625] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap">
              {ZONES.find((z) => z.id === selectedZone)?.labelQuechua} - {ZONES.find((z) => z.id === selectedZone)?.labelEs}
            </div>
          )}
        </div>

        {/* Quick select buttons */}
        <div className="flex-1 flex flex-col gap-1.5">
          {ZONES.map((z) => {
            const isSelected = selectedZone === z.id;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => onSelectZone(z.id)}
                aria-pressed={isSelected}
                className={`w-full text-left px-3 py-2 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#B84A28] text-white border-[#8F3419] shadow-md scale-[1.02]'
                    : 'bg-[#FAF6EF] text-[#2B2625] border-[#E3DAC9] hover:bg-white'
                }`}
              >
                <div>
                  <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-[#B84A28]'}`}>
                    {z.labelQuechua}
                  </div>
                  <div className={`text-[11px] ${isSelected ? 'text-white/90' : 'text-[#5C5450]'}`}>
                    {z.labelEs}
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-white bg-white' : 'border-[#B84A28]'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#B84A28]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
