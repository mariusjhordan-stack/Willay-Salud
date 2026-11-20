import React from 'react';
import { Brain, Activity, Mic, HeartPulse, CheckCircle2, Stethoscope } from 'lucide-react';
import glosarioData from '../data/glosario.json';
import { GlosarioTermino } from '../types';

interface SymptomCardsProps {
  selectedSymptoms: string[];
  onToggleSymptom: (symptomEs: string, zonaCuerpo: string) => void;
}

const ZONE_LABELS: Record<string, string> = {
  cabeza: 'Uma',
  barriga: 'Wiksa',
  garganta: 'Kunka',
  pecho: 'Sonqo',
  brazos: 'Maki',
  piernas: 'Chaki',
  espalda: 'Wasa',
};

export const SymptomCards: React.FC<SymptomCardsProps> = ({
  selectedSymptoms,
  onToggleSymptom,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain className="w-6 h-6" />;
      case 'Activity':
        return <Activity className="w-6 h-6" />;
      case 'Mic':
        return <Mic className="w-6 h-6" />;
      case 'HeartPulse':
        return <HeartPulse className="w-6 h-6" />;
      default:
        return <Activity className="w-6 h-6" />;
    }
  };

  const selectedCount = glosarioData.terminos.filter(
    (t) => selectedSymptoms.includes(t.espanol) || selectedSymptoms.includes(t.quechua)
  ).length;

  return (
    <div className="space-y-3" role="group" aria-label="Tarjetas de sintomas frecuentes">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-[#2B2625] uppercase tracking-wider flex items-center gap-1.5">
          <Stethoscope className="w-4 h-4 text-[#1E6B65]" />
          Nanaykuna (Síntomas)
        </label>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <span className="text-[11px] bg-[#1E6B65] text-white font-black px-2 py-0.5 rounded-full">
              {selectedCount} seleccionado{selectedCount > 1 ? 's' : ''}
            </span>
          )}
          <span className="text-[10px] bg-[#FAF6EF] text-[#B84A28] border border-[#E3DAC9] font-medium px-2 py-0.5 rounded-full">
            Glosario Oficial
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {glosarioData.terminos.map((termino: GlosarioTermino) => {
          const isSelected = selectedSymptoms.includes(termino.espanol) || selectedSymptoms.includes(termino.quechua);
          const zoneLabel = ZONE_LABELS[termino.zona_cuerpo] || termino.zona_cuerpo;

          return (
            <button
              key={termino.id}
              type="button"
              onClick={() => onToggleSymptom(termino.espanol, termino.zona_cuerpo)}
              aria-pressed={isSelected}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between min-h-[115px] cursor-pointer ${
                isSelected
                  ? 'bg-[#1E6B65] text-white border-[#134844] shadow-lg scale-[1.02]'
                  : 'bg-white text-[#2B2625] border-[#E3DAC9] hover:border-[#1E6B65]/50 hover:shadow-md shadow-xs active:scale-[0.98]'
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF6EF] text-[#1E6B65]'
                  }`}
                >
                  {getIcon(termino.icono)}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-white/15 text-white/80' : 'bg-[#FAF6EF] text-[#5C5450] border border-[#E3DAC9]'
                  }`}>
                    {zoneLabel}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>

              <div className="mt-2">
                <p className="font-extrabold text-base tracking-tight leading-tight">
                  {termino.quechua}
                </p>
                <p className={`text-xs mt-0.5 font-medium capitalize ${
                  isSelected ? 'text-white/85' : 'text-[#5C5450]'
                }`}>
                  {termino.espanol}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-[#FAF6EF] rounded-xl p-2.5 border border-[#E3DAC9] text-[11px] text-[#5C5450] flex items-center justify-between">
        <span>Fuente: glosario lingüístico oficial</span>
        <span className="font-semibold text-[#B84A28] bg-white px-2 py-0.5 rounded-md border border-[#E3DAC9]">
          por validar con hablante nativo
        </span>
      </div>
    </div>
  );
};
