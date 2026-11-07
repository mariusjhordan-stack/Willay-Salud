import { FichaClinica, AlertaBanderaRoja } from '../types';

/**
 * Función pura que evalúa reglas transparentes de banderas rojas en la ficha clínica.
 * No genera diagnósticos médicos, sino alertas de apoyo a la decisión clínica.
 */
export function evaluarUrgencia(ficha: FichaClinica | null | undefined): AlertaBanderaRoja[] {
  if (!ficha) return [];

  const alertas: AlertaBanderaRoja[] = [];
  const respuestas = ficha.respuestas_preguntas || {};

  const zona = (ficha.zona_cuerpo || '').toLowerCase();
  const sintomasStr = (ficha.sintomas || []).join(' ').toLowerCase();

  const esDolorPecho =
    zona.includes('pecho') ||
    sintomasStr.includes('pecho') ||
    sintomasStr.includes('sonqo nanay');

  const esDolorCabeza =
    zona.includes('cabeza') ||
    sintomasStr.includes('cabeza') ||
    sintomasStr.includes('uma nanay');

  const esDolorBarriga =
    zona.includes('barriga') ||
    zona.includes('abdomen') ||
    sintomasStr.includes('barriga') ||
    sintomasStr.includes('wiksa nanay');

  const tieneFiebre = respuestas['fiebre'] === 'si';
  const estaEmbarazada = respuestas['embarazo'] === 'si';
  const tuvoGolpes = respuestas['golpes_caidas'] === 'si';

  // Regla 1: Dolor de pecho con intensidad >= 4
  if (esDolorPecho && ficha.intensidad >= 4) {
    alertas.push({
      id: 'pecho_alta_intensidad',
      motivo: `Dolor de pecho de intensidad alta (${ficha.intensidad}/5): evaluar de inmediato`,
      regla: 'Dolor de pecho con intensidad ≥ 4',
      nivel: 'critica',
      recomendacion: 'Descartar síndrome coronario agudo o compromiso respiratorio severo.',
    });
  }

  // Regla 2: Fiebre + Embarazo
  if (tieneFiebre && estaEmbarazada) {
    alertas.push({
      id: 'fiebre_embarazo',
      motivo: 'Fiebre reportada en paciente gestante: evaluar de inmediato',
      regla: 'Fiebre reportada + Paciente en gestación',
      nivel: 'critica',
      recomendacion: 'Evaluar foco infeccioso obstétrico o sistémico prioritario.',
    });
  }

  // Regla 3: Confianza < 0.6 en síntomas graves (intensidad >= 4 o zona pecho/abdomen)
  if (ficha.confianza < 0.6 && (ficha.intensidad >= 4 || esDolorPecho || esDolorBarriga)) {
    alertas.push({
      id: 'baja_confianza_grave',
      motivo: `Traducción con baja certeza (${Math.round(ficha.confianza * 100)}%) ante dolor agudo: verificar presencialmente`,
      regla: 'Confianza lingüística < 60% con intensidad ≥ 4 o zona crítica',
      nivel: 'critica',
      recomendacion: 'Confirmar síntomas directamente con palpación, gestos o intérprete presencial.',
    });
  }

  // Regla 4: Golpes o caídas + Dolor de cabeza con intensidad >= 4
  if (tuvoGolpes && esDolorCabeza && ficha.intensidad >= 4) {
    alertas.push({
      id: 'trauma_cefalea',
      motivo: 'Traumatismo/golpe con dolor de cabeza intenso: descartar lesión craneal',
      regla: 'Golpes o caídas + Cefalea con intensidad ≥ 4',
      nivel: 'critica',
      recomendacion: 'Examinar estado de alerta, pupilas y signos meníngeos/neurológicos.',
    });
  }

  // Regla 5: Dolor de barriga con intensidad 5/5
  if (esDolorBarriga && ficha.intensidad >= 5) {
    alertas.push({
      id: 'abdomen_maximo',
      motivo: 'Dolor de barriga de máxima intensidad (5/5): descartar abdomen agudo',
      regla: 'Dolor abdominal con intensidad = 5',
      nivel: 'advertencia',
      recomendacion: 'Evaluar signos de peritonismo, descompresión dolorosa y ruidos hidroaéreos.',
    });
  }

  return alertas;
}
