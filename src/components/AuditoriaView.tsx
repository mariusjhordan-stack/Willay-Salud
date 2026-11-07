import React, { useState, useEffect } from 'react';
import { Shield, Clock, User, FileText, RefreshCw } from 'lucide-react';
import { RegistroAuditoria } from '../types';
import { authService } from '../services/authService';

export const AuditoriaView: React.FC = () => {
  const [logs, setLogs] = useState<RegistroAuditoria[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    cargarLogs();
  }, []);

  const cargarLogs = async () => {
    setIsLoading(true);
    const token = authService.getToken();

    try {
      const response = await fetch('/api/auditoria', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        // Fallback local audit entries if offline
        const localAuditStr = localStorage.getItem('willay_salud_auditoria_local');
        if (localAuditStr) {
          setLogs(JSON.parse(localAuditStr));
        }
      }
    } catch {
      const localAuditStr = localStorage.getItem('willay_salud_auditoria_local');
      if (localAuditStr) {
        setLogs(JSON.parse(localAuditStr));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#2B2625] flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#B84A28]" />
            <span>Registro de Auditoría (Admin)</span>
          </h2>
          <p className="text-xs text-[#5C5450] mt-0.5">
            Trazabilidad de accesos y consultas a historias clínicas
          </p>
        </div>
        <button
          type="button"
          onClick={cargarLogs}
          disabled={isLoading}
          className="p-2 rounded-xl bg-white border border-[#E3DAC9] text-[#1E6B65] hover:bg-[#FAF6EF] shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border-2 border-[#E3DAC9] p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-[#5C5450] pb-2 border-b border-[#E3DAC9]">
          <span>Total de eventos registrados: <strong>{logs.length}</strong></span>
          <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
            Acceso Restringido a Administradores
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#5C5450]">
            No hay registros de auditoría aún.
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[#FAF6EF] rounded-xl border border-[#E3DAC9] text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#2B2625]">
                    {log.accion}
                  </span>
                  <span className="text-[10px] text-[#5C5450] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#1E6B65]">
                  <User className="w-3.5 h-3.5" />
                  <span>
                    <strong>{log.usuarioNombre}</strong> ({log.usuarioEmail}) • Rol: {log.rol}
                  </span>
                </div>

                {log.pacienteNombre && (
                  <div className="text-[11px] text-[#5C5450]">
                    Paciente afectado: <strong>{log.pacienteNombre}</strong> (ID: {log.pacienteId})
                  </div>
                )}

                <p className="text-[11px] text-[#5C5450] italic bg-white p-1.5 rounded-lg border border-[#E3DAC9]/60">
                  {log.detalles}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
