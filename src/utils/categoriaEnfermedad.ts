import { CategoriaEnfermedad } from '../types';

/**
 * Función pura que sugiere la categoría de enfermedad a partir de la zona del cuerpo,
 * síntomas reportados y respuestas del triaje.
 */
export function sugerirCategoriaEnfermedad(
  zonaCuerpo: string = '',
  sintomas: string[] = [],
  respuestas: Record<string, 'si' | 'no' | null> = {}
): CategoriaEnfermedad {
  const zona = zonaCuerpo.toLowerCase();
  const sintStr = sintomas.join(' ').toLowerCase();

  // Materno-infantil si está embarazada
  if (respuestas['embarazo'] === 'si') {
    return 'materno-infantil';
  }

  // Dolor / trauma si tuvo golpes o caídas
  if (respuestas['golpes_caidas'] === 'si') {
    return 'dolor/trauma';
  }

  // Cardiovascular: pecho, corazón, sonqo nanay
  if (zona.includes('pecho') || sintStr.includes('pecho') || sintStr.includes('sonqo')) {
    return 'cardiovascular';
  }

  // Respiratoria: garganta, kunka nanay, pulmón, tos, respirar
  if (
    zona.includes('garganta') ||
    zona.includes('cuello') ||
    sintStr.includes('garganta') ||
    sintStr.includes('kunka') ||
    sintStr.includes('respirar') ||
    sintStr.includes('tos')
  ) {
    return 'respiratoria';
  }

  // Digestiva: barriga, wiksa nanay, estómago, abdomen
  if (
    zona.includes('barriga') ||
    zona.includes('abdomen') ||
    zona.includes('estomago') ||
    sintStr.includes('barriga') ||
    sintStr.includes('wiksa') ||
    sintStr.includes('diarrea')
  ) {
    return 'digestiva';
  }

  // Neurológica: cabeza intensa, uma nanay
  if (zona.includes('cabeza') || sintStr.includes('cabeza') || sintStr.includes('uma nanay')) {
    return 'neurologica';
  }

  // Infecciosa: fiebre
  if (respuestas['fiebre'] === 'si' || sintStr.includes('fiebre')) {
    return 'infecciosa';
  }

  return 'otra';
}

export const CATEGORIAS_INFO: Record<
  CategoriaEnfermedad,
  { label: string; color: string; badge: string }
> = {
  respiratoria: {
    label: 'Respiratoria',
    color: '#0284C7',
    badge: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  digestiva: {
    label: 'Digestiva',
    color: '#D97706',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  cardiovascular: {
    label: 'Cardiovascular',
    color: '#DC2626',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  infecciosa: {
    label: 'Infecciosa',
    color: '#EA580C',
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  'dolor/trauma': {
    label: 'Dolor / Trauma',
    color: '#7C3AED',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  'materno-infantil': {
    label: 'Materno-Infantil',
    color: '#DB2777',
    badge: 'bg-pink-100 text-pink-800 border-pink-300',
  },
  cronica: {
    label: 'Crónica (HTA/Diabetes)',
    color: '#4B5563',
    badge: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  neurologica: {
    label: 'Neurológica',
    color: '#4F46E5',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  otra: {
    label: 'Otra categoría',
    color: '#6B7280',
    badge: 'bg-stone-100 text-stone-800 border-stone-300',
  },
};
