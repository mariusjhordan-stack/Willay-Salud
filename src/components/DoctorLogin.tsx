import React, { useState } from 'react';
import { Stethoscope, Lock, Mail, ShieldCheck, ArrowRight, UserCheck, KeyRound } from 'lucide-react';
import { authService } from '../services/authService';
import { DoctorUser } from '../types';

interface DoctorLoginProps {
  onLoginSuccess: (user: DoctorUser) => void;
  onCancel: () => void;
}

export const DoctorLogin: React.FC<DoctorLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await authService.login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setIsLoading(true);
    authService
      .login(quickEmail, quickPass)
      .then((user) => onLoginSuccess(user))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 border-2 border-[#E3DAC9] shadow-md space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 bg-[#1E6B65] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[#2B2625] pt-1">
            Acceso Médico Profesional
          </h2>
          <p className="text-xs text-[#5C5450]">
            Ingreso al panel clínico intercultural y gestión de pacientes
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-300 text-red-900 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-[#2B2625] block mb-1">
              Correo Institucional
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5C5450] absolute left-3 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@willaysalud.pe"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-[#E3DAC9] text-sm focus:border-[#1E6B65] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2B2625] block mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5C5450] absolute left-3 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-[#E3DAC9] text-sm focus:border-[#1E6B65] focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#1E6B65] hover:bg-[#134844] text-white font-extrabold text-sm shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <span>Iniciar Sesión Médica</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 text-xs font-bold text-[#5C5450] hover:text-[#2B2625] text-center"
        >
          Volver a la vista del Paciente
        </button>
      </div>

      {/* CUENTAS DE PRUEBA (MODO DEMO) OBLIGATORIO */}
      <div className="bg-[#FAF6EF] border-2 border-[#B84A28] rounded-2xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2 text-[#B84A28]">
          <KeyRound className="w-4 h-4 shrink-0" />
          <h3 className="text-xs font-black uppercase tracking-wide">
            Cuentas de prueba (Modo Demostración)
          </h3>
        </div>
        <p className="text-[11px] text-[#5C5450]">
          Toca cualquier cuenta para iniciar sesión con un solo clic con JWT firmado:
        </p>

        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@willaysalud.pe', 'Admin2026!')}
            className="w-full p-2.5 rounded-xl bg-white border border-[#E3DAC9] hover:border-[#B84A28] text-left text-xs transition-colors flex items-center justify-between cursor-pointer"
          >
            <div>
              <span className="font-bold text-[#2B2625] block">
                Dra. Elena Quispe (Rol: ADMIN)
              </span>
              <span className="text-[10px] text-[#5C5450]">
                admin@willaysalud.pe • Puede ver todos los pacientes y auditoría
              </span>
            </div>
            <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full shrink-0">
              Admin
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('dr.mamani@willaysalud.pe', 'Mamani2026!')}
            className="w-full p-2.5 rounded-xl bg-white border border-[#E3DAC9] hover:border-[#1E6B65] text-left text-xs transition-colors flex items-center justify-between cursor-pointer"
          >
            <div>
              <span className="font-bold text-[#2B2625] block">
                Dr. Carlos Mamani (Rol: MÉDICO)
              </span>
              <span className="text-[10px] text-[#5C5450]">
                dr.mamani@willaysalud.pe • Medicina Rural y Triage
              </span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">
              Médico
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('dra.condori@willaysalud.pe', 'Condori2026!')}
            className="w-full p-2.5 rounded-xl bg-white border border-[#E3DAC9] hover:border-[#1E6B65] text-left text-xs transition-colors flex items-center justify-between cursor-pointer"
          >
            <div>
              <span className="font-bold text-[#2B2625] block">
                Dra. Rosa Condori (Rol: MÉDICO)
              </span>
              <span className="text-[10px] text-[#5C5450]">
                dra.condori@willaysalud.pe • Salud Intercultural
              </span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">
              Médico
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
