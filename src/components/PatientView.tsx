import React, { useState } from 'react';
import { Mic, Layers, ArrowRight, Sparkles, Sliders, Clock } from 'lucide-react';
import { BodyMap } from './BodyMap';
import { SymptomCards } from './SymptomCards';
import { AudioRecorder } from './AudioRecorder';
import { ConfirmationScreen } from './ConfirmationScreen';
import { FichaClinica } from '../types';

interface PatientViewProps {
  onFichaReadyForDoctor: (ficha: FichaClinica) => void;
  onAnalyzeAudio: (audioBase64: string, mimeType: string) => Promise<FichaClinica>;
  onAnalyzeManual: (data: {
    sintomas: string[];
    zona_cuerpo: string;
    intensidad: number;
    duracion: string;
  }) => Promise<FichaClinica>;
  isLoading: boolean;
}

export const PatientView: React.FC<PatientViewProps> = ({
  onFichaReadyForDoctor,
  onAnalyzeAudio,
  onAnalyzeManual,
  isLoading,
}) => {
  const [inputMode, setInputMode] = useState<'tarjetas' | 'voz'>('tarjetas');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['dolor de barriga']);
  const [selectedZone, setSelectedZone] = useState<string>('barriga');
  const [intensidad, setIntensidad] = useState<number>(3);
  const [duracion, setDuracion] = useState<string>('Iskay punchaw (2 días)');
  const [pendingFicha, setPendingFicha] = useState<FichaClinica | null>(null);

  // Toggle symptom and automatically sync body zone
  const handleToggleSymptom = (symptomEs: string, zonaCuerpo: string) => {
    if (selectedSymptoms.includes(symptomEs)) {
      setSelectedSymptoms((prev) => prev.filter((s) => s !== symptomEs));
    } else {
      setSelectedSymptoms((prev) => [...prev, symptomEs]);
      setSelectedZone(zonaCuerpo);
    }
  };

  const handleSelectZone = (zone: string) => {
    setSelectedZone(zone);
    // Suggest corresponding symptom from glossary
    const map: Record<string, string> = {
      cabeza: 'dolor de cabeza',
      barriga: 'dolor de barriga',
      garganta: 'dolor de garganta',
      pecho: 'dolor de pecho',
    };
    if (map[zone] && !selectedSymptoms.includes(map[zone])) {
      setSelectedSymptoms((prev) => [...prev, map[zone]]);
    }
  };

  // Submit via cards/map (works locally without AI, or queries backend)
  const handleSubmitManual = async () => {
    const ficha = await onAnalyzeManual({
      sintomas: selectedSymptoms,
      zona_cuerpo: selectedZone,
      intensidad,
      duracion,
    });
    setPendingFicha(ficha);
  };

  // Submit via audio
  const handleAudioReady = async (audioBase64: string, mimeType: string) => {
    const ficha = await onAnalyzeAudio(audioBase64, mimeType);
    setPendingFicha(ficha);
  };

  // If patient confirms on confirmation screen
  const handleFinalConfirm = () => {
    if (pendingFicha) {
      onFichaReadyForDoctor(pendingFicha);
    }
  };

  // If in confirmation stage
  if (pendingFicha) {
    return (
      <ConfirmationScreen
        ficha={pendingFicha}
        onConfirm={handleFinalConfirm}
        onBack={() => setPendingFicha(null)}
      />
    );
  }

  const durationOptions = [
    'Kunan punchaw (Hoy)',
    'Qaynamanta (Desde ayer)',
    'Iskay punchaw (2 días)',
    'Kimsantin punchaw (3 días o más)',
  ];

  return (
    <div className="space-y-4">
      {/* Quechua Greeting & Mode Toggle */}
      <div className="bg-[#1E6B65] text-white p-4 rounded-2xl shadow-sm text-center">
        <h2 className="text-xl font-extrabold tracking-tight">
          Allillanchu! ¿Maypitaq nanasunki?
        </h2>
        <p className="text-xs text-white/80 mt-1">
          ¡Hola! ¿En qué parte del cuerpo te duele o sientes malestar?
        </p>

        {/* Big Switch Tab */}
        <div className="grid grid-cols-2 gap-2 mt-4 bg-[#134844] p-1.5 rounded-xl">
          <button
            type="button"
            onClick={() => setInputMode('tarjetas')}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              inputMode === 'tarjetas'
                ? 'bg-white text-[#1E6B65] shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tarjetas y Cuerpo</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('voz')}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              inputMode === 'voz'
                ? 'bg-white text-[#1E6B65] shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Grabar Voz (Audio)</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Voice Recording */}
      {inputMode === 'voz' && (
        <AudioRecorder onAudioReady={handleAudioReady} isLoading={isLoading} />
      )}

      {/* Mode 2: Cards & Body Map */}
      {inputMode === 'tarjetas' && (
        <div className="space-y-4">
          {/* Interactive Body Map */}
          <BodyMap selectedZone={selectedZone} onSelectZone={handleSelectZone} />

          {/* Symptom Cards from glosario.json */}
          <SymptomCards
            selectedSymptoms={selectedSymptoms}
            onToggleSymptom={handleToggleSymptom}
          />

          {/* Intensity Selector (1 - 5) */}
          <div className="bg-white rounded-2xl p-4 border-2 border-[#E3DAC9] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#2B2625] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#B84A28]" />
                <span>Nanay sinchi kaynin (Intensidad del Dolor): {intensidad}/5</span>
              </label>
              <span className="text-xs font-bold text-[#B84A28]">
                {intensidad <= 2 ? 'Pisilla (Leve)' : intensidad <= 4 ? 'Chawpi (Moderado)' : 'Sinchi (Muy fuerte)'}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((lvl) => {
                const isSelected = intensidad === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIntensidad(lvl)}
                    className={`py-3 rounded-xl font-black text-sm border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#B84A28] text-white border-[#8F3419] shadow-md scale-105'
                        : 'bg-[#FAF6EF] text-[#2B2625] border-[#E3DAC9] hover:bg-white'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-[#5C5450] px-1 font-medium">
              <span>1: Suave (Pisilla)</span>
              <span>5: Intenso (Sinchi)</span>
            </div>
          </div>

          {/* Duration Selector */}
          <div className="bg-white rounded-2xl p-4 border-2 border-[#E3DAC9] shadow-xs space-y-2">
            <label className="text-xs font-bold text-[#2B2625] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#1E6B65]" />
              <span>Hayk'aqmantam (¿Desde cuándo te duele?)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {durationOptions.map((opt) => {
                const isSelected = duracion === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDuracion(opt)}
                    className={`p-2.5 rounded-xl border text-xs text-left font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E6B65] text-white border-[#134844] shadow-xs'
                        : 'bg-[#FAF6EF] text-[#2B2625] border-[#E3DAC9] hover:bg-white'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmitManual}
            disabled={isLoading || selectedSymptoms.length === 0}
            className="w-full py-4 px-6 rounded-2xl bg-[#B84A28] hover:bg-[#8F3419] text-white font-extrabold text-base shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generando Ficha...</span>
              </>
            ) : (
              <>
                <span>Qhaway Willakuyta (Revisar y Confirmar)</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
