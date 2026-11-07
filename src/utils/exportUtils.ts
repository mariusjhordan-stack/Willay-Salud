import { jsPDF } from 'jspdf';
import { FichaClinica } from '../types';

export function exportarFichaPDF(ficha: FichaClinica): void {
  const doc = new jsPDF();
  const fecha = ficha.fecha || new Date().toLocaleString();

  // Primary header
  doc.setFillColor(184, 74, 40); // Terracota #B84A28
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('WILLAY SALUD', 15, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Ficha Médica de Triage Intercultural (Quechua - Español)', 15, 25);

  // Date and Meta
  doc.setTextColor(43, 38, 37);
  doc.setFontSize(10);
  doc.text(`Fecha y hora de registro: ${fecha}`, 15, 40);
  doc.text(`Nivel de Urgencia: ${ficha.urgencia.toUpperCase()}`, 15, 47);
  doc.text(`Nivel de Confianza Lingüística: ${(ficha.confianza * 100).toFixed(0)}%`, 120, 47);

  // Divider
  doc.setDrawColor(227, 218, 201);
  doc.line(15, 52, 195, 52);

  // Clinical Summary Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 107, 101); // Teal #1E6B65
  doc.text('1. RESUMEN CLÍNICO DEL PACIENTE', 15, 60);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(43, 38, 37);

  doc.text(`• Síntomas principales: ${ficha.sintomas.join(', ')}`, 18, 68);
  doc.text(`• Zona anatómica: ${ficha.zona_cuerpo}`, 18, 75);
  doc.text(`• Duración reportada: ${ficha.duracion}`, 18, 82);
  doc.text(`• Intensidad del dolor: ${ficha.intensidad}/5`, 18, 89);

  // Quechua original & translation
  doc.setFont('helvetica', 'bold');
  doc.text('Transcripción Quechua:', 18, 98);
  doc.setFont('helvetica', 'italic');
  doc.text(`"${ficha.transcripcion_quechua}"`, 18, 104);

  doc.setFont('helvetica', 'bold');
  doc.text('Interpretación al Español:', 18, 114);
  doc.setFont('helvetica', 'normal');
  doc.text(`"${ficha.traduccion_espanol}"`, 18, 120);

  // Yes / No Questions Section
  const respuestas = ficha.respuestas_preguntas || {};
  let currentY = 135;

  if (Object.keys(respuestas).length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 107, 101);
    doc.text('2. PREGUNTAS RÁPIDAS DE TRIAJE (SÍ / NO)', 15, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(43, 38, 37);

    const labels: Record<string, string> = {
      fiebre: '¿Tiene fiebre?',
      duracion_3dias: '¿Desde hace más de 3 días?',
      embarazo: '¿Está embarazada?',
      alergias: '¿Tiene alergias?',
      medicamento: '¿Toma algún medicamento?',
      golpes_caidas: '¿Tuvo golpes o caídas?',
    };

    Object.entries(respuestas).forEach(([key, val]) => {
      const label = labels[key] || key;
      const respText = val === 'si' ? 'SÍ (Ari)' : val === 'no' ? 'NO (Manam)' : 'Sin respuesta';
      doc.text(`• ${label}: ${respText}`, 18, currentY);
      currentY += 6;
    });

    currentY += 5;
  }

  // Legal Disclaimer Box (MANDATORY)
  doc.setFillColor(250, 246, 239);
  doc.rect(15, currentY, 180, 20, 'F');
  doc.setDrawColor(184, 74, 40);
  doc.rect(15, currentY, 180, 20, 'D');

  doc.setFontSize(9);
  doc.setTextColor(184, 74, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('AVISO LEGAL OBLIGATORIO:', 20, currentY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(92, 84, 80);
  doc.text(
    'Herramienta de apoyo a la comunicación. No reemplaza el diagnóstico médico.',
    20,
    currentY + 13
  );

  // Save the PDF
  const filename = `WillaySalud_Ficha_${ficha.zona_cuerpo || 'clinica'}_${Date.now()}.pdf`;
  doc.save(filename);
}

export function generarTextoWhatsApp(ficha: FichaClinica): string {
  const fecha = ficha.fecha || new Date().toLocaleString();
  const respuestas = ficha.respuestas_preguntas || {};

  let texto = `*📋 FICHA DE TRIAJE - WILLAY SALUD*\n`;
  texto += `_Herramienta de apoyo a la comunicación_\n\n`;
  texto += `🗓 *Fecha:* ${fecha}\n`;
  texto += `⚠️ *Urgencia:* ${ficha.urgencia.toUpperCase()} | *Confianza:* ${(ficha.confianza * 100).toFixed(0)}%\n\n`;
  texto += `👤 *Síntomas:* ${ficha.sintomas.join(', ')}\n`;
  texto += `📍 *Zona anatómica:* ${ficha.zona_cuerpo}\n`;
  texto += `⏱ *Duración:* ${ficha.duracion}\n`;
  texto += `💥 *Intensidad:* ${ficha.intensidad}/5\n\n`;
  texto += `🗣 *Quechua:* "${ficha.transcripcion_quechua}"\n`;
  texto += `📝 *Español:* "${ficha.traduccion_espanol}"\n\n`;

  if (Object.keys(respuestas).length > 0) {
    texto += `*🔍 Preguntas rápidas:*\n`;
    const labels: Record<string, string> = {
      fiebre: 'Fiebre',
      duracion_3dias: '>3 días',
      embarazo: 'Embarazo',
      alergias: 'Alergias',
      medicamento: 'Medicación',
      golpes_caidas: 'Golpes/Caídas',
    };
    Object.entries(respuestas).forEach(([k, v]) => {
      texto += `- ${labels[k] || k}: ${v === 'si' ? 'SÍ (Ari)' : 'NO (Manam)'}\n`;
    });
    texto += `\n`;
  }

  texto += `_Aviso: Herramienta de apoyo a la comunicación. No reemplaza el diagnóstico médico._`;
  return texto;
}
