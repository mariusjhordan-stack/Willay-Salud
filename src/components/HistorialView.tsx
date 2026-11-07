import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { History, Activity, Calendar, Sparkles, Trash2, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { ConsultaHistorial } from '../types';

interface HistorialViewProps {
  consultas: ConsultaHistorial[];
  onCargarDatosEjemplo: () => void;
  onLimpiarHistorial: () => void;
  onSeleccionarConsulta: (consulta: ConsultaHistorial) => void;
}

export const HistorialView: React.FC<HistorialViewProps> = ({
  consultas,
  onCargarDatosEjemplo,
  onLimpiarHistorial,
  onSeleccionarConsulta,
}) => {
  // Prepare data for recharts
  const chartData = [...consultas]
    .reverse()
    .map((c, index) => ({
      index: index + 1,
      fecha: c.fecha.split(',')[0] || c.fecha,
      hora: c.fecha.split(',')[1]?.trim() || '',
      intensidad: c.intensidad,
      zona: c.zona_cuerpo,
      sintomas: c.sintomas.join(', '),
    }));

  const urgenciaColors = {
    baja: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    media: 'bg-amber-100 text-amber-800 border-amber-300',
    alta: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#2B2625] flex items-center gap-2">
            <History className="w-6 h-6 text-[#1E6B65]" />
            <span>Historial y Evolución Clínica</span>
          </h2>
          <p className="text-xs text-[#5C5450] mt-0.5">
            Registro cronológico guardado localmente (localStorage).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCargarDatosEjemplo}
            className="text-xs font-bold bg-[#FAF6EF] text-[#1E6B65] hover:bg-[#E2EFEF] border border-[#1E6B65] px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1E6B65]" />
            <span>Cargar datos de ejemplo (5 consultas)</span>
          </button>

          {consultas.length > 0 && (
            <button
              type="button"
              onClick={onLimpiarHistorial}
              title="Borrar historial"
              className="text-xs text-red-600 hover:bg-red-50 p-2 rounded-xl border border-red-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chart: Intensity over time */}
      <div className="bg-white rounded-2xl border-2 border-[#E3DAC9] p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#2B2625] flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#B84A28]" />
            <span>Evolución de Intensidad del Dolor (1 a 5)</span>
          </h3>
          <span className="text-[11px] font-semibold text-[#5C5450]">
            Total registros: {consultas.length}
          </span>
        </div>

        {chartData.length > 0 ? (
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DC" />
                <XAxis
                  dataKey="fecha"
                  stroke="#5C5450"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="#5C5450"
                  fontSize={10}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#2B2625] text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                          <p className="font-bold text-[#E2EFEF]">
                            {data.fecha} {data.hora}
                          </p>
                          <p>
                            <strong>Intensidad:</strong> {data.intensidad}/5
                          </p>
                          <p className="capitalize">
                            <strong>Zona:</strong> {data.zona}
                          </p>
                          <p className="text-[11px] text-gray-300">
                            <strong>Síntomas:</strong> {data.sintomas}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="intensidad"
                  stroke="#B84A28"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#B84A28', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7, fill: '#1E6B65' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[#5C5450] bg-[#FAF6EF] rounded-xl border border-dashed border-[#E3DAC9]">
            Aún no hay registros en el historial. Presiona "Cargar datos de ejemplo" para visualizar la gráfica.
          </div>
        )}
      </div>

      {/* Consultations List */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-[#2B2625] uppercase tracking-wider">
          Lista de Consultas Registradas
        </h3>

        {consultas.length === 0 ? (
          <div className="p-4 bg-white rounded-2xl border-2 border-[#E3DAC9] text-center text-xs text-[#5C5450]">
            No hay consultas previas guardadas.
          </div>
        ) : (
          <div className="space-y-2.5">
            {consultas.map((c) => {
              const respuestas = c.respuestas_preguntas || {};
              const tieneRespuestas = Object.keys(respuestas).length > 0;

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border-2 border-[#E3DAC9] p-4 shadow-xs hover:border-[#1E6B65]/60 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2B2625]">
                          {c.sintomas.join(', ') || 'Consulta médica'}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            urgenciaColors[c.urgencia] || urgenciaColors.media
                          }`}
                        >
                          Urgencia: {c.urgencia}
                        </span>
                      </div>
                      <span className="text-xs text-[#5C5450] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {c.fecha} • Zona: <strong className="capitalize">{c.zona_cuerpo}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-[#5C5450] block font-bold">Dolor</span>
                        <span className="font-black text-[#B84A28] text-base">
                          {c.intensidad}/5
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSeleccionarConsulta(c)}
                        title="Ver ficha en el panel médico"
                        className="p-2 rounded-xl bg-[#FAF6EF] hover:bg-[#E2EFEF] text-[#1E6B65] border border-[#E3DAC9] transition-colors cursor-pointer"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary of yes/no questions if any */}
                  {tieneRespuestas && (
                    <div className="bg-[#FAF6EF] p-2.5 rounded-xl border border-[#E3DAC9] text-[11px] flex flex-wrap gap-2">
                      <span className="font-bold text-[#5C5450]">Respuestas rápidas:</span>
                      {respuestas['fiebre'] && (
                        <span className={`px-1.5 py-0.5 rounded font-bold ${respuestas['fiebre'] === 'si' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>
                          Fiebre: {respuestas['fiebre'] === 'si' ? 'SÍ' : 'NO'}
                        </span>
                      )}
                      {respuestas['embarazo'] && (
                        <span className={`px-1.5 py-0.5 rounded font-bold ${respuestas['embarazo'] === 'si' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                          Embarazo: {respuestas['embarazo'] === 'si' ? 'SÍ' : 'NO'}
                        </span>
                      )}
                      {respuestas['duracion_3dias'] && (
                        <span className={`px-1.5 py-0.5 rounded font-bold ${respuestas['duracion_3dias'] === 'si' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>
                          &gt;3 días: {respuestas['duracion_3dias'] === 'si' ? 'SÍ' : 'NO'}
                        </span>
                      )}
                      {respuestas['medicamento'] && (
                        <span className="px-1.5 py-0.5 rounded font-bold bg-blue-100 text-blue-800">
                          Medicación: {respuestas['medicamento'] === 'si' ? 'SÍ' : 'NO'}
                        </span>
                      )}
                    </div>
                  )}

                  {c.traduccion_espanol && (
                    <p className="text-xs text-[#5C5450] italic line-clamp-2">
                      "{c.traduccion_espanol}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
