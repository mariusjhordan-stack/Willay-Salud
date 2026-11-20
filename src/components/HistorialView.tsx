import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { History, Activity, Calendar, Sparkles, Trash2, ArrowUpRight, TrendingUp, TrendingDown, Minus, MapPin, AlertTriangle, FileText } from 'lucide-react';
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

  const stats = useMemo(() => {
    if (consultas.length === 0) return null;
    const intensidades = consultas.map(c => c.intensidad);
    const promedio = intensidades.reduce((a, b) => a + b, 0) / intensidades.length;
    const altas = consultas.filter(c => c.urgencia === 'alta').length;
    const zonas = consultas.reduce<Record<string, number>>((acc, c) => {
      acc[c.zona_cuerpo] = (acc[c.zona_cuerpo] || 0) + 1;
      return acc;
    }, {});
    const zonaMasFrecuente = Object.entries(zonas).sort((a, b) => b[1] - a[1])[0];
    const ultimaIntensidad = consultas[0]?.intensidad || 0;
    const penultimaIntensidad = consultas[1]?.intensidad || ultimaIntensidad;
    const tendencia = ultimaIntensidad > penultimaIntensidad ? 'up' : ultimaIntensidad < penultimaIntensidad ? 'down' : 'stable';
    return { promedio, altas, zonaMasFrecuente, tendencia, total: consultas.length };
  }, [consultas]);

  const zonaChartData = useMemo(() => {
    const zonas = consultas.reduce<Record<string, number>>((acc, c) => {
      acc[c.zona_cuerpo] = (acc[c.zona_cuerpo] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(zonas)
      .map(([zona, count]) => ({ zona: zona.charAt(0).toUpperCase() + zona.slice(1), count }))
      .sort((a, b) => b.count - a.count);
  }, [consultas]);

  const ZONA_COLORS = ['#1E6B65', '#B84A28', '#5C5450', '#8F3419', '#134844', '#E3DAC9'];

  const urgenciaColors = {
    baja: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    media: 'bg-amber-100 text-amber-800 border-amber-300',
    alta: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="space-y-5 animate-fade-up" role="region" aria-label="Historial clinico y evolucion">
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
            <span>Cargar datos ejemplo</span>
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

      {/* Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border-2 border-[#E3DAC9] p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#5C5450] uppercase">Total</span>
              <FileText className="w-4 h-4 text-[#1E6B65]" />
            </div>
            <span className="text-2xl font-black text-[#2B2625]">{stats.total}</span>
            <span className="text-[10px] text-[#5C5450] block">consultas</span>
          </div>

          <div className="bg-white rounded-2xl border-2 border-[#E3DAC9] p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#5C5450] uppercase">Promedio Dolor</span>
              <Activity className="w-4 h-4 text-[#B84A28]" />
            </div>
            <span className="text-2xl font-black text-[#B84A28]">{stats.promedio.toFixed(1)}</span>
            <span className="text-[10px] text-[#5C5450] block">de 5</span>
          </div>

          <div className={`bg-white rounded-2xl border-2 p-3.5 shadow-xs ${stats.altas > 0 ? 'border-red-300' : 'border-[#E3DAC9]'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#5C5450] uppercase">Urgentes</span>
              <AlertTriangle className={`w-4 h-4 ${stats.altas > 0 ? 'text-red-500' : 'text-[#5C5450]'}`} />
            </div>
            <span className={`text-2xl font-black ${stats.altas > 0 ? 'text-red-600' : 'text-[#2B2625]'}`}>{stats.altas}</span>
            <span className="text-[10px] text-[#5C5450] block">casos alta urgencia</span>
          </div>

          <div className="bg-white rounded-2xl border-2 border-[#E3DAC9] p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#5C5450] uppercase">Tendencia</span>
              {stats.tendencia === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
              {stats.tendencia === 'down' && <TrendingDown className="w-4 h-4 text-emerald-500" />}
              {stats.tendencia === 'stable' && <Minus className="w-4 h-4 text-amber-500" />}
            </div>
            <span className={`text-sm font-black ${stats.tendencia === 'up' ? 'text-red-600' : stats.tendencia === 'down' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {stats.tendencia === 'up' ? 'En aumento' : stats.tendencia === 'down' ? 'Mejorando' : 'Estable'}
            </span>
            {stats.zonaMasFrecuente && (
              <span className="text-[10px] text-[#5C5450] flex items-center gap-0.5 mt-0.5">
                <MapPin className="w-3 h-3" /> Zona más frecuente: {stats.zonaMasFrecuente[0]}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart: Intensity over time */}
        <div className="bg-white rounded-2xl border-2 border-[#E3DAC9] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#2B2625] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#B84A28]" />
              <span>Evolución de Intensidad</span>
            </h3>
            <span className="text-[11px] font-semibold text-[#5C5450]">
              {consultas.length} registros
            </span>
          </div>

          {chartData.length > 0 ? (
            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DC" />
                  <XAxis dataKey="fecha" stroke="#5C5450" fontSize={10} tickLine={false} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#5C5450" fontSize={10} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#2B2625] text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                            <p className="font-bold text-[#E2EFEF]">{data.fecha} {data.hora}</p>
                            <p><strong>Intensidad:</strong> {data.intensidad}/5</p>
                            <p className="capitalize"><strong>Zona:</strong> {data.zona}</p>
                            <p className="text-[11px] text-gray-300"><strong>Síntomas:</strong> {data.sintomas}</p>
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
              Presiona "Cargar datos ejemplo" para visualizar la gráfica.
            </div>
          )}
        </div>

        {/* Chart: Frequency by body zone */}
        <div className="bg-white rounded-2xl border-2 border-[#E3DAC9] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#2B2625] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#1E6B65]" />
              <span>Frecuencia por Zona Corporal</span>
            </h3>
          </div>

          {zonaChartData.length > 0 ? (
            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zonaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DC" vertical={false} />
                  <XAxis dataKey="zona" stroke="#5C5450" fontSize={10} tickLine={false} />
                  <YAxis stroke="#5C5450" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#2B2625] text-white p-2.5 rounded-xl text-xs shadow-lg">
                            <p className="font-bold">{data.zona}</p>
                            <p>{data.count} consulta{data.count > 1 ? 's' : ''}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {zonaChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={ZONA_COLORS[index % ZONA_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#5C5450] bg-[#FAF6EF] rounded-xl border border-dashed border-[#E3DAC9]">
              Sin datos para mostrar distribución por zona.
            </div>
          )}
        </div>
      </div>

      {/* Consultations List */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-[#2B2625] uppercase tracking-wider">
          Lista de Consultas Registradas
        </h3>

        {consultas.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-[#E3DAC9] text-center space-y-2">
            <History className="w-10 h-10 text-[#E3DAC9] mx-auto" />
            <p className="text-sm font-bold text-[#5C5450]">Sin historial de consultas</p>
            <p className="text-xs text-[#5C5450]">Realiza una consulta o carga datos de ejemplo para comenzar.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {consultas.map((c, idx) => {
              const respuestas = c.respuestas_preguntas || {};
              const tieneRespuestas = Object.keys(respuestas).length > 0;

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border-2 border-[#E3DAC9] p-4 shadow-xs hover:border-[#1E6B65]/60 hover:shadow-md transition-all space-y-2.5 group"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#2B2625] truncate">
                          {c.sintomas.join(', ') || 'Consulta médica'}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                            urgenciaColors[c.urgencia] || urgenciaColors.media
                          }`}
                        >
                          {c.urgencia}
                        </span>
                      </div>
                      <span className="text-xs text-[#5C5450] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {c.fecha} • <strong className="capitalize">{c.zona_cuerpo}</strong>
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
                        className="p-2 rounded-xl bg-[#FAF6EF] hover:bg-[#E2EFEF] text-[#1E6B65] border border-[#E3DAC9] transition-all cursor-pointer group-hover:border-[#1E6B65] group-hover:shadow-xs"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {tieneRespuestas && (
                    <div className="bg-[#FAF6EF] p-2.5 rounded-xl border border-[#E3DAC9] text-[11px] flex flex-wrap gap-2">
                      <span className="font-bold text-[#5C5450]">Triaje:</span>
                      {Object.entries(respuestas).map(([key, val]) => (
                        <span
                          key={key}
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            val === 'si' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {key}: {val === 'si' ? 'SÍ' : 'NO'}
                        </span>
                      ))}
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
