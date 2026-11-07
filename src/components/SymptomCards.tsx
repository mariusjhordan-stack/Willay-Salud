import React from 'react';
import { Brain, Activity, Mic, HeartPulse, CheckCircle2 } from 'lucide-react';
import glosarioData from '../data/glosario.json';
import { GlosarioTermino } from '../types';

interface SymptomCardsProps {
  selectedSymptoms: string[];
  onToggleSymptom: (symptomEs: string, zonaCuerpo: string) => void;
}

export const SymptomCards: React.FC<SymptomCardsProps> = ({
  selectedSymptoms,
  onToggleSymptom,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain className="w-7 h-7" />;
      case 'Activity':
        return <Activity className="w-7 h-7" />;
      case 'Mic':
        return <Mic className="w-7 h-7" />;
      case 'HeartPulse':
        return <HeartPulse className="w-7 h-7" />;
      default:
        return <Activity className="w-7 h-7" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-[#2B2625] uppercase tracking-wider">
          Nanaykuna (Síntomas Frecuentes)
        </label>
        <span className="text-[11px] bg-[#FAF6EF] text-[#B84A28] border border-[#E3DAC9] font-medium px-2 py-0.5 rounded-full">
          Sin IA • Glosario Oficial
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {glosarioData.terminos.map((termino: GlosarioTermino) => {
          const isSelected = selectedSymptoms.includes(termino.espanol) || selectedSymptoms.includes(termino.quechua);
          return (
            <button
              key={termino.id}
              type="button"
              onClick={() => onToggleSymptom(termino.espanol, termino.zona_cuerpo)}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between min-h-[110px] ${
                isSelected
                  ? 'bg-[#1E6B65] text-white border-[#134844] shadow-md scale-[1.02]'
                  : 'bg-white text-[#2B2625] border-[#E3DAC9] hover:border-[#1E6B65]/50 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div
                  className={`p-2 rounded-xl ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF6EF] text-[#1E6B65]'
                  }`}
                >
                  {getIcon(termino.icono)}
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                )}
              </div>

              <div className="mt-2">
                <p className="font-extrabold text-base tracking-tight leading-tight">
                  {termino.quechua}
                </p>
                <p
                  className={`text-xs mt-0.5 font-medium capitalize ${
                    isSelected ? 'text-white/85' : 'text-[#5C5450]'
                  }`}
                >
                  {termino.espanol}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-[#FAF6EF] rounded-xl p-2.5 border border-[#E3DAC9] text-[11px] text-[#5C5450] flex items-center justify-between">
        <span>Glosario lingüístico:</span>
        <span className="font-semibold text-[#B84A28] bg-white px-2 py-0.5 rounded-md border border-[#E3DAC9]">
          por validar con hablante nativo
        </span>
      </div>
    </div>
  );
};
