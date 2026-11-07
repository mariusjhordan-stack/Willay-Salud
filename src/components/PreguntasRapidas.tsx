import React, { useState } from 'react';
import { HelpCircle, Check, X, Volume2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import glosarioData from '../data/glosario.json';
import { GlosarioPregunta } from '../types';

interface PreguntasRapidasProps {
  respuestas: Record<string, 'si' | 'no' | null>;
  onGuardarRespuesta: (preguntaId: string, respuesta: 'si' | 'no') => void;
}

export const PreguntasRapidas: React.FC<PreguntasRapidasProps> = ({
  respuestas,
  onGuardarRespuesta,
}) => {
  const [preguntaActiva, setPreguntaActiva] = useState<GlosarioPregunta | null>(null);

  const preguntas: GlosarioPregunta[] = (glosarioData.preguntas || []) as GlosarioPregunta[];

  const handleSeleccionarPregunta = (preg: GlosarioPregunta) => {
    setPreguntaActiva(preg);
  };

  const handleResponder = (valor: 'si' | 'no') => {
    if (preguntaActiva) {
      onGuardarRespuesta(preguntaActiva.id, valor);
      setPreguntaActiva(null);
    }
  };

  const reproducirAudio = (texto: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(texto);
      utter.rate = 0.85;
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-[#1E6B65] p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#1E6B65]" />
          <h3 className="font-extrabold text-base text-[#2B2625]">
            Preguntas Rápidas (Sí / No)
          </h3>
        </div>
        <span className="text-[10px] bg-[#FAF6EF] text-[#B84A28] border border-[#E3DAC9] font-bold px-2 py-0.5 rounded-full">
          6 preguntas clave
        </span>
      </div>
      <p className="text-xs text-[#5C5450]">
        Toca una pregunta para mostrársela al paciente en quechua con botones grandes de respuesta (<strong>Ari / Manam</strong>):
      </p>

      {/* Grid of questions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {preguntas.map((preg) => {
          const resp = respuestas[preg.id];
          return (
            <button
              key={preg.id}
              type="button"
              onClick={() => handleSeleccionarPregunta(preg)}
              className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                resp === 'si'
                  ? 'bg-emerald-50 border-emerald-400'
                  : resp === 'no'
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-[#FAF6EF] border-[#E3DAC9] hover:border-[#1E6B65]'
              }`}
            >
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-[#2B2625] block">
                  {preg.espanol}
                </span>
                <span className="text-[11px] text-[#1E6B65] font-semibold italic block">
                  {preg.quechua}
                </span>
              </div>

              {/* Status pill */}
              <div className="shrink-0 ml-2">
                {resp === 'si' && (
                  <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-black px-2 py-1 rounded-lg shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                    Ari (Sí)
                  </span>
                )}
                {resp === 'no' && (
                  <span className="inline-flex items-center gap-1 bg-[#B84A28] text-white text-[11px] font-black px-2 py-1 rounded-lg shadow-xs">
                    <X className="w-3.5 h-3.5" />
                    Manam (No)
                  </span>
                )}
                {!resp && (
                  <span className="text-[10px] text-[#5C5450] bg-white px-2 py-1 rounded-lg border border-[#E3DAC9] font-medium">
                    Consultar
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-[#FAF6EF] p-2.5 rounded-xl border border-[#E3DAC9] text-[10px] text-[#5C5450] flex items-center justify-between">
        <span>Fuente: glosario.json (sección preguntas)</span>
        <span className="font-semibold text-[#B84A28] bg-white px-2 py-0.5 rounded-md border border-[#E3DAC9]">
          por validar con hablante nativo
        </span>
      </div>

      {/* FULLSCREEN / HIGH-CONTRAST PATIENT PROMPT MODAL */}
      {preguntaActiva && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF6EF] border-4 border-[#1E6B65] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-[#E3DAC9] pb-3">
              <span className="bg-[#1E6B65] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Tapukuy (Pregunta para el paciente)
              </span>
              <button
                type="button"
                onClick={() => setPreguntaActiva(null)}
                className="text-[#5C5450] hover:text-black font-bold text-lg p-1 cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* BIG QUECHUA QUESTION */}
            <div className="bg-white p-5 rounded-2xl border-2 border-[#E3DAC9] shadow-inner space-y-2">
              <span className="text-xs font-bold text-[#5C5450] uppercase tracking-wider block">
                Quechua (Texto en tamaño grande):
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1E6B65] leading-snug">
                {preguntaActiva.quechua}
              </h2>

              <p className="text-xs text-[#5C5450] pt-2 border-t border-[#E3DAC9]">
                <strong>En castellano:</strong> {preguntaActiva.espanol}
              </p>
            </div>

            <div className="text-[11px] text-[#B84A28] font-bold">
              * Glosario médico: por validar con hablante nativo
            </div>

            {/* TWO ENORMOUS BUTTONS: ARI (SÍ) & MANAM (NO) */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {/* Button ARI */}
              <button
                type="button"
                onClick={() => handleResponder('si')}
                className="py-6 px-4 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-2xl shadow-xl transition-transform active:scale-95 flex flex-col items-center justify-center gap-1 border-4 border-emerald-300 cursor-pointer"
              >
                <span className="tracking-wider">ARI</span>
                <span className="text-xs font-bold text-emerald-100 uppercase">
                  (Sí)
                </span>
              </button>

              {/* Button MANAM */}
              <button
                type="button"
                onClick={() => handleResponder('no')}
                className="py-6 px-4 rounded-3xl bg-[#B84A28] hover:bg-[#8F3419] text-white font-black text-2xl shadow-xl transition-transform active:scale-95 flex flex-col items-center justify-center gap-1 border-4 border-red-200 cursor-pointer"
              >
                <span className="tracking-wider">MANAM</span>
                <span className="text-xs font-bold text-red-100 uppercase">
                  (No)
                </span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => reproducirAudio(preguntaActiva.quechua)}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1E6B65] bg-white px-4 py-2 rounded-xl border border-[#1E6B65] shadow-xs cursor-pointer hover:bg-gray-50"
              >
                <Volume2 className="w-4 h-4" />
                <span>Escuchar audio de la pregunta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
