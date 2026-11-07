import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Activity,
  FileDown,
  Plus,
  Send,
  Eye,
  Ear,
  Accessibility,
  BookOpen,
  Volume2,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Paciente, EstadoPaciente, NotaMedica } from '../types';
import { CATEGORIAS_INFO } from '../utils/categoriaEnfermedad';
import { exportarFichaPDF } from '../utils/exportUtils';

interface PacienteDetalleModalProps {
  paciente: Paciente;
  onClose: () => void;
  onActualizarEstado: (pacienteId: string, nuevoEstado: EstadoPaciente) => void;
  onAgregarNota: (pacienteId: string, nota: string) => void;
  onProgramarSeguimiento: (pacienteId: string, fecha: string, motivo: string) => void;
  onIniciarNuevaConsulta: (paciente: Paciente) => void;
  doctorNombreActual: string;
}

export const PacienteDetalleModal: React.FC<PacienteDetalleModalProps> = ({
  paciente,
  onClose,
  onActualizarEstado,
  onAgregarNota,
  onProgramarSeguimiento,
  onIniciarNuevaConsulta,
  doctorNombreActual,
}) => {
  const [nuevaNota, setNuevaNota] = useState('');
  const [fechaSeguimiento, setFechaSeguimiento] = useState(paciente.seguimiento?.fecha || '');
  const [motivoSeguimiento, setMotivoSeguimiento] = useState(paciente.seguimiento?.motivo || '');
  const [mostrarFormSeguimiento, setMostrarFormSeguimiento] = useState(false);

  const catInfo = CATEGORIAS_INFO[paciente.categoria_enfermedad] || CATEGORIAS_INFO.otra;

  // Recharts data
  const chartData = [...paciente.consultas]
    .reverse()
    .map((c, idx) => ({
      index: idx + 1,
      fecha: c.fecha.split(',')[0] || c.fecha,
      intensidad: c.intensidad,
      sintomas: c.sintomas.join(', '),
    }));

  const handleGuardarNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNota.trim()) return;
    onAgregarNota(paciente.id, nuevaNota.trim());
    setNuevaNota('');
  };

  const handleGuardarSeguimiento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaSeguimiento) return;
    onProgramarSeguimiento(paciente.id, fechaSeguimiento, motivoSeguimiento);
    setMostrarFormSeguimiento(false);
  };

  const handleDescargarPDF = () => {
    const ultimaConsulta = paciente.consultas[0];
    const fichaDescarga = ultimaConsulta
      ? {
          ...ultimaConsulta,
          transcripcion_quechua: ultimaConsulta.transcripcion_quechua || 'Consulta histórica',
          traduccion_espanol: ultimaConsulta.traduccion_espanol || 'Registro clínico',
          duracion: 'Histórico',
        }
      : {
          transcripcion_quechua: 'Registro de paciente',
          traduccion_espanol: `Paciente: ${paciente.nombres} ${paciente.apellidos}`,
          sintomas: ['Evaluación clínica general'],
          zona_cuerpo: 'General',
          duracion: 'Registro',
          intensidad: 2,
          urgencia: 'baja' as const,
          confianza: 1.0,
        };
    exportarFichaPDF(fichaDescarga);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl p-5 max-w-lg w-full border-2 border-[#E3DAC9] shadow-2xl space-y-4 my-4 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-[#E3DAC9] pb-3 sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[#2B2625]">
                {paciente.nombres} {paciente.apellidos}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catInfo.badge}`}>
                {catInfo.label}
              </span>
            </div>
            <p className="text-xs text-[#5C5450] mt-0.5">
              DNI ficticio: <strong>{paciente.dni}</strong> • {paciente.edad} años • {paciente.comunidad_distrito}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#5C5450] hover:text-black font-bold text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* SPECIAL NEEDS & DISABILITY BADGES (MANDATORY REQUIREMENT) */}
        <div className="bg-[#FAF6EF] p-3 rounded-2xl border border-[#E3DAC9] space-y-2">
          <span className="text-[10px] font-bold text-[#B84A28] uppercase tracking-wider block">
            Atención Especial & Comunicación:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {paciente.nivel_lectura === 'no lee' && (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-1 rounded-xl">
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                No lee (Usa audio)
              </span>
            )}
            {paciente.nivel_lectura === 'lee poco' && (
              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-900 border border-yellow-300 text-xs font-bold px-2.5 py-1 rounded-xl">
                <BookOpen className="w-3.5 h-3.5 text-yellow-700" />
                Lee poco
              </span>
            )}
            {paciente.discapacidad === 'visual' && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold px-2.5 py-1 rounded-xl">
                <Eye className="w-3.5 h-3.5 text-purple-700" />
                Discapacidad Visual ({paciente.discapacidad_detalle || 'Baja visión'})
              </span>
            )}
            {paciente.discapacidad === 'auditiva' && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold px-2.5 py-1 rounded-xl">
                <Ear className="w-3.5 h-3.5 text-blue-700" />
                Discapacidad Auditiva (Apoyo visual gestual)
              </span>
            )}
            {paciente.discapacidad === 'motora' && (
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-900 border border-orange-300 text-xs font-bold px-2.5 py-1 rounded-xl">
                <Accessibility className="w-3.5 h-3.5 text-orange-700" />
                Discapacidad Motora ({paciente.discapacidad_detalle || 'Apoyo motriz'})
              </span>
            )}
            {paciente.necesidades_comunicacion.map((nec) => (
              <span
                key={nec}
                className="inline-flex items-center gap-1 bg-teal-50 text-[#1E6B65] border border-[#1E6B65]/30 text-xs font-bold px-2.5 py-1 rounded-xl"
              >
                <Volume2 className="w-3.5 h-3.5" />
                {nec}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#E3DAC9]">
            <div>
              <span className="text-[#5C5450] block text-[10px]">Variante Quechua</span>
              <strong className="text-[#2B2625]">{paciente.variante_quechua}</strong>
            </div>
            <div>
              <span className="text-[#5C5450] block text-[10px]">Alergias</span>
              <strong className="text-red-700">
                {paciente.alergias.length ? paciente.alergias.join(', ') : 'Ninguna conocida'}
              </strong>
            </div>
          </div>
        </div>

        {/* Change status and primary actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-2xl border-2 border-[#E3DAC9]">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#5C5450]">Estado:</span>
            <select
              value={paciente.estado}
              onChange={(e) => onActualizarEstado(paciente.id, e.target.value as EstadoPaciente)}
              className="text-xs font-bold p-1.5 rounded-lg border border-[#E3DAC9] bg-[#FAF6EF]"
            >
              <option value="en espera">En espera</option>
              <option value="en atencion">En atención</option>
              <option value="atendido">Atendido</option>
              <option value="derivado">Derivado</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDescargarPDF}
              className="px-2.5 py-1.5 bg-[#FAF6EF] text-[#1E6B65] border border-[#1E6B65] rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[#E2EFEF]"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={() => onIniciarNuevaConsulta(paciente)}
              className="px-3 py-1.5 bg-[#1E6B65] text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-sm hover:bg-[#134844]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Consulta</span>
            </button>
          </div>
        </div>

        {/* Chart: Patient Intensity History */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-[#E3DAC9] p-3 space-y-2">
            <h4 className="font-bold text-xs text-[#2B2625] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#B84A28]" />
              <span>Evolución de Intensidad del Dolor ({chartData.length} consultas)</span>
            </h4>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 15, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DC" />
                  <XAxis dataKey="fecha" stroke="#5C5450" fontSize={9} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#5C5450" fontSize={9} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="intensidad"
                    stroke="#B84A28"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#B84A28' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Previous Consultations List */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-[#2B2625] uppercase tracking-wider">
            Consultas Anteriores ({paciente.consultas.length})
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {paciente.consultas.map((c) => (
              <div
                key={c.id}
                className="bg-[#FAF6EF] p-2.5 rounded-xl border border-[#E3DAC9] text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2B2625]">
                    {c.sintomas.join(', ')} ({c.zona_cuerpo})
                  </span>
                  <span className="text-[10px] font-bold text-[#B84A28]">
                    Dolor: {c.intensidad}/5
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#5C5450]">
                  <span>{c.fecha}</span>
                  <span className="capitalize">Urgencia: {c.urgencia}</span>
                </div>
                {c.traduccion_espanol && (
                  <p className="text-[11px] text-[#5C5450] italic line-clamp-2">
                    "{c.traduccion_espanol}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Programar Seguimiento */}
        <div className="bg-[#FAF6EF] p-3 rounded-2xl border border-[#E3DAC9] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E6B65]">
              <Calendar className="w-4 h-4" />
              <span>Seguimiento Médico:</span>
            </div>
            <button
              type="button"
              onClick={() => setMostrarFormSeguimiento(!mostrarFormSeguimiento)}
              className="text-[11px] text-[#1E6B65] font-bold underline cursor-pointer"
            >
              {paciente.seguimiento?.programado ? 'Modificar' : '+ Programar fecha'}
            </button>
          </div>

          {paciente.seguimiento?.programado && (
            <div className="text-xs text-[#2B2625] bg-white p-2 rounded-xl border border-[#E3DAC9]">
              <p>
                <strong>Fecha:</strong> {paciente.seguimiento.fecha}
              </p>
              {paciente.seguimiento.motivo && (
                <p className="text-[#5C5450] mt-0.5">{paciente.seguimiento.motivo}</p>
              )}
            </div>
          )}

          {mostrarFormSeguimiento && (
            <form onSubmit={handleGuardarSeguimiento} className="space-y-2 pt-1 text-xs">
              <input
                type="date"
                value={fechaSeguimiento}
                onChange={(e) => setFechaSeguimiento(e.target.value)}
                required
                className="w-full p-2 rounded-xl border border-[#E3DAC9] bg-white text-xs"
              />
              <input
                type="text"
                value={motivoSeguimiento}
                onChange={(e) => setMotivoSeguimiento(e.target.value)}
                placeholder="Motivo del control..."
                className="w-full p-2 rounded-xl border border-[#E3DAC9] bg-white text-xs"
              />
              <button
                type="submit"
                className="w-full py-2 bg-[#1E6B65] text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Guardar Seguimiento
              </button>
            </form>
          )}
        </div>

        {/* Notas Médicas */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-[#2B2625] uppercase tracking-wider">
            Notas del Médico
          </h4>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {paciente.notas_medicas.map((n) => (
              <div key={n.id} className="p-2.5 bg-white rounded-xl border border-[#E3DAC9] text-xs">
                <div className="flex justify-between text-[10px] text-[#5C5450] mb-0.5">
                  <span className="font-bold">{n.autor}</span>
                  <span>{n.fecha}</span>
                </div>
                <p className="text-[#2B2625]">{n.nota}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleGuardarNota} className="flex gap-2">
            <input
              type="text"
              value={nuevaNota}
              onChange={(e) => setNuevaNota(e.target.value)}
              placeholder="Escribir nota de evolución..."
              className="flex-1 p-2 rounded-xl border border-[#E3DAC9] text-xs"
            />
            <button
              type="submit"
              disabled={!nuevaNota.trim()}
              className="p-2 bg-[#1E6B65] text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
