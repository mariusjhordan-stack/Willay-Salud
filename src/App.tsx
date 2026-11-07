import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { PatientView } from './components/PatientView';
import { DoctorView } from './components/DoctorView';
import { DoctorLogin } from './components/DoctorLogin';
import { NuevoPacienteModal } from './components/NuevoPacienteModal';
import {
  FichaClinica,
  DoctorRespuesta,
  Role,
  ConsultaHistorial,
  DoctorUser,
  Paciente,
  CategoriaEnfermedad,
  EstadoPaciente,
} from './types';
import glosarioData from './data/glosario.json';
import { MOCK_PACIENTES } from './data/mockPacientes';
import { authService } from './services/authService';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

const HISTORIAL_STORAGE_KEY = 'willay_salud_historial_consultas';
const PACIENTES_STORAGE_KEY = 'willay_salud_pacientes_local';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<Role>('paciente');
  const [doctorUser, setDoctorUser] = useState<DoctorUser | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [activeFicha, setActiveFicha] = useState<FichaClinica | null>(null);
  const [consultasHistorial, setConsultasHistorial] = useState<ConsultaHistorial[]>([]);
  const [showNuevoPacienteModal, setShowNuevoPacienteModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Load initial session, patients and history
  useEffect(() => {
    // Check doctor auth session
    const current = authService.getCurrentUser();
    if (current) {
      setDoctorUser(current);
    }

    // Load patients from localStorage or default to MOCK_PACIENTES
    try {
      const storedPacientes = localStorage.getItem(PACIENTES_STORAGE_KEY);
      if (storedPacientes) {
        setPacientes(JSON.parse(storedPacientes));
      } else {
        setPacientes(MOCK_PACIENTES);
        localStorage.setItem(PACIENTES_STORAGE_KEY, JSON.stringify(MOCK_PACIENTES));
      }
    } catch {
      setPacientes(MOCK_PACIENTES);
    }

    // Load clinical history
    try {
      const storedHistorial = localStorage.getItem(HISTORIAL_STORAGE_KEY);
      if (storedHistorial) {
        setConsultasHistorial(JSON.parse(storedHistorial));
      }
    } catch (e) {
      console.warn('Error cargando historial:', e);
    }

    checkBackendStatus();
  }, []);

  // Inactivity Auto-Logout listener (10 minutes)
  useEffect(() => {
    const handleUserActivity = () => {
      authService.updateLastActivity();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    const checkInterval = setInterval(() => {
      if (doctorUser && authService.isSessionExpired()) {
        authService.logout();
        setDoctorUser(null);
        showToast('Sesión cerrada automáticamente por inactividad (10 minutos).');
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      clearInterval(checkInterval);
    };
  }, [doctorUser]);

  const checkBackendStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setHasApiKey(Boolean(data.hasApiKey));
        setIsBackendConnected(true);
      } else {
        setIsBackendConnected(false);
      }
    } catch {
      setIsBackendConnected(false);
      setHasApiKey(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const savePacientes = (nuevos: Paciente[]) => {
    setPacientes(nuevos);
    try {
      localStorage.setItem(PACIENTES_STORAGE_KEY, JSON.stringify(nuevos));
    } catch (e) {
      console.warn('Error guardando pacientes:', e);
    }
  };

  const saveHistorial = (items: ConsultaHistorial[]) => {
    setConsultasHistorial(items);
    try {
      localStorage.setItem(HISTORIAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Error guardando historial:', e);
    }
  };

  const handleLoginSuccess = (user: DoctorUser) => {
    setDoctorUser(user);
    showToast(`Bienvenido/a, ${user.nombre} (${user.rol.toUpperCase()})`);
  };

  const handleLogout = () => {
    authService.logout();
    setDoctorUser(null);
    showToast('Sesión médica finalizada correctamente.');
  };

  // Seed 8 realistic mock patients
  const handleCargarRegistroEjemplo = async () => {
    savePacientes(MOCK_PACIENTES);
    showToast('8 pacientes de demostración cargados en el registro.');

    // Attempt backend sync
    try {
      await fetch('/api/pacientes/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacientes: MOCK_PACIENTES }),
      });
    } catch {
      // Offline fallback ok
    }
  };

  // Create new patient with strict consent check
  const handleGuardarNuevoPaciente = async (nuevo: Paciente) => {
    const actualizados = [nuevo, ...pacientes];
    savePacientes(actualizados);
    setShowNuevoPacienteModal(false);
    showToast(`Paciente ${nuevo.nombres} ${nuevo.apellidos} registrado con éxito.`);

    // Attempt backend sync if authenticated
    const token = authService.getToken();
    if (token) {
      try {
        await fetch('/api/pacientes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(nuevo),
        });
      } catch (e) {
        console.warn('Error sincronizando con backend:', e);
      }
    }
  };

  // Update patient status
  const handleActualizarEstadoPaciente = (pacienteId: string, nuevoEstado: EstadoPaciente) => {
    const actualizados = pacientes.map((p) =>
      p.id === pacienteId ? { ...p, estado: nuevoEstado } : p
    );
    savePacientes(actualizados);
    showToast(`Estado actualizado a: ${nuevoEstado.toUpperCase()}`);
  };

  // Add doctor note
  const handleAgregarNotaPaciente = (pacienteId: string, nota: string) => {
    const nuevaNota = {
      id: `nota-${Date.now()}`,
      fecha: new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      autor: doctorUser?.nombre || 'Médico de turno',
      nota,
    };

    const actualizados = pacientes.map((p) =>
      p.id === pacienteId ? { ...p, notas_medicas: [nuevaNota, ...p.notas_medicas] } : p
    );
    savePacientes(actualizados);
    showToast('Nota clínica agregada al expediente.');
  };

  // Schedule follow-up
  const handleProgramarSeguimientoPaciente = (
    pacienteId: string,
    fecha: string,
    motivo: string
  ) => {
    const actualizados = pacientes.map((p) =>
      p.id === pacienteId
        ? {
            ...p,
            seguimiento: { programado: true, fecha, motivo },
          }
        : p
    );
    savePacientes(actualizados);
    showToast(`Seguimiento médico programado para el ${fecha}`);
  };

  // Start new consult for patient
  const handleIniciarNuevaConsulta = (paciente: Paciente) => {
    const fichaNueva: FichaClinica = {
      id: `c-${paciente.id}-${Date.now()}`,
      paciente_id: paciente.id,
      fecha: new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      transcripcion_quechua: 'Nueva consulta en curso...',
      traduccion_espanol: `Consulta de atención intercultural para ${paciente.nombres} ${paciente.apellidos}.`,
      sintomas: [paciente.categoria_enfermedad],
      zona_cuerpo: 'General',
      duracion: 'Hoy',
      intensidad: 3,
      urgencia: paciente.urgencia_actual || 'media',
      categoria_enfermedad: paciente.categoria_enfermedad,
      confianza: 0.95,
      respuestas_preguntas: {},
    };

    setActiveFicha(fichaNueva);
    showToast(`Iniciando consulta para ${paciente.nombres} ${paciente.apellidos}`);
  };

  // Update disease category of active triage sheet
  const handleActualizarCategoriaFicha = (categoria: CategoriaEnfermedad) => {
    if (!activeFicha) return;
    setActiveFicha({ ...activeFicha, categoria_enfermedad: categoria });
    showToast(`Categoría clínica actualizada a: ${categoria.toUpperCase()}`);
  };

  // Fallback demo cases for emergency demo button
  const FALLBACK_DEMO_CASES: FichaClinica[] = [
    {
      id: 'demo-1',
      fecha: new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      transcripcion_quechua: 'Kimsantin punchawñam wiksay nanawan, anchatam nanawan mikusqay qepata.',
      traduccion_espanol: 'Hace 3 días que me duele la barriga (estómago), me duele mucho después de comer.',
      sintomas: ['wiksa nanay (dolor de barriga)'],
      zona_cuerpo: 'barriga',
      duracion: '3 días',
      intensidad: 4,
      urgencia: 'alta',
      categoria_enfermedad: 'materno-infantil',
      confianza: 0.88,
      es_demo: true,
      respuestas_preguntas: {
        fiebre: 'si',
        embarazo: 'si', // Triggers red flag rule!
        duracion_3dias: 'si',
      },
    },
    {
      id: 'demo-2',
      fecha: new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      transcripcion_quechua: 'Kunka nanaymi hap’iwan, chiri wayrawan manam allintachu samani.',
      traduccion_espanol: 'Me agarró dolor de garganta con el viento frío, no puedo pasar saliva ni respirar bien.',
      sintomas: ['kunka nanay (dolor de garganta)'],
      zona_cuerpo: 'garganta',
      duracion: '1 día',
      intensidad: 3,
      urgencia: 'baja',
      categoria_enfermedad: 'respiratoria',
      confianza: 0.79,
      es_demo: true,
      respuestas_preguntas: { fiebre: 'no', alergias: 'no' },
    },
    {
      id: 'demo-3',
      fecha: new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      transcripcion_quechua: 'Uma nanay sinchi... tutamantapacha mana allinchu kani...',
      traduccion_espanol: 'Dolor de cabeza muy fuerte... desde la madrugada no me siento bien...',
      sintomas: ['uma nanay (dolor de cabeza)'],
      zona_cuerpo: 'cabeza',
      duracion: 'Hoy',
      intensidad: 5,
      urgencia: 'alta',
      categoria_enfermedad: 'neurologica',
      confianza: 0.52, // < 0.60
      advertencia_confianza: 'Traducción poco segura, confirmar con el paciente',
      es_demo: true,
      respuestas_preguntas: { golpes_caidas: 'si' },
    },
  ];

  // Analyze audio through backend or fallback demo
  const handleAnalyzeAudio = async (
    audioBase64: string,
    mimeType: string
  ): Promise<FichaClinica> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType }),
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor.');
      }

      const data = await response.json();
      showToast(
        data.es_demo
          ? 'Modo Demo: Ficha generada con plantilla demostrativa.'
          : 'Audio analizado con Gemini 2.5 Flash'
      );
      return data;
    } catch {
      showToast('Sin conexión al servidor: Usando caso de demostración local.');
      return FALLBACK_DEMO_CASES[0];
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze manual card selections (Works locally WITHOUT AI as required!)
  const handleAnalyzeManual = async (data: {
    sintomas: string[];
    zona_cuerpo: string;
    intensidad: number;
    duracion: string;
  }): Promise<FichaClinica> => {
    const quechuaSymptoms = data.sintomas
      .map((s) => {
        const found = glosarioData.terminos.find((t) => t.espanol === s || t.quechua === s);
        return found ? `${found.quechua} (${found.espanol})` : s;
      })
      .join(', ');

    const fichaLocal: FichaClinica = {
      id: `ficha-${Date.now()}`,
      fecha: new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      transcripcion_quechua: `${quechuaSymptoms} nanawanmi.`,
      traduccion_espanol: `Paciente refiere ${data.sintomas.join(', ')} en zona ${data.zona_cuerpo}.`,
      sintomas: data.sintomas,
      zona_cuerpo: data.zona_cuerpo,
      duracion: data.duracion,
      intensidad: data.intensidad,
      urgencia: data.intensidad >= 4 ? 'alta' : data.intensidad === 3 ? 'media' : 'baja',
      confianza: 0.95,
      es_demo: !hasApiKey,
      nota_sistema: 'Generado directamente desde el glosario oficial (sin llamada a IA).',
      respuestas_preguntas: {},
    };

    return fichaLocal;
  };

  // Patient confirms their file -> Save to history & switch to Doctor
  const handleFichaReadyForDoctor = (ficha: FichaClinica) => {
    const id = ficha.id || `consulta-${Date.now()}`;
    const fecha =
      ficha.fecha ||
      new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });

    const fullFicha: FichaClinica = {
      ...ficha,
      id,
      fecha,
      respuestas_preguntas: ficha.respuestas_preguntas || {},
    };

    setActiveFicha(fullFicha);

    const nuevaConsulta: ConsultaHistorial = {
      id,
      fecha,
      zona_cuerpo: fullFicha.zona_cuerpo,
      sintomas: fullFicha.sintomas,
      intensidad: fullFicha.intensidad,
      urgencia: fullFicha.urgencia,
      categoria_enfermedad: fullFicha.categoria_enfermedad,
      confianza: fullFicha.confianza,
      respuestas_preguntas: fullFicha.respuestas_preguntas,
      transcripcion_quechua: fullFicha.transcripcion_quechua,
      traduccion_espanol: fullFicha.traduccion_espanol,
    };

    const nuevoHistorial = [nuevaConsulta, ...consultasHistorial.filter((c) => c.id !== id)];
    saveHistorial(nuevoHistorial);

    setCurrentRole('medico');
    showToast('¡Ficha médica enviada a la bandeja médica!');
  };

  // Guided questions update
  const handleActualizarRespuestasPreguntas = (preguntaId: string, respuesta: 'si' | 'no') => {
    if (!activeFicha) return;

    const nuevasRespuestas = {
      ...(activeFicha.respuestas_preguntas || {}),
      [preguntaId]: respuesta,
    };

    const fichaActualizada: FichaClinica = {
      ...activeFicha,
      respuestas_preguntas: nuevasRespuestas,
    };

    setActiveFicha(fichaActualizada);

    if (activeFicha.id) {
      const historialActualizado = consultasHistorial.map((c) =>
        c.id === activeFicha.id ? { ...c, respuestas_preguntas: nuevasRespuestas } : c
      );
      saveHistorial(historialActualizado);
    }

    showToast(`Respuesta registrada: ${respuesta === 'si' ? 'SÍ (Ari)' : 'NO (Manam)'}`);
  };

  // Doctor response translated to Quechua
  const handleDoctorResponse = async (textoEspanol: string): Promise<DoctorRespuesta> => {
    try {
      const response = await fetch('/api/traducir-respuesta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textoEspanol }),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Error en traducción');
    } catch {
      return {
        texto_original: textoEspanol,
        traduccion_quechua: `Allillam kanki. Hampiqmi nin: "${textoEspanol}". Q'oñi yakuwan hampikuy.`,
        guia_pronunciacion: 'Pronunciación estándar (hablante nativo por validar)',
        es_demo: true,
      };
    }
  };

  const handleCargarDatosEjemploHistorial = () => {
    const sampleHistory: ConsultaHistorial[] = [
      {
        id: 'hist-1',
        fecha: '03 Nov, 08:30',
        zona_cuerpo: 'barriga',
        sintomas: ['wiksa nanay (dolor de barriga)'],
        intensidad: 2,
        urgencia: 'baja',
        confianza: 0.92,
        respuestas_preguntas: { fiebre: 'no' },
        transcripcion_quechua: 'Pisillata wiksay nanan',
        traduccion_espanol: 'Dolor leve de estómago después de desayunar.',
      },
      {
        id: 'hist-2',
        fecha: '04 Nov, 14:15',
        zona_cuerpo: 'cabeza',
        sintomas: ['uma nanay (dolor de cabeza)'],
        intensidad: 3,
        urgencia: 'media',
        confianza: 0.85,
        respuestas_preguntas: { golpes_caidas: 'no' },
        transcripcion_quechua: 'Uma nanay chawpilla',
        traduccion_espanol: 'Dolor de cabeza moderado tras jornada en el campo.',
      },
      {
        id: 'hist-3',
        fecha: '05 Nov, 11:00',
        zona_cuerpo: 'garganta',
        sintomas: ['kunka nanay (dolor de garganta)'],
        intensidad: 4,
        urgencia: 'media',
        confianza: 0.89,
        respuestas_preguntas: { fiebre: 'si' },
        transcripcion_quechua: 'Kunkay nanawan chiri wayrawan',
        traduccion_espanol: 'Dolor de garganta con dificultad para tragar y calor.',
      },
      {
        id: 'hist-4',
        fecha: '06 Nov, 16:40',
        zona_cuerpo: 'pecho',
        sintomas: ['sonqo nanay (dolor de pecho)'],
        intensidad: 5,
        urgencia: 'alta',
        confianza: 0.95,
        respuestas_preguntas: { fiebre: 'no' },
        transcripcion_quechua: 'Sonqo nanay sinchita hap’iwan',
        traduccion_espanol: 'Dolor de pecho de intensidad máxima con opresión.',
      },
      {
        id: 'hist-5',
        fecha: '07 Nov, 09:20',
        zona_cuerpo: 'barriga',
        sintomas: ['wiksa nanay (dolor de barriga)'],
        intensidad: 4,
        urgencia: 'alta',
        confianza: 0.88,
        respuestas_preguntas: { fiebre: 'si', embarazo: 'si' },
        transcripcion_quechua: 'Wiksa nanay rupariywan',
        traduccion_espanol: 'Dolor abdominal agudo con fiebre en paciente gestante.',
      },
    ];

    saveHistorial(sampleHistory);
    showToast('5 consultas ficticias cargadas en el historial con gráfico.');
  };

  const handleLimpiarHistorial = () => {
    if (window.confirm('¿Seguro que deseas borrar el historial local?')) {
      saveHistorial([]);
      showToast('Historial local reiniciado.');
    }
  };

  const handleLoadDemoCase = (index: number) => {
    const chosen = FALLBACK_DEMO_CASES[index] || FALLBACK_DEMO_CASES[0];
    setActiveFicha(chosen);

    const nuevaConsulta: ConsultaHistorial = {
      id: chosen.id || `demo-${Date.now()}`,
      fecha:
        chosen.fecha ||
        new Date().toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      zona_cuerpo: chosen.zona_cuerpo,
      sintomas: chosen.sintomas,
      intensidad: chosen.intensidad,
      urgencia: chosen.urgencia,
      categoria_enfermedad: chosen.categoria_enfermedad,
      confianza: chosen.confianza,
      respuestas_preguntas: chosen.respuestas_preguntas,
      transcripcion_quechua: chosen.transcripcion_quechua,
      traduccion_espanol: chosen.traduccion_espanol,
    };
    saveHistorial([nuevaConsulta, ...consultasHistorial.filter((c) => c.id !== nuevaConsulta.id)]);

    setShowDemoModal(false);
    showToast(`Caso demo "${chosen.sintomas[0]}" cargado.`);
  };

  const handleSeleccionarConsultaHistorial = (consulta: ConsultaHistorial) => {
    const fichaRestaurada: FichaClinica = {
      id: consulta.id,
      fecha: consulta.fecha,
      transcripcion_quechua: consulta.transcripcion_quechua || 'Registro histórico',
      traduccion_espanol: consulta.traduccion_espanol || 'Registro previo del paciente',
      sintomas: consulta.sintomas,
      zona_cuerpo: consulta.zona_cuerpo,
      duracion: 'Histórico',
      intensidad: consulta.intensidad,
      urgencia: consulta.urgencia,
      categoria_enfermedad: consulta.categoria_enfermedad,
      confianza: consulta.confianza,
      respuestas_preguntas: consulta.respuestas_preguntas,
    };
    setActiveFicha(fichaRestaurada);
    showToast(`Ficha del ${consulta.fecha} seleccionada en panel médico.`);
  };

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex flex-col items-center justify-start">
      <div className="w-full max-w-md min-h-screen bg-[#FAF6EF] flex flex-col shadow-2xl border-x border-[#E3DAC9] relative">
        {/* Header */}
        <Header
          currentRole={currentRole}
          onSelectRole={(role) => setCurrentRole(role)}
          onTriggerDemo={() => setShowDemoModal(true)}
          hasApiKey={hasApiKey}
          isBackendConnected={isBackendConnected}
          doctorUser={doctorUser}
          onLogout={handleLogout}
        />

        {/* Disclaimer Banner with Demostration Fictitious Data notice */}
        <DisclaimerBanner />

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#2B2625] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border border-white/20 animate-in fade-in duration-200 max-w-xs text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="p-4 flex-1">
          {currentRole === 'paciente' ? (
            <PatientView
              onFichaReadyForDoctor={handleFichaReadyForDoctor}
              onAnalyzeAudio={handleAnalyzeAudio}
              onAnalyzeManual={handleAnalyzeManual}
              isLoading={isLoading}
            />
          ) : !doctorUser ? (
            /* DOCTOR LOGIN SCREEN */
            <DoctorLogin
              onLoginSuccess={handleLoginSuccess}
              onCancel={() => setCurrentRole('paciente')}
            />
          ) : (
            /* AUTHENTICATED DOCTOR PANEL */
            <DoctorView
              ficha={activeFicha}
              pacientes={pacientes}
              doctorUser={doctorUser}
              onSendResponse={handleDoctorResponse}
              onLoadDemoCase={handleLoadDemoCase}
              onActualizarRespuestasPreguntas={handleActualizarRespuestasPreguntas}
              onActualizarCategoriaFicha={handleActualizarCategoriaFicha}
              consultasHistorial={consultasHistorial}
              onCargarDatosEjemplo={handleCargarDatosEjemploHistorial}
              onLimpiarHistorial={handleLimpiarHistorial}
              onSeleccionarConsulta={handleSeleccionarConsultaHistorial}
              onActualizarEstadoPaciente={handleActualizarEstadoPaciente}
              onAgregarNotaPaciente={handleAgregarNotaPaciente}
              onProgramarSeguimientoPaciente={handleProgramarSeguimientoPaciente}
              onAbrirNuevoPacienteModal={() => setShowNuevoPacienteModal(true)}
              onCargarRegistroEjemplo={handleCargarRegistroEjemplo}
              onIniciarNuevaConsulta={handleIniciarNuevaConsulta}
              onToast={showToast}
              isLoading={isLoading}
            />
          )}
        </main>

        {/* Footer info & Glossary validation note */}
        <footer className="p-3 bg-white border-t border-[#E3DAC9] text-center text-[10px] text-[#5C5450] space-y-1">
          <p>
            <strong>Willay Salud:</strong> Prototipo funcional de salud intercultural Quechua-Español.
          </p>
          <p className="text-[9px] text-[#B84A28]">
            Términos en quechua marcados como "por validar con hablante nativo".
          </p>
        </footer>
      </div>

      {/* NUEVO PACIENTE MODAL */}
      {showNuevoPacienteModal && (
        <NuevoPacienteModal
          onClose={() => setShowNuevoPacienteModal(false)}
          onSave={handleGuardarNuevoPaciente}
          medicoEmailActual={doctorUser?.email}
        />
      )}

      {/* MODO DEMO QUICK MODAL */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full border-2 border-[#E3DAC9] shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E3DAC9] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#1E6B65]" />
                <h3 className="font-extrabold text-base text-[#2B2625]">
                  Menú de Modo Demostración
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="text-[#5C5450] hover:text-black font-bold text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5C5450]">
              Selecciona una ficha médica de prueba ya lista para realizar la demostración sin depender de internet o de la API de Gemini:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleLoadDemoCase(0)}
                className="w-full text-left p-3 rounded-xl border-2 border-[#E3DAC9] hover:border-[#1E6B65] bg-[#FAF6EF] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1E6B65]">1. Fiebre + Embarazo (Alerta Roja)</span>
                  <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                    Bandera Roja
                  </span>
                </div>
                <p className="text-xs text-[#5C5450] mt-1">
                  "Kimsantin punchawñam wiksay nanawan..." (Intensidad 4/5)
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleLoadDemoCase(1)}
                className="w-full text-left p-3 rounded-xl border-2 border-[#E3DAC9] hover:border-[#1E6B65] bg-[#FAF6EF] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1E6B65]">2. Dolor de Garganta (Kunka nanay)</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    79% Confianza
                  </span>
                </div>
                <p className="text-xs text-[#5C5450] mt-1">
                  "Kunka nanaymi hap’iwan, chiri wayrawan..." (Intensidad 3/5)
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleLoadDemoCase(2)}
                className="w-full text-left p-3 rounded-xl border-2 border-red-300 hover:border-red-500 bg-red-50/60 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-red-900 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>3. Baja Confianza (&lt; 0.60)</span>
                  </span>
                  <span className="text-[10px] font-bold bg-red-200 text-red-900 px-2 py-0.5 rounded-full">
                    52% Confianza
                  </span>
                </div>
                <p className="text-xs text-red-800 mt-1">
                  Trauma + cefalea (5/5). Dispara alertas visibles de apoyo inmediato.
                </p>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#2B2625] text-white font-bold text-xs cursor-pointer"
              >
                Cerrar Menú Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
