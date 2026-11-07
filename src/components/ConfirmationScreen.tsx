import React from 'react';
import { CheckCircle2, RotateCcw, AlertTriangle, Activity, User, Clock, ShieldCheck } from 'lucide-react';
import { FichaClinica } from '../types';

interface ConfirmationScreenProps {
  ficha: FichaClinica;
  onConfirm: () => void;
  onBack: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  ficha,
  onConfirm,
  onBack,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#FAF6EF] p-4 rounded-2xl border-2 border-[#1E6B65] text-center">
        <span className="inline-block bg-[#1E6B65] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          Paso 2: Confirmación
        </span>
        <h2 className="text-xl font-extrabold text-[#2B2625]">
          ¿Allillanchu kay willakuy?
        </h2>
        <p className="text-sm text-[#5C5450] mt-0.5">
          ¿Es correcta esta información antes de enviarla al médico?
        </p>
      </div>

      {/* Structured Card */}
      <div className="bg-white rounded-2xl p-5 border-2 border-[#E3DAC9] shadow-md space-y-4">
        {/* Quechua speech summary */}
        <div className="bg-[#FAF6EF] p-3.5 rounded-xl border border-[#E3DAC9]">
          <div className="text-xs font-bold text-[#B84A28] uppercase tracking-wider mb-1">
            Qampa willasqayki (Lo que dijiste):
          </div>
          <p className="text-base font-bold text-[#2B2625] italic">
            "{ficha.transcripcion_quechua || 'Síntomas marcados en pantalla'}"
          </p>
          <div className="mt-2 pt-2 border-t border-[#E3DAC9]/60 text-xs text-[#5C5450]">
            <strong>En español:</strong> {ficha.traduccion_espanol}
          </div>
        </div>

        {/* Symptoms & details grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#FAF6EF] p-3 rounded-xl border border-[#E3DAC9] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#B84A28] shrink-0" />
            <div>
              <span className="text-[#5C5450] block text-[10px] uppercase">Síntomas</span>
              <span className="font-bold text-[#2B2625] text-xs">
                {ficha.sintomas.join(', ') || 'General'}
              </span>
            </div>
          </div>

          <div className="bg-[#FAF6EF] p-3 rounded-xl border border-[#E3DAC9] flex items-center gap-2">
            <User className="w-5 h-5 text-[#1E6B65] shrink-0" />
            <div>
              <span className="text-[#5C5450] block text-[10px] uppercase">Zona cuerpo</span>
              <span className="font-bold text-[#2B2625] text-xs capitalize">
                {ficha.zona_cuerpo || 'No indicada'}
              </span>
            </div>
          </div>

          <div className="bg-[#FAF6EF] p-3 rounded-xl border border-[#E3DAC9] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#B84A28] shrink-0" />
            <div>
              <span className="text-[#5C5450] block text-[10px] uppercase">Duración</span>
              <span className="font-bold text-[#2B2625] text-xs">
                {ficha.duracion || '1 día'}
              </span>
            </div>
          </div>

          <div className="bg-[#FAF6EF] p-3 rounded-xl border border-[#E3DAC9] flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#B84A28] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {ficha.intensidad}
            </div>
            <div>
              <span className="text-[#5C5450] block text-[10px] uppercase">Intensidad</span>
              <span className="font-bold text-[#2B2625] text-xs">
                Nivel {ficha.intensidad}/5
              </span>
            </div>
          </div>
        </div>

        {/* Confidence note if applicable */}
        {ficha.confianza < 0.6 && (
          <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-xl flex items-start gap-2 text-amber-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Atención:</strong>
              Traducción poco segura, confirmar con el paciente directamente.
            </div>
          </div>
        )}

        {ficha.es_demo && (
          <div className="text-[11px] text-[#5C5450] bg-gray-50 border border-gray-200 p-2 rounded-lg flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ficha generada en modo prototipo funcional / demostración.</span>
          </div>
        )}
      </div>

      {/* Big Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onConfirm}
          className="w-full py-4 px-6 rounded-2xl bg-[#B84A28] hover:bg-[#8F3419] text-white font-extrabold text-base shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
        >
          <CheckCircle2 className="w-6 h-6" />
          <span>ARI, ALLILLANMI (Confirmar y Enviar al Médico)</span>
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-3.5 px-6 rounded-2xl bg-white border-2 border-[#E3DAC9] text-[#5C5450] hover:text-[#2B2625] font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>MANAM, KUTISPA ALLICHAY (Corregir datos)</span>
        </button>
      </div>
    </div>
  );
};
