import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-[#FAF6EF] border-b border-[#E3DAC9] px-3 py-1.5 text-[11px] text-[#5C5450] flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 text-center shadow-xs">
      <div className="flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-[#B84A28] shrink-0" />
        <span>
          <strong>Aviso:</strong> Herramienta de apoyo a la comunicación. No reemplaza el diagnóstico médico.
        </span>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-[#1E6B65] font-semibold bg-white/70 px-2 py-0.5 rounded-full border border-[#E3DAC9]">
        <ShieldAlert className="w-3 h-3 text-[#1E6B65] shrink-0" />
        <span>Datos ficticios para demostración • No ingresar datos reales</span>
      </div>
    </div>
  );
};
