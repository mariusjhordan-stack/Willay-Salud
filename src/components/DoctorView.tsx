import React, { useState } from 'react';
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

  const quickPhrases = [
    '¿Desde cuándo le duele?',
    'Vamos a revisarle la presión y el pulso',
    'Tome esta pastilla después de cada comida con agua tibia',
    'Descanse y guarde reposo por dos días',
    'Debe ir al centro de salud para un examen más detallado',
  ];

  // Evaluar banderas rojas
  const alertasBanderaRoja = evaluarUrgencia(ficha);

  // Sugerir categoría si no está fijada
  const categoriaSugerida: CategoriaEnfermedad =
    ficha?.categoria_enfermedad ||
    sugerirCategoriaEnfermedad(
      ficha?.zona_cuerpo,
      ficha?.sintomas,
      ficha?.respuestas_preguntas
    );

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

  // Nav Subtabs
  const renderNavTabs = () => (
    <div className="flex items-center gap-1.5 bg-[#FAF6EF] p-1.5 rounded-2xl border border-[#E3DAC9] mb-4 overflow-x-auto">
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
        <span>Ficha Actual</span>
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

      {/* Admin Only Tab */}
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
    <div className="space-y-4">
      {renderNavTabs()}

      {/* TAB 1: PACIENTES LIST */}
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

      {/* TAB 3: HISTORIAL */}
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

      {/* TAB 4: AUDITORÍA (ADMIN) */}
      {activeTab === 'auditoria' && doctorUser.rol === 'admin' && <AuditoriaView />}

      {/* TAB 2: ACTIVE CLINICAL SHEET */}
      {activeTab === 'ficha' && (
        <>
          {!ficha ? (
            <div className="bg-white rounded-2xl p-6 border-2 border-[#E3DAC9] text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-[#FAF6EF] rounded-full flex items-center justify-center mx-auto text-[#1E6B65]">
                <Stethoscope className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[#2B2625]">
                Bandeja Médica sin Ficha Activa
              </h2>
              <p className="text-xs text-[#5C5450] max-w-sm mx-auto">
                No hay una consulta en curso. Puedes atender un paciente de la cola o cargar un caso del modo demo.
              </p>

              <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => onLoadDemoCase(0)}
                  className="w-full py-3 px-4 rounded-xl bg-[#1E6B65] text-white font-bold text-sm shadow-md hover:bg-[#134844] transition-all cursor-pointer"
                >
                  Cargar Caso Demo: Dolor de Barriga
                </button>
                <button
                  type="button"
                  onClick={() => onLoadDemoCase(2)}
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 text-white font-bold text-sm shadow-md hover:bg-amber-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Cargar Caso Demo Baja Confianza (&lt; 0.60)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header Title & Actions */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-[#1E6B65]" />
                  <h3 className="text-base font-extrabold text-[#2B2625]">
                    Ficha de Triage en Curso
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDescargarPDF}
                    title="Descargar ficha en PDF"
                    className="p-2 rounded-xl bg-white border-2 border-[#E3DAC9] text-[#1E6B65] hover:bg-[#FAF6EF] shadow-xs flex items-center gap-1 text-xs font-bold cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopiarWhatsApp}
                    title="Copiar resumen para WhatsApp"
                    className={`p-2 rounded-xl border-2 flex items-center gap-1 text-xs font-bold cursor-pointer transition-colors ${
                      copiadoWhatsapp
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-white border-[#E3DAC9] text-[#1E6B65] hover:bg-[#FAF6EF]'
                    }`}
                  >
                    {copiadoWhatsapp ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* REGLA 2: ALERTAS DE BANDERA ROJA */}
              {alertasBanderaRoja.length > 0 && (
                <div className="bg-red-50 border-3 border-red-600 rounded-2xl p-4 shadow-lg space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-black text-red-900 text-base uppercase tracking-tight flex items-center gap-2">
                        <span>🚨 ALERTA DE BANDERA ROJA</span>
                        <span className="text-[10px] bg-red-200 text-red-900 px-2 py-0.5 rounded-full font-bold">
                          {alertasBanderaRoja.length} criterio(s)
                        </span>
                      </h3>
                      <p className="text-xs text-red-800 font-semibold mt-0.5">
                        Alerta de apoyo a la decisión clínica. No reemplaza el diagnóstico médico.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {alertasBanderaRoja.map((alerta) => (
                      <div
                        key={alerta.id}
                        className="bg-white/95 rounded-xl p-3 border-2 border-red-300 shadow-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-red-900">
                            {alerta.motivo}
                          </span>
                          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                            {alerta.regla}
                          </span>
                        </div>
                        <p className="text-xs text-red-800 font-medium leading-relaxed">
                          <strong>Acción sugerida:</strong> {alerta.recomendacion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confianza < 0.60 warning */}
              {ficha.confianza < 0.6 && !alertasBanderaRoja.some((a) => a.id === 'baja_confianza_grave') && (
                <div className="bg-red-50 border-3 border-red-500 rounded-2xl p-4 shadow-md flex items-start gap-3">
                  <ShieldAlert className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-black text-red-900 text-base uppercase tracking-tight">
                      ⚠️ Traducción poco segura, confirmar con el paciente
                    </h3>
                    <p className="text-xs text-red-800 mt-1 font-medium leading-relaxed">
                      El nivel de confianza del modelo lingüístico es de{' '}
                      <strong>{(ficha.confianza * 100).toFixed(0)}%</strong> (menor a 60%). Verifique
                      directamente con el paciente.
                    </p>
                  </div>
                </div>
              )}

              {/* Main Clinical Card */}
              <div className="bg-white rounded-2xl border-2 border-[#E3DAC9] p-5 shadow-sm space-y-4">
                {/* Categoría de Enfermedad & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E3DAC9] pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border ${
                        ficha.urgencia === 'alta'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : ficha.urgencia === 'media'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      Urgencia: {ficha.urgencia}
                    </span>

                    {/* SELECTOR / CLASIFICADOR DE CATEGORÍA DE ENFERMEDAD */}
                    <div className="flex items-center gap-1 bg-[#FAF6EF] px-2 py-1 rounded-xl border border-[#E3DAC9]">
                      <Tag className="w-3 h-3 text-[#1E6B65]" />
                      <select
                        value={categoriaSugerida}
                        onChange={(e) => onActualizarCategoriaFicha(e.target.value as CategoriaEnfermedad)}
                        className="text-xs font-bold bg-transparent text-[#2B2625] focus:outline-hidden"
                      >
                        <option value="digestiva">Digestiva</option>
                        <option value="respiratoria">Respiratoria</option>
                        <option value="cardiovascular">Cardiovascular</option>
                        <option value="infecciosa">Infecciosa</option>
                        <option value="dolor/trauma">Dolor / Trauma</option>
                        <option value="materno-infantil">Materno-Infantil</option>
                        <option value="cronica">Crónica</option>
                        <option value="neurologica">Neurológica</option>
                        <option value="otra">Otra</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowJsonRaw(!showJsonRaw)}
                    className="text-xs font-bold text-[#1E6B65] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>{showJsonRaw ? 'Ocultar JSON' : 'Ver JSON'}</span>
                    {showJsonRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {showJsonRaw && (
                  <div className="bg-[#2B2625] text-emerald-400 p-3.5 rounded-xl font-mono text-xs overflow-x-auto shadow-inner border border-gray-700">
                    <pre>{JSON.stringify(ficha, null, 2)}</pre>
                  </div>
                )}

                {/* Quechua Original & Spanish Translation */}
                <div className="space-y-3">
                  <div className="bg-[#FAF6EF] p-3.5 rounded-xl border border-[#E3DAC9]">
                    <span className="text-[10px] font-bold text-[#B84A28] uppercase tracking-wider block">
                      Transcripción en Quechua (Original):
                    </span>
                    <p className="text-base font-bold text-[#2B2625] mt-0.5">
                      "{ficha.transcripcion_quechua}"
                    </p>
                  </div>

                  <div className="bg-[#E2EFEF] p-3.5 rounded-xl border border-[#1E6B65]/30">
                    <span className="text-[10px] font-bold text-[#1E6B65] uppercase tracking-wider block">
                      Traducción Clínica al Español:
                    </span>
                    <p className="text-base font-bold text-[#134844] mt-0.5">
                      {ficha.traduccion_espanol}
                    </p>
                  </div>
                </div>

                {/* Clinical Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="bg-[#FAF6EF] p-3 rounded-xl border border-[#E3DAC9]">
                    <span className="text-[10px] text-[#5C5450] uppercase font-bold block">Síntomas</span>
                    <span className="font-extrabold text-[#2B2625] mt-1 block">
                      {ficha.sintomas.join(', ') || 'No especificado'}
                    </span>
                  </div>

                  <div className="bg-[#FAF6EF] p-3 rounded-xl border border-[#E3DAC9]">
                    <span className="text-[10px] text-[#5C5450] uppercase font-bold block">Zona Anatómica</span>
                    <span className="font-extrabold text-[#2B2625] mt-1 block capitalize">
                      {ficha.zona_cuerpo || 'General'}
                    </span>
                  </div>

                  <div className="bg-[#FAF6EF] p-3 rounded-xl border border-[#E3DAC9]">
                    <span className="text-[10px] text-[#5C5450] uppercase font-bold block">Duración</span>
                    <span className="font-extrabold text-[#2B2625] mt-1 block">
                      {ficha.duracion || 'Sin dato'}
                    </span>
                  </div>

                  <div className="bg-[#FAF6EF] p-3 rounded-xl border border-[#E3DAC9]">
                    <span className="text-[10px] text-[#5C5450] uppercase font-bold block">Intensidad</span>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-3 h-3 rounded-full ${
                            lvl <= ficha.intensidad ? 'bg-[#B84A28]' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                      <span className="font-extrabold text-[#2B2625] ml-1">({ficha.intensidad}/5)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PREGUNTAS GUIADAS SÍ / NO */}
              <PreguntasRapidas
                respuestas={ficha.respuestas_preguntas || {}}
                onGuardarRespuesta={onActualizarRespuestasPreguntas}
              />

              {/* Doctor Response Section */}
              <div className="bg-white rounded-2xl border-2 border-[#1E6B65] p-5 shadow-md space-y-4">
                <div>
                  <h3 className="font-extrabold text-base text-[#2B2625] flex items-center gap-2">
                    <Send className="w-5 h-5 text-[#1E6B65]" />
                    <span>Responder al Paciente (Español → Quechua)</span>
                  </h3>
                  <p className="text-xs text-[#5C5450] mt-0.5">
                    Traducción directa con Gemini Flash mostrada en texto gigante en pantalla.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#5C5450] uppercase tracking-wider block">
                    Frases rápidas comunes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPhrases.map((phrase) => (
                      <button
                        key={phrase}
                        type="button"
                        onClick={() => setRespuestaEspanol(phrase)}
                        className="text-xs bg-[#FAF6EF] hover:bg-[#E2EFEF] text-[#2B2625] px-2.5 py-1.5 rounded-lg border border-[#E3DAC9] transition-colors cursor-pointer text-left"
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    value={respuestaEspanol}
                    onChange={(e) => setRespuestaEspanol(e.target.value)}
                    placeholder="Ej: Tome esta pastilla después del almuerzo con agua tibia..."
                    rows={3}
                    className="w-full p-3 rounded-xl border-2 border-[#E3DAC9] focus:border-[#1E6B65] focus:outline-hidden text-sm text-[#2B2625]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isTranslating || !respuestaEspanol.trim()}
                  className="w-full py-4 px-6 rounded-2xl bg-[#1E6B65] hover:bg-[#134844] text-white font-extrabold text-base shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isTranslating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Traduciendo al Quechua...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Traducir y Mostrar al Paciente</span>
                    </>
                  )}
                </button>
              </div>

              {/* LARGE QUECHUA TEXT DISPLAY FOR PATIENT */}
              {doctorRespuesta && (
                <div className="bg-[#FAF6EF] border-4 border-[#B84A28] rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-[#E3DAC9] pb-3">
                    <span className="bg-[#B84A28] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      Pantalla para el Paciente
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSpeak(doctorRespuesta.traduccion_quechua)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#B84A28] bg-white px-3 py-1.5 rounded-xl border border-[#B84A28] shadow-xs hover:bg-[#F6E9E4] transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{isPlayingAudio ? 'Reproduciendo...' : 'Escuchar Audio'}</span>
                    </button>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border-2 border-[#E3DAC9] shadow-inner">
                    <span className="text-xs text-[#5C5450] block font-bold uppercase mb-2">
                      Quechua (Texto en tamaño grande para el paciente):
                    </span>
                    <p className="text-2xl sm:text-3xl font-black text-[#B84A28] leading-snug tracking-tight">
                      "{doctorRespuesta.traduccion_quechua}"
                    </p>
                  </div>

                  <div className="text-xs text-[#5C5450] bg-white/70 p-3 rounded-xl border border-[#E3DAC9]">
                    <strong>Original en Español (Médico):</strong> {doctorRespuesta.texto_original}
                    {doctorRespuesta.guia_pronunciacion && (
                      <div className="mt-1 text-[11px] text-[#1E6B65]">
                        <strong>Guía fonética:</strong> {doctorRespuesta.guia_pronunciacion}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
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
