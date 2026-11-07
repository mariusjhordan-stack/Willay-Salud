import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Stethoscope,
  Send,
  Volume2,
  Code,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileDown,
  Share2,
  History,
  ClipboardList,
  Check,
  Users,
  Shield,
  Tag,
  ArrowLeft,
  Maximize2,
  Minimize2,
  LogOut,
  Calendar,
  Activity,
  UserPlus,
  Search,
  BookOpen,
  Eye,
  Ear,
  Accessibility,
  Plus,
} from 'lucide-react';
import {
  FichaClinica,
  DoctorRespuesta,
  ConsultaHistorial,
  DoctorUser,
  Paciente,
  CategoriaEnfermedad,
  EstadoPaciente,
} from '../types';
import { evaluarUrgencia } from '../utils/evaluarUrgencia';
import { sugerirCategoriaEnfermedad, CATEGORIAS_INFO } from '../utils/categoriaEnfermedad';
import { PreguntasRapidas } from './PreguntasRapidas';
import { HistorialView } from './HistorialView';
import { PacientesLista } from './PacientesLista';
import { PacienteDetalleModal } from './PacienteDetalleModal';
import { AuditoriaView } from './AuditoriaView';
import { exportarFichaPDF, generarTextoWhatsApp } from '../utils/exportUtils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface DoctorViewProps {
  ficha: FichaClinica | null;
  pacientes: Paciente[];
  doctorUser: DoctorUser;
  onSendResponse: (textoEspanol: string) => Promise<DoctorRespuesta>;
  onLoadDemoCase: (demoId: number) => void;
  onActualizarRespuestasPreguntas: (preguntaId: string, respuesta: 'si' | 'no') => void;
  onActualizarCategoriaFicha: (categoria: CategoriaEnfermedad) => void;
  consultasHistorial: ConsultaHistorial[];
  onCargarDatosEjemplo: () => void;
  onLimpiarHistorial: () => void;
  onSeleccionarConsulta: (consulta: ConsultaHistorial) => void;
  onActualizarEstadoPaciente: (pacienteId: string, nuevoEstado: EstadoPaciente) => void;
  onAgregarNotaPaciente: (pacienteId: string, nota: string) => void;
  onProgramarSeguimientoPaciente: (pacienteId: string, fecha: string, motivo: string) => void;
  onAbrirNuevoPacienteModal: () => void;
  onCargarRegistroEjemplo: () => void;
  onIniciarNuevaConsulta: (paciente: Paciente) => void;
  onLogout: () => void;
  onToast: (msg: string) => void;
  isLoading: boolean;
}

