import React from 'react';
import { User } from 'lucide-react';

interface BodyMapProps {
  selectedZone: string;
  onSelectZone: (zone: string) => void;
}

export const BodyMap: React.FC<BodyMapProps> = ({ selectedZone, onSelectZone }) => {
  const zones = [
    { id: 'cabeza', labelQuechua: 'Uma', labelEs: 'Cabeza', y: '16%' },
    { id: 'garganta', labelQuechua: 'Kunka', labelEs: 'Garganta', y: '29%' },
    { id: 'pecho', labelQuechua: 'Sonqo', labelEs: 'Pecho', y: '42%' },
    { id: 'barriga', labelQuechua: 'Wiksa', labelEs: 'Barriga', y: '58%' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border-2 border-[#E3DAC9] shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-[#2B2625] text-base flex items-center gap-2">
          <User className="w-5 h-5 text-[#B84A28]" />
          <span>Kurku Maymi (Mapa del Cuerpo)</span>
        </h3>
        <span className="text-xs bg-[#FAF6EF] text-[#B84A28] font-semibold px-2.5 py-1 rounded-full border border-[#E3DAC9]">
          Toca una zona
        </span>
      </div>

      <div className="flex gap-4 items-center">
        {/* SVG stylized human silhouette */}
        <div className="relative w-36 h-64 bg-[#FAF6EF] rounded-xl flex items-center justify-center p-2 border border-[#E3DAC9] shrink-0">
          <svg
            viewBox="0 0 100 200"
            className="w-full h-full drop-shadow-xs"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Silhouette Outline */}
            {/* Head */}
            <circle
              cx="50"
              cy="25"
              r="16"
              className={`cursor-pointer transition-all ${
                selectedZone === 'cabeza'
                  ? 'fill-[#B84A28] stroke-[#8F3419] stroke-2'
                  : 'fill-[#E8DFD3] hover:fill-[#D8CABE]'
              }`}
              onClick={() => onSelectZone('cabeza')}
            />
            {/* Neck */}
            <rect
              x="45"
              y="41"
              width="10"
              height="10"
              rx="2"
              className={`cursor-pointer transition-all ${
                selectedZone === 'garganta'
                  ? 'fill-[#B84A28] stroke-[#8F3419] stroke-2'
                  : 'fill-[#E8DFD3] hover:fill-[#D8CABE]'
              }`}
              onClick={() => onSelectZone('garganta')}
            />
            {/* Chest / Torso Top */}
            <path
              d="M32 52 C32 52, 24 58, 22 75 L30 78 L35 70 L35 90 L65 90 L65 70 L70 78 L78 75 C76 58, 68 52, 68 52 Z"
              className={`cursor-pointer transition-all ${
                selectedZone === 'pecho'
                  ? 'fill-[#B84A28] stroke-[#8F3419] stroke-2'
                  : 'fill-[#E8DFD3] hover:fill-[#D8CABE]'
              }`}
              onClick={() => onSelectZone('pecho')}
            />
            {/* Belly / Torso Bottom */}
            <rect
              x="35"
              y="92"
              width="30"
              height="30"
              rx="5"
              className={`cursor-pointer transition-all ${
                selectedZone === 'barriga'
                  ? 'fill-[#B84A28] stroke-[#8F3419] stroke-2'
                  : 'fill-[#E8DFD3] hover:fill-[#D8CABE]'
              }`}
              onClick={() => onSelectZone('barriga')}
            />
            {/* Legs */}
            <path
              d="M36 124 L34 185 A4 4 0 0 0 42 185 L47 135 L53 135 L58 185 A4 4 0 0 0 66 185 L64 124 Z"
              fill="#D4C7B8"
            />
            {/* Arms */}
            <path
              d="M22 76 L14 125 A4 4 0 0 0 20 128 L28 80 Z"
              fill="#D4C7B8"
            />
            <path
              d="M78 76 L86 125 A4 4 0 0 1 80 128 L72 80 Z"
              fill="#D4C7B8"
            />
          </svg>
        </div>

        {/* Quick select buttons list */}
        <div className="flex-1 flex flex-col gap-2">
          {zones.map((z) => {
            const isSelected = selectedZone === z.id;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => onSelectZone(z.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border-2 transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#B84A28] text-white border-[#8F3419] shadow-md scale-[1.02]'
                    : 'bg-[#FAF6EF] text-[#2B2625] border-[#E3DAC9] hover:bg-white'
                }`}
              >
                <div>
                  <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-[#B84A28]'}`}>
                    {z.labelQuechua}
                  </div>
                  <div className={`text-xs ${isSelected ? 'text-white/90' : 'text-[#5C5450]'}`}>
                    {z.labelEs}
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
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
