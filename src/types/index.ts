export interface GlosarioTermino {
  id: string;
  quechua: string;
  espanol: string;
  zona_cuerpo: string;
  icono: string;
  estado_validacion: 'por validar con hablante nativo';
}

export interface GlosarioPregunta {
  id: string;
  espanol: string;
  quechua: string;
  estado_validacion: 'por validar con hablante nativo';
}

export interface GlosarioData {
  estado: string;
  nota: string;
  terminos: GlosarioTermino[];
  preguntas?: GlosarioPregunta[];
}

export type CategoriaEnfermedad =
  | 'respiratoria'
  | 'digestiva'
  | 'cardiovascular'
  | 'infecciosa'
  | 'dolor/trauma'
  | 'materno-infantil'
  | 'cronica'
  | 'neurologica'
  | 'otra';

export type EstadoPaciente = 'en espera' | 'en atencion' | 'atendido' | 'derivado';

export interface NotaMedica {
  id: string;
  fecha: string;
  autor: string;
  nota: string;
}

export interface Seguimiento {
  programado: boolean;
  fecha?: string;
  motivo?: string;
}

export interface ConsentimientoInformado {
  aceptado: boolean;
  fecha: string;
}

export interface FichaClinica {
  id?: string;
  paciente_id?: string;
  fecha?: string;
  timestamp?: string;
  transcripcion_quechua: string;
  traduccion_espanol: string;
  sintomas: string[];
  zona_cuerpo: string;
  duracion: string;
  intensidad: number; // 1 - 5
  urgencia: 'baja' | 'media' | 'alta';
  categoria_enfermedad?: CategoriaEnfermedad;
  confianza: number; // 0.0 - 1.0
  advertencia_confianza?: string | null;
  es_demo?: boolean;
  nota_sistema?: string;
  respuestas_preguntas?: Record<string, 'si' | 'no' | null>;
}

export interface AlertaBanderaRoja {
  id: string;
  motivo: string;
  regla: string;
  nivel: 'critica' | 'advertencia';
  recomendacion: string;
}

export interface ConsultaHistorial {
  id: string;
  paciente_id?: string;
  fecha: string;
  zona_cuerpo: string;
  sintomas: string[];
  intensidad: number;
  urgencia: 'baja' | 'media' | 'alta';
  categoria_enfermedad?: CategoriaEnfermedad;
  confianza: number;
  respuestas_preguntas?: Record<string, 'si' | 'no' | null>;
  transcripcion_quechua?: string;
  traduccion_espanol?: string;
  doctor_nota?: string;
}

export interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string; // DNI ficticio
  edad: number;
  sexo: 'F' | 'M' | 'otro';
  comunidad_distrito: string;
  variante_quechua: string;
  idioma_preferido: string;
  nivel_lectura: 'lee' | 'lee poco' | 'no lee';
  discapacidad: 'ninguna' | 'visual' | 'auditiva' | 'motora' | 'intelectual' | 'otra';
  discapacidad_detalle?: string;
  necesidades_comunicacion: string[];
  alergias: string[];
  condiciones_cronicas: string[];
  medico_asignado: string;
  estado: EstadoPaciente;
  categoria_enfermedad: CategoriaEnfermedad;
  consentimiento_informado: ConsentimientoInformado;
  fecha_registro: string;
  consultas: ConsultaHistorial[];
  notas_medicas: NotaMedica[];
  seguimiento?: Seguimiento;
  urgencia_actual?: 'baja' | 'media' | 'alta';
}

export interface DoctorUser {
  id: string;
  email: string;
  nombre: string;
  especialidad: string;
  rol: 'medico' | 'admin';
  token?: string;
}

export interface RegistroAuditoria {
  id: string;
  timestamp: string;
  usuarioEmail: string;
  usuarioNombre: string;
  rol: 'medico' | 'admin';
  accion: string;
  pacienteId?: string;
  pacienteNombre?: string;
  detalles: string;
}

export interface DoctorRespuesta {
  texto_original: string;
  traduccion_quechua: string;
  guia_pronunciacion?: string;
  es_demo?: boolean;
}

export type Role = 'paciente' | 'medico';
