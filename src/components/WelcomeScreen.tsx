import React, { useState } from 'react';
import { Heart, Languages, Shield, Mic, ArrowRight, Stethoscope } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Heart,
    iconColor: '#B84A28',
    iconBg: '#F6E9E4',
    title: 'Allin hamunaykita! (Bienvenido/a)',
    subtitle: 'Willay Salud - Comunicacion Intercultural en Salud',
    description:
      'Esta herramienta ayuda a pacientes quechuahablantes a comunicar sus sintomas al personal de salud, superando la barrera del idioma en centros de salud rurales del Peru.',
  },
  {
    icon: Languages,
    iconColor: '#1E6B65',
    iconBg: '#E2EFEF',
    title: 'Quechua - Castellano',
    subtitle: 'Traduccion intercultural respetuosa',
    description:
      'Traduce sintomas entre quechua (chanka/collao) y castellano usando un glosario medico validado. Las traducciones estan marcadas "por validar con hablante nativo" para garantizar transparencia.',
  },
  {
    icon: Mic,
    iconColor: '#B84A28',
    iconBg: '#F6E9E4',
    title: 'Dos modos de entrada',
    subtitle: 'Tarjetas tactiles o grabacion de voz',
    description:
      'Los pacientes pueden tocar tarjetas con sintomas ilustrados y un mapa del cuerpo, o grabar su voz en quechua para que la IA genere la ficha clinica automaticamente.',
  },
  {
    icon: Stethoscope,
    iconColor: '#1E6B65',
    iconBg: '#E2EFEF',
    title: 'Panel Medico Completo',
    subtitle: 'Triaje, alertas y respuesta al paciente',
    description:
      'El medico recibe la ficha estructurada con banderas rojas, puede responder en castellano y la herramienta traduce al quechua en texto grande para mostrarselo al paciente.',
  },
  {
    icon: Shield,
    iconColor: '#B84A28',
    iconBg: '#F6E9E4',
    title: 'Prototipo de Demostracion',
    subtitle: 'Datos ficticios - No ingresar datos reales',
    description:
      'Esta es una herramienta de apoyo a la comunicacion. No reemplaza el diagnostico medico. Todos los datos mostrados son ficticios con fines demostrativos del concepto.',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#FAF6EF] to-[#EDE5D8] z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-8 bg-[#B84A28]'
                  : i < step
                  ? 'w-3 bg-[#1E6B65]'
                  : 'w-3 bg-[#E3DAC9]'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 border-2 border-[#E3DAC9] shadow-2xl space-y-5 text-center animate-scale-in" key={step}>
          {/* Icon */}
          <div
            className="w-18 h-18 rounded-2xl mx-auto flex items-center justify-center shadow-md"
            style={{ backgroundColor: current.iconBg, width: 72, height: 72 }}
          >
            <Icon className="w-9 h-9" style={{ color: current.iconColor }} />
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#2B2625] leading-tight">
              {current.title}
            </h2>
            <p className="text-sm font-bold text-[#1E6B65]">{current.subtitle}</p>
            <p className="text-xs text-[#5C5450] leading-relaxed px-2">{current.description}</p>
          </div>

          {/* Step visual (first step shows logo) */}
          {step === 0 && (
            <div className="flex items-center justify-center gap-3 py-2 bg-[#FAF6EF] rounded-2xl mx-4 p-4 border border-[#E3DAC9]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B84A28] to-[#8F3419] text-white flex items-center justify-center font-black text-2xl shadow-md">
                W
              </div>
              <div className="text-left">
                <span className="text-lg font-black text-[#2B2625] block leading-none">
                  Willay Salud
                </span>
                <span className="text-[11px] text-[#1E6B65] font-bold">
                  Proyecto de Impacto Social Universitario
                </span>
              </div>
            </div>
          )}

          {/* Step counter */}
          <span className="text-[10px] text-[#5C5450] font-medium">
            {step + 1} de {STEPS.length}
          </span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="py-3 px-5 rounded-2xl bg-white border-2 border-[#E3DAC9] text-[#5C5450] font-bold text-sm cursor-pointer hover:bg-[#FAF6EF] transition-colors"
            >
              Atras
            </button>
          )}

          <button
            type="button"
            onClick={isLast ? onComplete : () => setStep(step + 1)}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-[#B84A28] hover:bg-[#8F3419] text-white font-extrabold text-sm shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLast ? (
              <span>Qallariy! (Comenzar)</span>
            ) : (
              <>
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Skip Link */}
        {!isLast && (
          <button
            type="button"
            onClick={onComplete}
            className="w-full text-center text-xs text-[#5C5450] hover:text-[#2B2625] font-medium cursor-pointer py-1"
          >
            Saltar introduccion
          </button>
        )}
      </div>
    </div>
  );
};
