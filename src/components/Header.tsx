import React from 'react';
import { User, Stethoscope, Sparkles, LogOut, ShieldCheck } from 'lucide-react';
import { Role, DoctorUser } from '../types';

interface HeaderProps {
  currentRole: Role;
  onSelectRole: (role: Role) => void;
  onTriggerDemo: () => void;
  hasApiKey: boolean;
  isBackendConnected: boolean;
  doctorUser: DoctorUser | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  onTriggerDemo,
  hasApiKey,
  doctorUser,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b-2 border-[#E3DAC9] sticky top-0 z-30 shadow-xs">
      {/* Top Brand Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#B84A28] text-white flex items-center justify-center font-black text-lg shadow-md border-2 border-[#8F3419]">
            W
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-[#2B2625] leading-none">
              Willay Salud
            </h1>
            <span className="text-[10px] font-bold text-[#1E6B65] uppercase tracking-wider block mt-0.5">
              Quechua • Castellano
            </span>
          </div>
        </div>

        {/* User Info / Demo Button / API Status Badge */}
        <div className="flex items-center gap-2">
          {doctorUser && currentRole === 'medico' && (
            <div className="flex items-center gap-1.5 bg-[#FAF6EF] border border-[#E3DAC9] px-2 py-1 rounded-xl text-xs">
              <span className="font-bold text-[#1E6B65] truncate max-w-[90px] sm:max-w-[120px]">
                {doctorUser.nombre.split(' ')[0]} {doctorUser.nombre.split(' ')[1] || ''}
              </span>
              <button
                type="button"
                onClick={onLogout}
                title="Cerrar sesión médica"
                className="text-[#B84A28] hover:text-[#8F3419] p-0.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* MODO DEMO BUTTON */}
          <button
            type="button"
            onClick={onTriggerDemo}
            title="Cargar ficha de ejemplo de emergencia para demostración inmediata"
            className="text-[11px] font-extrabold bg-[#FAF6EF] text-[#B84A28] hover:bg-[#F6E9E4] border border-[#B84A28] px-2 py-1 rounded-xl flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#B84A28]" />
            <span>Demo</span>
          </button>

          {/* Status Badge */}
          <div
            className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 ${
              hasApiKey
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                hasApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="hidden xs:inline">
              {hasApiKey ? 'Gemini Flash' : 'Modo Demo'}
            </span>
          </div>
        </div>
      </div>

      {/* Role Navigation Bar (Paciente vs Médico) */}
      <div className="px-4 pb-2 pt-0.5">
        <div className="bg-[#FAF6EF] p-1 rounded-2xl border border-[#E3DAC9] grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onSelectRole('paciente')}
            className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              currentRole === 'paciente'
                ? 'bg-[#B84A28] text-white shadow-md scale-[1.01]'
                : 'text-[#5C5450] hover:text-[#2B2625] hover:bg-white/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>PACIENTE (Qhali kay)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectRole('medico')}
            className={`py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              currentRole === 'medico'
                ? 'bg-[#1E6B65] text-white shadow-md scale-[1.01]'
                : 'text-[#5C5450] hover:text-[#2B2625] hover:bg-white/60'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>MÉDICO (Hampiq)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
