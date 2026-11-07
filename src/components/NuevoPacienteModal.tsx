import React, { useState } from 'react';
import { UserPlus, ShieldAlert, Check, X, AlertCircle } from 'lucide-react';
import { Paciente, CategoriaEnfermedad, EstadoPaciente } from '../types';

interface NuevoPacienteModalProps {
  onClose: () => void;
  onSave: (paciente: Paciente) => void;
  medicoEmailActual?: string;
}

export const NuevoPacienteModal: React.FC<NuevoPacienteModalProps> = ({
  onClose,
  onSave,
  medicoEmailActual,
}) => {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [edad, setEdad] = useState<number | ''>('');
  const [sexo, setSexo] = useState<'F' | 'M' | 'otro'>('F');
  const [comunidadDistrito, setComunidadDistrito] = useState('Chinchero, Urubamba');
  const [varianteQuechua, setVarianteQuechua] = useState('Cusco-Collao');
  const [idiomaPreferido, setIdiomaPreferido] = useState('Quechua');
  const [nivelLectura, setNivelLectura] = useState<'lee' | 'lee poco' | 'no lee'>('no lee');
  const [discapacidad, setDiscapacidad] = useState<
    'ninguna' | 'visual' | 'auditiva' | 'motora' | 'intelectual' | 'otra'
  >('ninguna');
  const [discapacidadDetalle, setDiscapacidadDetalle] = useState('');
  const [necesidadAudio, setNecesidadAudio] = useState(true);
  const [necesidadAcompanante, setNecesidadAcompanante] = useState(false);
  const [alergiasInput, setAlergiasInput] = useState('');
  const [condicionesInput, setCondicionesInput] = useState('');
  const [categoria, setCategoria] = useState<CategoriaEnfermedad>('digestiva');
  const [estado, setEstado] = useState<EstadoPaciente>('en espera');
  const [consentimiento, setConsentimiento] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // OBLIGATORIO: Consentimiento informado
    if (!consentimiento) {
      setErrorMsg('No se puede guardar al paciente sin el consentimiento informado aceptado.');
      return;
    }

    if (!nombres.trim() || !apellidos.trim() || !dni.trim()) {
      setErrorMsg('Nombres, apellidos y DNI ficticio son obligatorios.');
      return;
    }

    const necesidades: string[] = [];
    if (necesidadAudio) necesidades.push('Usa audio preferente');
    if (necesidadAcompanante) necesidades.push('Requiere acompañante');

    const alergias = alergiasInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const condiciones = condicionesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const nuevoPaciente: Paciente = {
      id: `pac-${Date.now()}`,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      dni: dni.trim(),
      edad: Number(edad) || 30,
      sexo,
      comunidad_distrito: comunidadDistrito,
      variante_quechua: varianteQuechua,
      idioma_preferido: idiomaPreferido,
      nivel_lectura: nivelLectura,
      discapacidad,
      discapacidad_detalle: discapacidadDetalle.trim() || undefined,
      necesidades_comunicacion: necesidades,
      alergias,
      condiciones_cronicas: condiciones,
      medico_asignado: medicoEmailActual || 'dr.mamani@willaysalud.pe',
      estado,
      categoria_enfermedad: categoria,
      consentimiento_informado: {
        aceptado: true,
        fecha: new Date().toISOString(),
      },
      fecha_registro: new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      consultas: [],
      notas_medicas: [],
      urgencia_actual: 'media',
    };

    onSave(nuevoPaciente);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-3xl p-5 max-w-lg w-full border-2 border-[#E3DAC9] shadow-2xl space-y-4 my-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E3DAC9] pb-3 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-[#1E6B65]" />
            <h3 className="font-extrabold text-base text-[#2B2625]">
              Registrar Nuevo Paciente
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#5C5450] hover:text-black font-bold text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border-2 border-red-300 text-red-900 rounded-xl text-xs font-bold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Identidad */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-[#2B2625] block mb-1">Nombres *</label>
              <input
                type="text"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="Ej. Santusa"
                required
                className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs focus:border-[#1E6B65]"
              />
            </div>
            <div>
              <label className="font-bold text-[#2B2625] block mb-1">Apellidos *</label>
              <input
                type="text"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej. Huillca Mamani"
                required
                className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs focus:border-[#1E6B65]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-[#2B2625] block mb-1">DNI Ficticio *</label>
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="00000009"
                required
                className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-[#2B2625] block mb-1">Edad</label>
              <input
                type="number"
                value={edad}
                onChange={(e) => setEdad(e.target.value ? Number(e.target.value) : '')}
                placeholder="Años"
                min={0}
                max={120}
                className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-[#2B2625] block mb-1">Sexo</label>
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs"
              >
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Comunidad e Idioma */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-[#2B2625] block mb-1">Comunidad / Distrito</label>
              <input
                type="text"
                value={comunidadDistrito}
                onChange={(e) => setComunidadDistrito(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-[#2B2625] block mb-1">Variante Quechua</label>
              <select
                value={varianteQuechua}
                onChange={(e) => setVarianteQuechua(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs"
              >
                <option value="Cusco-Collao">Cusco-Collao</option>
                <option value="Chanka">Chanka (Ayacucho-Apurímac)</option>
                <option value="Wanka">Wanka</option>
                <option value="Ancashino">Ancashino</option>
                <option value="Otra">Otra</option>
              </select>
            </div>
          </div>

          {/* Alfabetización y Discapacidad */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-[#2B2625] block mb-1">Nivel de Lectura</label>
              <select
                value={nivelLectura}
                onChange={(e) => setNivelLectura(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs"
              >
                <option value="no lee">No lee (Analfabeto/a)</option>
                <option value="lee poco">Lee poco</option>
                <option value="lee">Lee fluidamente</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#2B2625] block mb-1">Discapacidad</label>
              <select
                value={discapacidad}
                onChange={(e) => setDiscapacidad(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs"
              >
                <option value="ninguna">Ninguna</option>
                <option value="visual">Visual</option>
                <option value="auditiva">Auditiva</option>
                <option value="motora">Motora</option>
                <option value="intelectual">Intelectual</option>
                <option value="otra">Otra</option>
              </select>
            </div>
          </div>

          {discapacidad !== 'ninguna' && (
            <div>
              <label className="font-bold text-[#2B2625] block mb-1">
                Detalle de Discapacidad
              </label>
              <input
                type="text"
                value={discapacidadDetalle}
                onChange={(e) => setDiscapacidadDetalle(e.target.value)}
                placeholder="Ej. Hipoacusia bilateral severa"
                className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs"
              />
            </div>
          )}

          {/* Necesidades de Comunicación */}
          <div className="p-3 bg-[#FAF6EF] rounded-xl border border-[#E3DAC9] space-y-1.5">
            <span className="font-bold text-[#2B2625] block">Necesidades de Comunicación:</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={necesidadAudio}
                  onChange={(e) => setNecesidadAudio(e.target.checked)}
                />
                <span>Usa audio preferente</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={necesidadAcompanante}
                  onChange={(e) => setNecesidadAcompanante(e.target.checked)}
                />
                <span>Requiere acompañante</span>
              </label>
            </div>
          </div>

          {/* Categoría y Estado */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-[#2B2625] block mb-1">Categoría Clínica</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs"
              >
                <option value="digestiva">Digestiva</option>
                <option value="respiratoria">Respiratoria</option>
                <option value="cardiovascular">Cardiovascular</option>
                <option value="infecciosa">Infecciosa</option>
                <option value="dolor/trauma">Dolor / Trauma</option>
                <option value="materno-infantil">Materno-Infantil</option>
                <option value="cronica">Crónica (HTA/Diabetes)</option>
                <option value="neurologica">Neurológica</option>
                <option value="otra">Otra</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#2B2625] block mb-1">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs"
              >
                <option value="en espera">En espera</option>
                <option value="en atencion">En atención</option>
                <option value="atendido">Atendido</option>
                <option value="derivado">Derivado</option>
              </select>
            </div>
          </div>

          {/* Alergias y Crónicas */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-[#2B2625] block mb-1">Alergias (separadas por coma)</label>
              <input
                type="text"
                value={alergiasInput}
                onChange={(e) => setAlergiasInput(e.target.value)}
                placeholder="Ej. Penicilina, Sulfas"
                className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-[#2B2625] block mb-1">Condiciones Crónicas</label>
              <input
                type="text"
                value={condicionesInput}
                onChange={(e) => setCondicionesInput(e.target.value)}
                placeholder="Ej. Hipertensión"
                className="w-full p-2.5 rounded-xl border border-[#E3DAC9] text-xs"
              />
            </div>
          </div>

          {/* CONSENTIMIENTO INFORMADO OBLIGATORIO */}
          <div className="p-3 bg-amber-50 border-2 border-amber-400 rounded-xl space-y-1">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consentimiento}
                onChange={(e) => setConsentimiento(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-[#1E6B65] rounded"
              />
              <span className="font-bold text-[#2B2625]">
                Consentimiento informado aceptado (Obligatorio) *
              </span>
            </label>
            <p className="text-[10px] text-amber-900 pl-6">
              El paciente o su tutor comprende el uso de esta herramienta de apoyo y autoriza el registro de datos para atención clínica intercultural.
            </p>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#E3DAC9] font-bold text-[#5C5450] hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!consentimiento}
              className="flex-2 py-3 rounded-xl bg-[#1E6B65] hover:bg-[#134844] text-white font-extrabold shadow-md disabled:opacity-50 transition-colors"
            >
              Guardar Paciente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
