import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Eye,
  Ear,
  Accessibility,
  BookOpen,
  Volume2,
  Calendar,
  AlertTriangle,
  Activity,
  User,
  Plus,
  FileDown,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Paciente, CategoriaEnfermedad, EstadoPaciente } from '../types';
import { CATEGORIAS_INFO } from '../utils/categoriaEnfermedad';
import { exportarFichaPDF } from '../utils/exportUtils';

interface PacientesListaProps {
  pacientes: Paciente[];
  onSeleccionarPaciente: (paciente: Paciente) => void;
  onAbrirNuevoPacienteModal: () => void;
  onCargarRegistroEjemplo: () => void;
  onIniciarNuevaConsulta: (paciente: Paciente) => void;
}

export const PacientesLista: React.FC<PacientesListaProps> = ({
  pacientes,
  onSeleccionarPaciente,
  onAbrirNuevoPacienteModal,
  onCargarRegistroEjemplo,
  onIniciarNuevaConsulta,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroUrgencia, setFiltroUrgencia] = useState<string>('todas');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroDiscapacidad, setFiltroDiscapacidad] = useState<string>('todas');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [mostrarResumen, setMostrarResumen] = useState(true);

  // Statistics for Dashboard Panel
  const stats = useMemo(() => {
    const casosUrgentes = pacientes.filter((p) => p.urgencia_actual === 'alta').length;
    const seguimientosPendientes = pacientes.filter((p) => p.seguimiento?.programado).length;
    const enEspera = pacientes.filter((p) => p.estado === 'en espera').length;
    const enAtencion = pacientes.filter((p) => p.estado === 'en atencion').length;

    // Categorías distribution for chart
    const catCounts: Record<string, number> = {};
    pacientes.forEach((p) => {
      catCounts[p.categoria_enfermedad] = (catCounts[p.categoria_enfermedad] || 0) + 1;
    });

    const chartCategorias = Object.entries(catCounts).map(([cat, count]) => ({
      name: CATEGORIAS_INFO[cat as CategoriaEnfermedad]?.label || cat,
      count,
      color: CATEGORIAS_INFO[cat as CategoriaEnfermedad]?.color || '#6B7280',
    }));

    return {
      total: pacientes.length,
      casosUrgentes,
      seguimientosPendientes,
      enEspera,
      enAtencion,
      chartCategorias,
    };
  }, [pacientes]);

  // Filtering and Sorting (High urgency first as triage queue by default)
  const filteredPacientes = useMemo(() => {
    const urgenciaWeight: Record<string, number> = {
      alta: 3,
      media: 2,
      baja: 1,
    };

    return pacientes
      .filter((p) => {
        const matchesSearch =
          p.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.dni.includes(searchTerm) ||
          p.comunidad_distrito.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesUrgencia =
          filtroUrgencia === 'todas' || p.urgencia_actual === filtroUrgencia;

        const matchesCat =
          filtroCategoria === 'todas' || p.categoria_enfermedad === filtroCategoria;

        const matchesDisc =
          filtroDiscapacidad === 'todas'
            ? true
            : filtroDiscapacidad === 'con_discapacidad'
            ? p.discapacidad !== 'ninguna'
            : p.discapacidad === filtroDiscapacidad;

        const matchesEstado = filtroEstado === 'todas' || p.estado === filtroEstado;

        return matchesSearch && matchesUrgencia && matchesCat && matchesDisc && matchesEstado;
      })
      .sort((a, b) => {
        // High urgency first by default
        const wa = urgenciaWeight[a.urgencia_actual || 'media'] || 0;
        const wb = urgenciaWeight[b.urgencia_actual || 'media'] || 0;
        return wb - wa;
      });
  }, [pacientes, searchTerm, filtroUrgencia, filtroCategoria, filtroDiscapacidad, filtroEstado]);

  const urgenciaBadge: Record<string, string> = {
    alta: 'bg-red-100 text-red-800 border-red-300',
    media: 'bg-amber-100 text-amber-800 border-amber-300',
    baja: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  const estadoBadge: Record<string, string> = {
    'en espera': 'bg-blue-100 text-blue-800 border-blue-300',
    'en atencion': 'bg-purple-100 text-purple-800 border-purple-300',
    atendido: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    derivado: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-xl font-extrabold text-[#2B2625] flex items-center gap-2">
            <User className="w-6 h-6 text-[#1E6B65]" />
            <span>Cola de Triage y Pacientes</span>
          </h2>
          <p className="text-xs text-[#5C5450] mt-0.5">
            Ordenado automáticamente por nivel de urgencia clínica
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCargarRegistroEjemplo}
            className="text-xs font-bold bg-[#FAF6EF] text-[#B84A28] hover:bg-[#F6E9E4] border border-[#B84A28] px-3 py-2 rounded-xl flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cargar 8 Pacientes Demo</span>
          </button>

          <button
            type="button"
            onClick={onAbrirNuevoPacienteModal}
            className="text-xs font-extrabold bg-[#1E6B65] hover:bg-[#134844] text-white px-3 py-2 rounded-xl flex items-center gap-1 shadow-md cursor-pointer transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Nuevo</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD PANEL RESUMEN (REQUIREMENT 5) */}
      <div className="bg-white rounded-2xl border-2 border-[#E3DAC9] p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#2B2625] flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#1E6B65]" />
            <span>Panel Resumen Clínico</span>
          </h3>
          <button
            type="button"
            onClick={() => setMostrarResumen(!mostrarResumen)}
            className="text-[11px] font-bold text-[#1E6B65] hover:underline"
          >
            {mostrarResumen ? 'Ocultar gráfico' : 'Ver gráfico'}
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-[#FAF6EF] p-2.5 rounded-xl border border-[#E3DAC9]">
            <span className="text-[10px] text-[#5C5450] block">Total</span>
            <span className="font-black text-sm text-[#2B2625]">{stats.total}</span>
          </div>
          <div className="bg-red-50 p-2.5 rounded-xl border border-red-200">
            <span className="text-[10px] text-red-700 block font-bold">Urgentes</span>
            <span className="font-black text-sm text-red-800">{stats.casosUrgentes}</span>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200">
            <span className="text-[10px] text-blue-700 block font-bold">En Espera</span>
            <span className="font-black text-sm text-blue-800">{stats.enEspera}</span>
          </div>
          <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200">
            <span className="text-[10px] text-purple-700 block font-bold">Seguimiento</span>
            <span className="font-black text-sm text-purple-800">{stats.seguimientosPendientes}</span>
          </div>
        </div>

        {/* Bar chart of disease categories */}
        {mostrarResumen && stats.chartCategorias.length > 0 && (
          <div className="pt-2 border-t border-[#E3DAC9]">
            <span className="text-[11px] text-[#5C5450] font-bold block mb-1.5">
              Distribución por Categoría de Enfermedad:
            </span>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.chartCategorias}
                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                >
                  <XAxis dataKey="name" fontSize={9} stroke="#5C5450" interval={0} />
                  <YAxis fontSize={9} stroke="#5C5450" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.chartCategorias.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border-2 border-[#E3DAC9] p-3 shadow-xs space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#5C5450] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, DNI ficticio o comunidad..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E3DAC9] text-xs focus:border-[#1E6B65]"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
          <select
            value={filtroUrgencia}
            onChange={(e) => setFiltroUrgencia(e.target.value)}
            className="p-1.5 rounded-lg border border-[#E3DAC9] bg-[#FAF6EF] text-[11px]"
          >
            <option value="todas">Urgencia: Todas</option>
            <option value="alta">🚨 Alta Prioridad</option>
            <option value="media">⚠️ Media</option>
            <option value="baja">🟢 Baja</option>
          </select>

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="p-1.5 rounded-lg border border-[#E3DAC9] bg-[#FAF6EF] text-[11px]"
          >
            <option value="todas">Categoría: Todas</option>
            <option value="respiratoria">Respiratoria</option>
            <option value="digestiva">Digestiva</option>
            <option value="cardiovascular">Cardiovascular</option>
            <option value="infecciosa">Infecciosa</option>
            <option value="dolor/trauma">Dolor / Trauma</option>
            <option value="materno-infantil">Materno-Infantil</option>
            <option value="cronica">Crónica</option>
            <option value="neurologica">Neurológica</option>
          </select>

          <select
            value={filtroDiscapacidad}
            onChange={(e) => setFiltroDiscapacidad(e.target.value)}
            className="p-1.5 rounded-lg border border-[#E3DAC9] bg-[#FAF6EF] text-[11px]"
          >
            <option value="todas">Discapacidad: Todas</option>
            <option value="con_discapacidad">Con cualquier discapacidad</option>
            <option value="visual">Visual</option>
            <option value="auditiva">Auditiva</option>
            <option value="motora">Motora</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="p-1.5 rounded-lg border border-[#E3DAC9] bg-[#FAF6EF] text-[11px]"
          >
            <option value="todas">Estado: Todos</option>
            <option value="en espera">En espera</option>
            <option value="en atencion">En atención</option>
            <option value="atendido">Atendido</option>
            <option value="derivado">Derivado</option>
          </select>
        </div>
      </div>

      {/* Patient Cards List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#5C5450] px-1">
          <span>Pacientes encontrados: <strong>{filteredPacientes.length}</strong></span>
          <span className="text-[11px] text-[#B84A28] font-bold">Prioridad Alta al inicio</span>
        </div>

        {filteredPacientes.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border-2 border-dashed border-[#E3DAC9] text-center text-xs text-[#5C5450]">
            No se encontraron pacientes con los filtros seleccionados.
          </div>
        ) : (
          filteredPacientes.map((p) => {
            const cat = CATEGORIAS_INFO[p.categoria_enfermedad] || CATEGORIAS_INFO.otra;
            const tieneDiscapacidad = p.discapacidad !== 'ninguna';
            const noLee = p.nivel_lectura === 'no lee';
            const esUrgente = p.urgencia_actual === 'alta';

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border-2 p-3.5 shadow-xs transition-all hover:border-[#1E6B65] space-y-2.5 ${
                  esUrgente ? 'border-red-300 bg-red-50/20' : 'border-[#E3DAC9]'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[#2B2625]">
                        {p.nombres} {p.apellidos}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badge}`}>
                        {cat.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C5450] mt-0.5">
                      DNI: {p.dni} • {p.edad} años • {p.comunidad_distrito}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        urgenciaBadge[p.urgencia_actual || 'media']
                      }`}
                    >
                      {p.urgencia_actual?.toUpperCase()}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border capitalize ${
                        estadoBadge[p.estado]
                      }`}
                    >
                      {p.estado}
                    </span>
                  </div>
                </div>

                {/* SPECIAL NEEDS ICONS (OBLIGATORY REQUIREMENT) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#E3DAC9]/60">
                  {noLee && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      <BookOpen className="w-3 h-3 text-amber-700" />
                      No lee (audio)
                    </span>
                  )}
                  {p.discapacidad === 'visual' && (
                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-900 border border-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      <Eye className="w-3 h-3 text-purple-700" />
                      Visual
                    </span>
                  )}
                  {p.discapacidad === 'auditiva' && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-900 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      <Ear className="w-3 h-3 text-blue-700" />
                      Auditiva
                    </span>
                  )}
                  {p.discapacidad === 'motora' && (
                    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-900 border border-orange-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      <Accessibility className="w-3 h-3 text-orange-700" />
                      Motora
                    </span>
                  )}
                  {p.seguimiento?.programado && (
                    <span className="inline-flex items-center gap-1 bg-teal-50 text-[#1E6B65] border border-[#1E6B65]/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      <Calendar className="w-3 h-3" />
                      Control: {p.seguimiento.fecha}
                    </span>
                  )}
                </div>

                {/* Action buttons per patient */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E3DAC9]">
                  <span className="text-[11px] text-[#5C5450]">
                    {p.consultas.length} consulta(s) registradas
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onIniciarNuevaConsulta(p)}
                      title="Atender consulta para este paciente"
                      className="px-2.5 py-1.5 rounded-lg bg-[#FAF6EF] text-[#1E6B65] border border-[#1E6B65] hover:bg-[#E2EFEF] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Atender</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSeleccionarPaciente(p)}
                      className="px-3 py-1.5 rounded-lg bg-[#1E6B65] text-white hover:bg-[#134844] text-xs font-extrabold shadow-xs cursor-pointer"
                    >
                      Ver Ficha
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