export const DoctorView: React.FC<DoctorViewProps> = ({
  ficha,
  pacientes,
  doctorUser,
  onSendResponse,
  onLoadDemoCase,
  onActualizarRespuestasPreguntas,
  onActualizarCategoriaFicha,
  consultasHistorial,
  onCargarDatosEjemplo,
  onLimpiarHistorial,
  onSeleccionarConsulta,
  onActualizarEstadoPaciente,
  onAgregarNotaPaciente,
  onProgramarSeguimientoPaciente,
  onAbrirNuevoPacienteModal,
  onCargarRegistroEjemplo,
  onIniciarNuevaConsulta,
  onLogout,
  onToast,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'pacientes' | 'ficha' | 'historial' | 'auditoria'>(
    ficha ? 'ficha' : 'pacientes'
  );
  const [pacienteSeleccionadoModal, setPacienteSeleccionadoModal] = useState<Paciente | null>(null);
  const [respuestaEspanol, setRespuestaEspanol] = useState('');
  const [doctorRespuesta, setDoctorRespuesta] = useState<DoctorRespuesta | null>(null);
  const [showJsonRaw, setShowJsonRaw] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiadoWhatsapp, setCopiadoWhatsapp] = useState(false);
  const [isFullscreenQuechua, setIsFullscreenQuechua] = useState(false);

  // Search and filter state for Zone 1 in Desktop 3-zone layout
  const [desktopSearchTerm, setDesktopSearchTerm] = useState('');
  const [desktopFiltroUrgencia, setDesktopFiltroUrgencia] = useState('todas');
  const [desktopFiltroCat, setDesktopFiltroCat] = useState('todas');

  const quickPhrases = [
    '¿Desde cuándo le duele?',
    'Vamos a revisarle la presión y el pulso',
    'Tome esta pastilla después de cada comida con agua tibia',
    'Descanse y guarde reposo por dos días',
    'Debe ir al centro de salud para un examen más detallado',
  ];

  // Evaluar banderas rojas
  const alertasBanderaRoja = evaluarUrgencia(ficha);

  // Sugerir categoría
  const categoriaSugerida: CategoriaEnfermedad =
    ficha?.categoria_enfermedad ||
    sugerirCategoriaEnfermedad(
      ficha?.zona_cuerpo,
      ficha?.sintomas,
      ficha?.respuestas_preguntas
    );

  // Stats for top cards
  const stats = useMemo(() => {
    const urgentes = pacientes.filter((p) => p.urgencia_actual === 'alta').length;
    const enEspera = pacientes.filter((p) => p.estado === 'en espera').length;
    const seguimientos = pacientes.filter((p) => p.seguimiento?.programado).length;
    return {
      total: pacientes.length,
      urgentes,
      enEspera,
      seguimientos,
    };
  }, [pacientes]);

  // Filtered patients for Desktop Zone 1
  const desktopFilteredPacientes = useMemo(() => {
    return pacientes
      .filter((p) => {
        const matchesSearch =
          p.nombres.toLowerCase().includes(desktopSearchTerm.toLowerCase()) ||
          p.apellidos.toLowerCase().includes(desktopSearchTerm.toLowerCase()) ||
          p.dni.includes(desktopSearchTerm) ||
          p.comunidad_distrito.toLowerCase().includes(desktopSearchTerm.toLowerCase());

        const matchesUrgencia =
          desktopFiltroUrgencia === 'todas' || p.urgencia_actual === desktopFiltroUrgencia;

        const matchesCat =
          desktopFiltroCat === 'todas' || p.categoria_enfermedad === desktopFiltroCat;

        return matchesSearch && matchesUrgencia && matchesCat;
      })
      .sort((a, b) => {
        const w: Record<string, number> = { alta: 3, media: 2, baja: 1 };
        return (w[b.urgencia_actual || 'media'] || 0) - (w[a.urgencia_actual || 'media'] || 0);
      });
  }, [pacientes, desktopSearchTerm, desktopFiltroUrgencia, desktopFiltroCat]);

  // Recharts data for Zone 3
  const chartData = useMemo(() => {
    return [...consultasHistorial]
      .reverse()
      .map((c, index) => ({
        index: index + 1,
        fecha: c.fecha.split(',')[0] || c.fecha,
        intensidad: c.intensidad,
      }));
  }, [consultasHistorial]);

  const handleSend = async () => {
    if (!respuestaEspanol.trim()) return;
    setIsTranslating(true);
    try {
      const res = await onSendResponse(respuestaEspanol);
      setDoctorRespuesta(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsPlayingAudio(true);
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Tu navegador no soporta síntesis de voz.');
    }
  };

  const handleDescargarPDF = () => {
    if (!ficha) return;
    try {
      exportarFichaPDF(ficha);
      onToast('Ficha descargada en formato PDF.');
    } catch (err: any) {
      console.error('Error generando PDF:', err);
      onToast('Error al exportar PDF.');
    }
  };

  const handleCopiarWhatsApp = async () => {
    if (!ficha) return;
    try {
      const texto = generarTextoWhatsApp(ficha);
      await navigator.clipboard.writeText(texto);
      setCopiadoWhatsapp(true);
      onToast('Resumen copiado para WhatsApp al portapapeles.');
      setTimeout(() => setCopiadoWhatsapp(false), 3000);
    } catch {
      onToast('No se pudo copiar automáticamente.');
    }
  };

  // Nav Subtabs (for mobile & tablet < lg)
  const renderMobileNavTabs = () => (
    <div className="lg:hidden flex items-center gap-1.5 bg-[#FAF6EF] p-1.5 rounded-2xl border border-[#E3DAC9] mb-4 overflow-x-auto">
      <button
        type="button"
        onClick={() => setActiveTab('pacientes')}
        className={`flex-1 py-2 px-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'pacientes'
            ? 'bg-[#1E6B65] text-white shadow-sm'
            : 'text-[#5C5450] hover:text-[#2B2625]'
        }`}
      >
        <Users className="w-3.5 h-3.5" />
        <span>Pacientes ({pacientes.length})</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('ficha')}
        className={`flex-1 py-2 px-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'ficha'
            ? 'bg-[#1E6B65] text-white shadow-sm'
            : 'text-[#5C5450] hover:text-[#2B2625]'
        }`}
      >
        <ClipboardList className="w-3.5 h-3.5" />
        <span>Ficha</span>
        {alertasBanderaRoja.length > 0 && (
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
        )}
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('historial')}
        className={`flex-1 py-2 px-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'historial'
            ? 'bg-[#1E6B65] text-white shadow-sm'
            : 'text-[#5C5450] hover:text-[#2B2625]'
        }`}
      >
        <History className="w-3.5 h-3.5" />
        <span>Historial</span>
      </button>

      {doctorUser.rol === 'admin' && (
        <button
          type="button"
          onClick={() => setActiveTab('auditoria')}
          className={`flex-1 py-2 px-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'auditoria'
              ? 'bg-[#B84A28] text-white shadow-sm'
              : 'text-[#5C5450] hover:text-[#2B2625]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Auditoría</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full relative">
      {/* DESKTOP SIDEBAR (lg and up) */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r-2 border-[#E3DAC9] z-30 p-4 justify-between shadow-xs">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-9 h-9 rounded-2xl bg-[#B84A28] text-white flex items-center justify-center font-black text-lg shadow-sm">
              W
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-[#2B2625] leading-none">
                Willay Salud
              </h1>
              <span className="text-[10px] font-bold text-[#1E6B65] uppercase tracking-wider block mt-0.5">
                Panel Clínico Médico
              </span>
            </div>
          </div>

          {/* Doctor Info Card */}
          <div className="p-3 bg-[#FAF6EF] rounded-2xl border border-[#E3DAC9] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#2B2625] truncate">
                {doctorUser.nombre}
              </span>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase ${
                  doctorUser.rol === 'admin'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {doctorUser.rol}
              </span>
            </div>
            <p className="text-[10px] text-[#5C5450] truncate">{doctorUser.email}</p>
            <p className="text-[10px] text-[#1E6B65] font-semibold">{doctorUser.especialidad}</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('pacientes')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'pacientes' || activeTab === 'ficha'
                  ? 'bg-[#1E6B65] text-white shadow-xs'
                  : 'text-[#5C5450] hover:bg-[#FAF6EF] hover:text-[#2B2625]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Estación Clínica / Triage</span>
              </div>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-black">
                {pacientes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('historial')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'historial'
                  ? 'bg-[#1E6B65] text-white shadow-xs'
                  : 'text-[#5C5450] hover:bg-[#FAF6EF] hover:text-[#2B2625]'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historial & Gráfico</span>
            </button>

            {doctorUser.rol === 'admin' && (
              <button
                type="button"
                onClick={() => setActiveTab('auditoria')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  activeTab === 'auditoria'
                    ? 'bg-[#B84A28] text-white shadow-xs'
                    : 'text-[#5C5450] hover:bg-[#FAF6EF] hover:text-[#2B2625]'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Auditoría de Accesos</span>
              </button>
            )}
          </nav>
        </div>

        {/* Bottom Sidebar Actions */}
        <div className="space-y-2 pt-4 border-t border-[#E3DAC9]">
          <button
            type="button"
            onClick={onCargarRegistroEjemplo}
            className="w-full py-2 px-3 rounded-xl bg-[#FAF6EF] hover:bg-[#F6E9E4] text-[#B84A28] border border-[#B84A28] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>8 Pacientes Demo</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-red-50 text-red-700 border border-red-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="lg:pl-68 w-full space-y-4">
        {/* Mobile/Tablet Subtabs */}
        {renderMobileNavTabs()}

        {/* TOP SUMMARY METRICS CARDS (VISIBLE ON ALL SCREENS, EXPANDED IN DESKTOP) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white p-3.5 rounded-2xl border-2 border-[#E3DAC9] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6EF] text-[#2B2625] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#1E6B65]" />
            </div>
            <div>
              <span className="text-[10px] text-[#5C5450] font-bold block uppercase">
                Pacientes Totales
              </span>
              <span className="text-xl font-black text-[#2B2625]">{stats.total}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-2 border-red-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-red-700 font-bold block uppercase">
                Casos Urgentes
              </span>
              <span className="text-xl font-black text-red-700">{stats.urgentes}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-2 border-blue-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-blue-700 font-bold block uppercase">
                En Espera
              </span>
              <span className="text-xl font-black text-blue-800">{stats.enEspera}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border-2 border-purple-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-purple-700 font-bold block uppercase">
                Seguimientos
              </span>
              <span className="text-xl font-black text-purple-800">{stats.seguimientos}</span>
            </div>
          </div>
        </div>

        {/* FULL WIDTH TAB: HISTORIAL */}
        {activeTab === 'historial' && (
          <HistorialView
            consultas={consultasHistorial}
            onCargarDatosEjemplo={onCargarDatosEjemplo}
            onLimpiarHistorial={onLimpiarHistorial}
            onSeleccionarConsulta={(c) => {
              onSeleccionarConsulta(c);
              setActiveTab('ficha');
            }}
          />
        )}

        {/* FULL WIDTH TAB: AUDITORÍA (ADMIN) */}
        {activeTab === 'auditoria' && doctorUser.rol === 'admin' && <AuditoriaView />}

        {/* MOBILE / TABLET ONLY VIEWS (< lg) */}
        <div className="lg:hidden">
          {activeTab === 'pacientes' && (
            <PacientesLista
              pacientes={pacientes}
              onSeleccionarPaciente={(p) => setPacienteSeleccionadoModal(p)}
              onAbrirNuevoPacienteModal={onAbrirNuevoPacienteModal}
              onCargarRegistroEjemplo={onCargarRegistroEjemplo}
              onIniciarNuevaConsulta={(p) => {
                onIniciarNuevaConsulta(p);
                setActiveTab('ficha');
              }}
            />
          )}
        </div>

        {/* DESKTOP 3-ZONE CLINICAL WORKSTATION (lg and up) & MOBILE FICHA */}
        {(activeTab === 'ficha' || (activeTab === 'pacientes' && window.innerWidth >= 1024)) && (
          <div className="space-y-4">
            {/* DESKTOP 3-ZONE GRID */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-start">
              {/* ZONE 1: LISTA DE PACIENTES (COL-SPAN-4) */}
              <div className="lg:col-span-4 bg-white rounded-3xl border-2 border-[#E3DAC9] p-4 shadow-sm space-y-3 max-h-[820px] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[#2B2625] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#1E6B65]" />
                    <span>Cola de Triage</span>
                  </h3>
                  <button
                    type="button"
                    onClick={onAbrirNuevoPacienteModal}
                    className="p-1.5 rounded-lg bg-[#1E6B65] text-white hover:bg-[#134844] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo</span>
                  </button>
                </div>

                {/* Search & Filters */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#5C5450] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={desktopSearchTerm}
                      onChange={(e) => setDesktopSearchTerm(e.target.value)}
                      placeholder="Buscar por DNI o nombre..."
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-[#E3DAC9] focus:border-[#1E6B65]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <select
                      value={desktopFiltroUrgencia}
                      onChange={(e) => setDesktopFiltroUrgencia(e.target.value)}
                      className="p-1 rounded-lg border border-[#E3DAC9] bg-[#FAF6EF]"
                    >
                      <option value="todas">Urgencia: Todas</option>
                      <option value="alta">🚨 Alta</option>
                      <option value="media">⚠️ Media</option>
                      <option value="baja">🟢 Baja</option>
                    </select>

                    <select
                      value={desktopFiltroCat}
                      onChange={(e) => setDesktopFiltroCat(e.target.value)}
                      className="p-1 rounded-lg border border-[#E3DAC9] bg-[#FAF6EF]"
                    >
                      <option value="todas">Categoría: Todas</option>
                      <option value="respiratoria">Respiratoria</option>
                      <option value="digestiva">Digestiva</option>
                      <option value="cardiovascular">Cardiovascular</option>
                      <option value="materno-infantil">Materno-Infantil</option>
                    </select>
                  </div>
                </div>

                {/* Patient Cards in Zone 1 */}
                <div className="space-y-2">
                  {desktopFilteredPacientes.map((p) => {
                    const esUrgente = p.urgencia_actual === 'alta';
                    const cat = CATEGORIAS_INFO[p.categoria_enfermedad] || CATEGORIAS_INFO.otra;
                    const noLee = p.nivel_lectura === 'no lee';

                    return (
                      <div
                        key={p.id}
                        onClick={() => onIniciarNuevaConsulta(p)}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer hover:border-[#1E6B65] space-y-1.5 ${
                          esUrgente
                            ? 'bg-red-50/30 border-red-200'
                            : 'bg-[#FAF6EF] border-[#E3DAC9]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <strong className="text-xs text-[#2B2625] block leading-tight">
                              {p.nombres} {p.apellidos}
                            </strong>
                            <span className="text-[10px] text-[#5C5450]">
                              {p.edad}a • {p.comunidad_distrito.split(',')[0]}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              esUrgente
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {p.urgencia_actual}
                          </span>
                        </div>

                        {/* Special needs icons */}
                        <div className="flex flex-wrap items-center gap-1 text-[9px]">
                          <span className={`px-1.5 py-0.5 rounded border ${cat.badge}`}>
                            {cat.label}
                          </span>
                          {noLee && (
                            <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-bold">
                              <BookOpen className="w-2.5 h-2.5" /> No lee
                            </span>
                          )}
                          {p.discapacidad === 'visual' && (
                            <span className="inline-flex items-center gap-0.5 bg-purple-100 text-purple-900 px-1 py-0.5 rounded font-bold">
                              <Eye className="w-2.5 h-2.5" /> Visual
                            </span>
                          )}
                          {p.discapacidad === 'auditiva' && (
                            <span className="inline-flex items-center gap-0.5 bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-bold">
                              <Ear className="w-2.5 h-2.5" /> Auditiva
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ZONE 2: FICHA CLÍNICA DEL PACIENTE (COL-SPAN-4) */}
              <div className="lg:col-span-4 bg-white rounded-3xl border-2 border-[#E3DAC9] p-4 shadow-sm space-y-4 max-h-[820px] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#E3DAC9] pb-2.5">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#1E6B65]" />
                    <h3 className="font-extrabold text-sm text-[#2B2625]">
                      Ficha de Triage
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleDescargarPDF}
                      title="Descargar PDF"
                      className="p-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#E2EFEF] text-[#1E6B65] border border-[#E3DAC9] text-xs font-bold"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopiarWhatsApp}
                      title="Copiar para WhatsApp"
                      className="p-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#E2EFEF] text-[#1E6B65] border border-[#E3DAC9] text-xs font-bold"
                    >
                      {copiadoWhatsapp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {!ficha ? (
                  <div className="text-center py-12 text-xs text-[#5C5450] space-y-2">
                    <Stethoscope className="w-8 h-8 text-[#1E6B65] mx-auto opacity-50" />
                    <p>Selecciona un paciente en la lista o usa el modo demo para iniciar la consulta.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Urgencia y Categoría */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          ficha.urgencia === 'alta'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        Urgencia: {ficha.urgencia}
                      </span>

                      <div className="flex items-center gap-1 bg-[#FAF6EF] px-2 py-0.5 rounded-lg border border-[#E3DAC9]">
                        <Tag className="w-3 h-3 text-[#1E6B65]" />
                        <select
                          value={categoriaSugerida}
                          onChange={(e) => onActualizarCategoriaFicha(e.target.value as CategoriaEnfermedad)}
                          className="text-xs font-bold bg-transparent text-[#2B2625] focus:outline-hidden"
                        >
                          <option value="digestiva">Digestiva</option>
                          <option value="respiratoria">Respiratoria</option>
                          <option value="cardiovascular">Cardiovascular</option>
                          <option value="materno-infantil">Materno-Infantil</option>
                          <option value="infecciosa">Infecciosa</option>
                          <option value="dolor/trauma">Dolor / Trauma</option>
                        </select>
                      </div>
                    </div>

                    {/* Quechua Original & Spanish Translation */}
                    <div className="bg-[#FAF6EF] p-3 rounded-2xl border border-[#E3DAC9] space-y-1">
                      <span className="text-[10px] font-bold text-[#B84A28] uppercase tracking-wider block">
                        Original en Quechua:
                      </span>
                      <p className="text-sm font-bold text-[#2B2625]">
                        "{ficha.transcripcion_quechua}"
                      </p>
                    </div>

                    <div className="bg-[#E2EFEF] p-3 rounded-2xl border border-[#1E6B65]/30 space-y-1">
                      <span className="text-[10px] font-bold text-[#1E6B65] uppercase tracking-wider block">
                        Interpretación al Español:
                      </span>
                      <p className="text-sm font-bold text-[#134844]">
                        {ficha.traduccion_espanol}
                      </p>
                    </div>

                    {/* Grid of vitals */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#FAF6EF] p-2.5 rounded-xl border border-[#E3DAC9]">
                        <span className="text-[10px] text-[#5C5450] block font-bold">Síntomas</span>
                        <strong className="text-[#2B2625]">{ficha.sintomas.join(', ')}</strong>
                      </div>
                      <div className="bg-[#FAF6EF] p-2.5 rounded-xl border border-[#E3DAC9]">
                        <span className="text-[10px] text-[#5C5450] block font-bold">Zona</span>
                        <strong className="text-[#2B2625] capitalize">{ficha.zona_cuerpo}</strong>
                      </div>
                      <div className="bg-[#FAF6EF] p-2.5 rounded-xl border border-[#E3DAC9]">
                        <span className="text-[10px] text-[#5C5450] block font-bold">Duración</span>
                        <strong className="text-[#2B2625]">{ficha.duracion}</strong>
                      </div>
                      <div className="bg-[#FAF6EF] p-2.5 rounded-xl border border-[#E3DAC9]">
                        <span className="text-[10px] text-[#5C5450] block font-bold">Dolor</span>
                        <strong className="text-[#B84A28]">{ficha.intensidad}/5</strong>
                      </div>
                    </div>

                    {/* JSON raw button */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowJsonRaw(!showJsonRaw)}
                        className="text-[11px] font-bold text-[#1E6B65] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Code className="w-3 h-3" />
                        <span>{showJsonRaw ? 'Ocultar JSON' : 'Ver JSON'}</span>
                      </button>
                      {showJsonRaw && (
                        <div className="mt-2 bg-[#2B2625] text-emerald-400 p-2.5 rounded-xl font-mono text-[10px] overflow-x-auto">
                          <pre>{JSON.stringify(ficha, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ZONE 3: ALERTAS, PREGUNTAS SÍ/NO Y RESPUESTA AL PACIENTE (COL-SPAN-4) */}
              <div className="lg:col-span-4 space-y-4 max-h-[820px] overflow-y-auto">
                {/* Alertas de bandera roja */}
                {alertasBanderaRoja.length > 0 && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-3xl p-3.5 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-red-900">
                      <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                      <strong className="text-xs uppercase font-black">
                        Bandera Roja Activa
                      </strong>
                    </div>
                    {alertasBanderaRoja.map((a) => (
                      <div key={a.id} className="bg-white p-2 rounded-xl border border-red-200 text-xs">
                        <span className="font-bold text-red-900 block">{a.motivo}</span>
                        <span className="text-[11px] text-red-700 block mt-0.5">{a.recomendacion}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Preguntas Rápidas */}
                <PreguntasRapidas
                  respuestas={ficha?.respuestas_preguntas || {}}
                  onGuardarRespuesta={onActualizarRespuestasPreguntas}
                />

                {/* Historial Evolutivo con Recharts */}
                {chartData.length > 0 && (
                  <div className="bg-white rounded-3xl border-2 border-[#E3DAC9] p-3.5 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-[#2B2625] flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#B84A28]" />
                      <span>Evolución de Intensidad del Dolor</span>
                    </span>
                    <div className="h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F0E8DC" />
                          <XAxis dataKey="fecha" fontSize={8} stroke="#5C5450" />
                          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} fontSize={8} stroke="#5C5450" />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="intensidad"
                            stroke="#B84A28"
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: '#B84A28' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Doctor Response Section */}
                <div className="bg-white rounded-3xl border-2 border-[#1E6B65] p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#2B2625]">
                      <Send className="w-4 h-4 text-[#1E6B65]" />
                      <span>Respuesta al Paciente</span>
                    </div>
                    {doctorRespuesta && (
                      <button
                        type="button"
                        onClick={() => setIsFullscreenQuechua(true)}
                        className="text-[11px] font-bold text-[#1E6B65] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Pantalla Completa</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {quickPhrases.slice(0, 3).map((phrase) => (
                      <button
                        key={phrase}
                        type="button"
                        onClick={() => setRespuestaEspanol(phrase)}
                        className="text-[10px] bg-[#FAF6EF] hover:bg-[#E2EFEF] text-[#2B2625] px-2 py-1 rounded-lg border border-[#E3DAC9] transition-colors cursor-pointer text-left"
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={respuestaEspanol}
                    onChange={(e) => setRespuestaEspanol(e.target.value)}
                    placeholder="Instrucción médica..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs focus:border-[#1E6B65]"
                  />

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isTranslating || !respuestaEspanol.trim()}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#1E6B65] hover:bg-[#134844] text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isTranslating ? (
                      <span>Traduciendo al Quechua...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Traducir y Mostrar al Paciente</span>
                      </>
                    )}
                  </button>

                  {/* Doctor Quechua Result in card */}
                  {doctorRespuesta && (
                    <div className="bg-[#FAF6EF] border-2 border-[#B84A28] rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#B84A28] uppercase">
                          Texto en Quechua:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSpeak(doctorRespuesta.traduccion_quechua)}
                            className="text-[10px] font-bold text-[#B84A28] hover:underline flex items-center gap-1"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Audio</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsFullscreenQuechua(true)}
                            className="text-[10px] font-bold text-[#1E6B65] hover:underline flex items-center gap-1"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Ampliar</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-base font-black text-[#B84A28] leading-snug">
                        "{doctorRespuesta.traduccion_quechua}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MOBILE ONLY FICHA VIEW (< lg) */}
            <div className="lg:hidden space-y-4">
              {/* Main Ficha for mobile */}
              {ficha && (
                <div className="bg-white rounded-2xl border-2 border-[#E3DAC9] p-4 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-[#E3DAC9] pb-3">
                    <span
                      className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border ${
                        ficha.urgencia === 'alta'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      Urgencia: {ficha.urgencia}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowJsonRaw(!showJsonRaw)}
                      className="text-xs font-bold text-[#1E6B65] flex items-center gap-1"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>{showJsonRaw ? 'Ocultar JSON' : 'Ver JSON'}</span>
                    </button>
                  </div>

                  <div className="bg-[#FAF6EF] p-3 rounded-xl border border-[#E3DAC9]">
                    <span className="text-[10px] font-bold text-[#B84A28] uppercase block">
                      Original Quechua:
                    </span>
                    <p className="text-sm font-bold text-[#2B2625]">"{ficha.transcripcion_quechua}"</p>
                  </div>

                  <div className="bg-[#E2EFEF] p-3 rounded-xl border border-[#1E6B65]/30">
                    <span className="text-[10px] font-bold text-[#1E6B65] uppercase block">
                      Español:
                    </span>
                    <p className="text-sm font-bold text-[#134844]">{ficha.traduccion_espanol}</p>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#FAF6EF] p-2.5 rounded-xl border border-[#E3DAC9]">
                      <span className="text-[10px] text-[#5C5450] block font-bold">Síntomas</span>
                      <strong>{ficha.sintomas.join(', ')}</strong>
                    </div>
                    <div className="bg-[#FAF6EF] p-2.5 rounded-xl border border-[#E3DAC9]">
                      <span className="text-[10px] text-[#5C5450] block font-bold">Zona</span>
                      <strong className="capitalize">{ficha.zona_cuerpo}</strong>
                    </div>
                  </div>

                  {/* Guided questions */}
                  <PreguntasRapidas
                    respuestas={ficha.respuestas_preguntas || {}}
                    onGuardarRespuesta={onActualizarRespuestasPreguntas}
                  />

                  {/* Doctor response for mobile */}
                  <div className="space-y-2 pt-2 border-t border-[#E3DAC9]">
                    <div className="flex flex-wrap gap-1">
                      {quickPhrases.map((phrase) => (
                        <button
                          key={phrase}
                          type="button"
                          onClick={() => setRespuestaEspanol(phrase)}
                          className="text-[10px] bg-[#FAF6EF] p-1.5 rounded-lg border border-[#E3DAC9]"
                        >
                          {phrase}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={respuestaEspanol}
                      onChange={(e) => setRespuestaEspanol(e.target.value)}
                      placeholder="Respuesta médica..."
                      rows={2}
                      className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs"
                    />

                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={isTranslating || !respuestaEspanol.trim()}
                      className="w-full py-3 rounded-xl bg-[#1E6B65] text-white font-extrabold text-xs"
                    >
                      {isTranslating ? 'Traduciendo...' : 'Traducir al Quechua'}
                    </button>

                    {doctorRespuesta && (
                      <div className="bg-[#FAF6EF] border-2 border-[#B84A28] rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#B84A28]">PARA EL PACIENTE:</span>
                          <button
                            type="button"
                            onClick={() => setIsFullscreenQuechua(true)}
                            className="text-xs font-bold text-[#1E6B65] flex items-center gap-1"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Pantalla Completa</span>
                          </button>
                        </div>
                        <p className="text-2xl font-black text-[#B84A28]">
                          "{doctorRespuesta.traduccion_quechua}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FULLSCREEN QUECHUA MODAL (PATIENT SHOWCASE DISPLAY) */}
      {isFullscreenQuechua && doctorRespuesta && (
        <div className="fixed inset-0 bg-[#FAF6EF] z-50 flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b-2 border-[#E3DAC9] pb-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#B84A28] text-white text-xs sm:text-sm font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                Hampikuqpa Simin (Indicación del Médico)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreenQuechua(false)}
              className="py-2 px-4 rounded-2xl bg-[#2B2625] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:bg-black cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Cerrar Pantalla Completa</span>
            </button>
          </div>

          {/* EXTRA LARGE QUECHUA TEXT FOR PATIENT VIEW */}
          <div className="my-auto text-center space-y-6 max-w-4xl mx-auto">
            <span className="text-xs sm:text-sm font-bold text-[#5C5450] uppercase tracking-widest block">
              Quechua (Texto en tamaño gigante para el paciente):
            </span>
            <p className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#B84A28] leading-tight tracking-tight drop-shadow-xs">
              "{doctorRespuesta.traduccion_quechua}"
            </p>

            {doctorRespuesta.guia_pronunciacion && (
              <p className="text-xs sm:text-base text-[#1E6B65] font-semibold italic">
                Guía fonética: {doctorRespuesta.guia_pronunciacion}
              </p>
            )}
          </div>

          {/* Bottom Bar in Fullscreen */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-[#E3DAC9]">
            <p className="text-xs sm:text-sm text-[#5C5450] italic">
              Original en español: "{doctorRespuesta.texto_original}"
            </p>

            <button
              type="button"
              onClick={() => handleSpeak(doctorRespuesta.traduccion_quechua)}
              className="py-3 px-6 rounded-2xl bg-[#1E6B65] text-white font-black text-sm flex items-center gap-2 shadow-lg hover:bg-[#134844] cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
              <span>{isPlayingAudio ? 'Reproduciendo audio...' : 'Escuchar en Quechua'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DEL PACIENTE */}
      {pacienteSeleccionadoModal && (
        <PacienteDetalleModal
          paciente={pacienteSeleccionadoModal}
          onClose={() => setPacienteSeleccionadoModal(null)}
          onActualizarEstado={onActualizarEstadoPaciente}
          onAgregarNota={onAgregarNotaPaciente}
          onProgramarSeguimiento={onProgramarSeguimientoPaciente}
          onIniciarNuevaConsulta={(p) => {
            setPacienteSeleccionadoModal(null);
            onIniciarNuevaConsulta(p);
            setActiveTab('ficha');
          }}
          doctorNombreActual={doctorUser.nombre}
        />
      )}
    </div>
  );
};
