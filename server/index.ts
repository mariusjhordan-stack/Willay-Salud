import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'willay_salud_jwt_secret_dev_key_2026';

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Directories for demo data storage
const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PACIENTES_FILE = path.join(DATA_DIR, 'pacientes.json');
const AUDITORIA_FILE = path.join(DATA_DIR, 'auditoria.json');

// Pre-seeded demo doctors with hashed passwords (bcrypt)
// Contraseñas de prueba:
// 1. admin@willaysalud.pe -> Admin2026! (Rol: admin)
// 2. dr.mamani@willaysalud.pe -> Mamani2026! (Rol: medico)
// 3. dra.condori@willaysalud.pe -> Condori2026! (Rol: medico)
const DOCTORES_DEMO = [
  {
    id: 'doc-001',
    email: 'admin@willaysalud.pe',
    passwordHash: bcrypt.hashSync('Admin2026!', 10),
    nombre: 'Dra. Elena Quispe',
    especialidad: 'Medicina General y Coordinación',
    rol: 'admin' as const,
  },
  {
    id: 'doc-002',
    email: 'dr.mamani@willaysalud.pe',
    passwordHash: bcrypt.hashSync('Mamani2026!', 10),
    nombre: 'Dr. Carlos Mamani',
    especialidad: 'Medicina Rural y Triage',
    rol: 'medico' as const,
  },
  {
    id: 'doc-003',
    email: 'dra.condori@willaysalud.pe',
    passwordHash: bcrypt.hashSync('Condori2026!', 10),
    nombre: 'Dra. Rosa Condori',
    especialidad: 'Salud Intercultural y Materna',
    rol: 'medico' as const,
  },
];

// Helper to load/save JSON files
function readJsonFile<T>(filePath: string, defaultData: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn(`Error leyendo archivo ${filePath}:`, e);
  }
  return defaultData;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Error guardando archivo ${filePath}:`, e);
  }
}

// Authentication Middleware
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    nombre: string;
    especialidad: string;
    rol: 'medico' | 'admin';
  };
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado: Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Token inválido o expirado', detalle: err.message });
  }
}

// Health / Status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 5),
    model: 'gemini-2.5-flash',
    glosarioValidacion: 'por validar con hablante nativo',
    modo: Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 5)
      ? 'Producción con Gemini'
      : 'Modo Demostración (Sin API Key)',
  });
});

// Endpoint: POST /api/login
app.post('/api/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Se requiere correo electrónico y contraseña' });
  }

  const doctor = DOCTORES_DEMO.find((d) => d.email.toLowerCase() === email.trim().toLowerCase());
  if (!doctor) {
    return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
  }

  const passwordValido = bcrypt.compareSync(password, doctor.passwordHash);
  if (!passwordValido) {
    return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
  }

  // Generate JWT token (expires in 12 hours)
  const tokenPayload = {
    id: doctor.id,
    email: doctor.email,
    nombre: doctor.nombre,
    especialidad: doctor.especialidad,
    rol: doctor.rol,
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '12h' });

  // Register in audit log
  const auditLogs = readJsonFile<any[]>(AUDITORIA_FILE, []);
  const newLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    usuarioEmail: doctor.email,
    usuarioNombre: doctor.nombre,
    rol: doctor.rol,
    accion: 'Inicio de sesión exitoso',
    detalles: `Acceso al panel médico con rol ${doctor.rol}`,
  };
  writeJsonFile(AUDITORIA_FILE, [newLog, ...auditLogs]);

  return res.json({
    token,
    doctor: tokenPayload,
  });
});

// Endpoint: GET /api/pacientes (Protected by JWT)
app.get('/api/pacientes', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const pacientes = readJsonFile<any[]>(PACIENTES_FILE, []);
  const user = req.user;

  // Audit read action
  if (user) {
    const auditLogs = readJsonFile<any[]>(AUDITORIA_FILE, []);
    auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      usuarioEmail: user.email,
      usuarioNombre: user.nombre,
      rol: user.rol,
      accion: 'Consulta de lista de pacientes',
      detalles: user.rol === 'admin' ? 'Visualizó todos los pacientes' : `Visualizó pacientes asignados a ${user.email}`,
    });
    writeJsonFile(AUDITORIA_FILE, auditLogs.slice(0, 500));
  }

  // Admin sees all; Medico sees assigned patients
  if (user?.rol === 'admin') {
    return res.json(pacientes);
  } else {
    const filtrados = pacientes.filter(
      (p) => !p.medico_asignado || p.medico_asignado === user?.email || p.medico_asignado === user?.id
    );
    return res.json(filtrados);
  }
});

// Endpoint: POST /api/pacientes (Protected by JWT)
app.post('/api/pacientes', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const nuevoPaciente = req.body;
  const user = req.user!;

  // Strict consent check
  if (!nuevoPaciente.consentimiento_informado?.aceptado) {
    return res.status(400).json({
      error: 'Consentimiento informado obligatorio: No se puede guardar al paciente sin consentimiento registrado.',
    });
  }

  if (!nuevoPaciente.nombres || !nuevoPaciente.apellidos || !nuevoPaciente.dni) {
    return res.status(400).json({ error: 'Nombres, apellidos y DNI ficticio son obligatorios' });
  }

  const pacientes = readJsonFile<any[]>(PACIENTES_FILE, []);
  const pacienteConId = {
    ...nuevoPaciente,
    id: nuevoPaciente.id || `pac-${Date.now()}`,
    fecha_registro: nuevoPaciente.fecha_registro || new Date().toLocaleString(),
    consultas: nuevoPaciente.consultas || [],
    notas_medicas: nuevoPaciente.notas_medicas || [],
  };

  pacientes.unshift(pacienteConId);
  writeJsonFile(PACIENTES_FILE, pacientes);

  // Audit
  const auditLogs = readJsonFile<any[]>(AUDITORIA_FILE, []);
  auditLogs.unshift({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    usuarioEmail: user.email,
    usuarioNombre: user.nombre,
    rol: user.rol,
    accion: 'Creación de nuevo paciente',
    pacienteId: pacienteConId.id,
    pacienteNombre: `${pacienteConId.nombres} ${pacienteConId.apellidos}`,
    detalles: `Registro de nuevo paciente con DNI ficticio ${pacienteConId.dni}`,
  });
  writeJsonFile(AUDITORIA_FILE, auditLogs.slice(0, 500));

  res.status(201).json(pacienteConId);
});

// Endpoint: PUT /api/pacientes/:id (Protected by JWT)
app.put('/api/pacientes/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const user = req.user!;

  const pacientes = readJsonFile<any[]>(PACIENTES_FILE, []);
  const index = pacientes.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Paciente no encontrado' });
  }

  pacientes[index] = { ...pacientes[index], ...updates };
  writeJsonFile(PACIENTES_FILE, pacientes);

  // Audit
  const auditLogs = readJsonFile<any[]>(AUDITORIA_FILE, []);
  auditLogs.unshift({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    usuarioEmail: user.email,
    usuarioNombre: user.nombre,
    rol: user.rol,
    accion: 'Actualización de datos del paciente',
    pacienteId: id,
    pacienteNombre: `${pacientes[index].nombres} ${pacientes[index].apellidos}`,
    detalles: `Actualización de estado o notas clínicas por ${user.nombre}`,
  });
  writeJsonFile(AUDITORIA_FILE, auditLogs.slice(0, 500));

  res.json(pacientes[index]);
});

// Endpoint: POST /api/pacientes/seed (Loads 8 mock patients for demo)
app.post('/api/pacientes/seed', (req: Request, res: Response) => {
  const { pacientes } = req.body;
  if (!pacientes || !Array.isArray(pacientes)) {
    return res.status(400).json({ error: 'Array de pacientes requerido' });
  }

  writeJsonFile(PACIENTES_FILE, pacientes);
  res.json({ status: 'ok', count: pacientes.length });
});

// Endpoint: GET /api/auditoria (Admin Only)
app.get('/api/auditoria', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: Se requiere rol de administrador' });
  }

  const logs = readJsonFile<any[]>(AUDITORIA_FILE, []);
  res.json(logs);
});

// Endpoint: POST /api/auditoria (Protected)
app.post('/api/auditoria', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const logData = req.body;
  const user = req.user!;

  const logs = readJsonFile<any[]>(AUDITORIA_FILE, []);
  const newLog = {
    ...logData,
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    usuarioEmail: user.email,
    usuarioNombre: user.nombre,
    rol: user.rol,
  };

  logs.unshift(newLog);
  writeJsonFile(AUDITORIA_FILE, logs.slice(0, 500));
  res.status(201).json(newLog);
});

// Demo predefined patient triage cases for fallback
const DEMO_CASES = [
  {
    transcripcion_quechua: 'Kimsantin punchawñam wiksay nanawan, anchatam nanawan mikusqay qepata.',
    traduccion_espanol: 'Hace 3 días que me duele la barriga (estómago), me duele mucho después de comer.',
    sintomas: ['wiksa nanay (dolor de barriga)'],
    zona_cuerpo: 'barriga',
    duracion: '3 punchaw (3 días)',
    intensidad: 4,
    urgencia: 'media',
    confianza: 0.88,
    es_demo: true,
    advertencia_confianza: null,
  },
  {
    transcripcion_quechua: 'Kunka nanaymi hap’iwan, chiri wayrawan manam allintachu samani.',
    traduccion_espanol: 'Me agarró dolor de garganta con el viento frío, casi no puedo respirar bien.',
    sintomas: ['kunka nanay (dolor de garganta)'],
    zona_cuerpo: 'garganta',
    duracion: '1 punchaw (1 día)',
    intensidad: 3,
    urgencia: 'baja',
    confianza: 0.79,
    es_demo: true,
    advertencia_confianza: null,
  },
  {
    transcripcion_quechua: 'Uma nanay sinchi... tutamantapacha mana allinchu kani...',
    traduccion_espanol: 'Dolor de cabeza muy fuerte... desde la madrugada no me siento bien...',
    sintomas: ['uma nanay (dolor de cabeza)'],
    zona_cuerpo: 'cabeza',
    duracion: 'Kunan punchaw (Hoy)',
    intensidad: 5,
    urgencia: 'alta',
    confianza: 0.52,
    es_demo: true,
    advertencia_confianza: 'Traducción poco segura, confirmar con el paciente',
  },
];

// Helper: build prompt for Gemini
const SYSTEM_PROMPT = `
Eres un asistente médico especializado en salud intercultural para Perú. Tu tarea es analizar la comunicación de un paciente quechuahablante (quechua chanka o collao) y estructurar sus síntomas para el médico en español.

REGLAS ESTRICTAS:
1. Devuelve ÚNICAMENTE un objeto JSON válido, sin texto antes ni después, sin markdown ni comillas invertidas extra si es posible.
2. Formato exacto requerido:
{
  "transcripcion_quechua": "texto transcrito en quechua o resumen en quechua",
  "traduccion_espanol": "traducción fiel y respetuosa al español",
  "sintomas": ["sintoma 1", "sintoma 2"],
  "zona_cuerpo": "cabeza | garganta | pecho | barriga | cuerpo general",
  "duracion": "tiempo referido (ej. 2 días, desde ayer)",
  "intensidad": <número entero entre 1 y 5>,
  "urgencia": "baja" | "media" | "alta",
  "confianza": <número flotante entre 0.0 y 1.0 indicando qué tan seguro estás de la interpretación lingüística>
}
3. Considera los términos base del glosario médico oficial:
- uma nanay (dolor de cabeza)
- wiksa nanay (dolor de barriga)
- kunka nanay (dolor de garganta)
- sonqo nanay (dolor de pecho)
4. Si la señal es ambigua, ruidosa o el quechua tiene variantes poco claras, asigna un valor de confianza MENOR A 0.60 para proteger al paciente.
`;

// Endpoint: POST /api/analizar (Available for Patient & Doctor)
app.post('/api/analizar', async (req: Request, res: Response) => {
  const { audioBase64, mimeType = 'audio/webm', sintomas, zona_cuerpo, intensidad, duracion, textoManual, demoId } = req.body;

  if (!GEMINI_API_KEY || demoId !== undefined) {
    const selectedDemo = typeof demoId === 'number' && DEMO_CASES[demoId] ? DEMO_CASES[demoId] : DEMO_CASES[0];

    if (sintomas && Array.isArray(sintomas) && sintomas.length > 0) {
      const customResponse = {
        transcripcion_quechua: `${sintomas.join(', ')} nanawan.`,
        traduccion_espanol: `El paciente indica padecer: ${sintomas.join(', ')}.`,
        sintomas: sintomas,
        zona_cuerpo: zona_cuerpo || 'zona seleccionada',
        duracion: duracion || 'Reciente',
        intensidad: Number(intensidad) || 3,
        urgencia: Number(intensidad) >= 4 ? 'alta' : 'media',
        confianza: 0.95,
        es_demo: !GEMINI_API_KEY,
        nota_sistema: !GEMINI_API_KEY
          ? 'Modo demostración: API Key no configurada en el servidor (.env).'
          : 'Procesado desde glosario local sin IA.',
      };
      return res.json(customResponse);
    }

    return res.json({
      ...selectedDemo,
      nota_sistema: 'Modo demostración: Ficha de ejemplo cargada directamente.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    let contents: any[] = [];

    if (audioBase64) {
      const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
      contents = [
        SYSTEM_PROMPT,
        {
          inlineData: {
            mimeType: mimeType || 'audio/webm',
            data: cleanBase64,
          },
        },
        'Analiza este audio de un paciente quechuahablante y extrae la ficha clínica solicitada en JSON.',
      ];
    } else {
      const promptText = `
        El paciente ha reportado los siguientes datos mediante la interfaz táctil:
        - Síntomas seleccionados: ${JSON.stringify(sintomas || [])}
        - Zona del cuerpo: ${zona_cuerpo || 'No especificada'}
        - Intensidad percibida (1-5): ${intensidad || 3}
        - Duración indicada: ${duracion || 'No especificada'}
        - Comentario adicional: ${textoManual || 'Ninguno'}

        Estructura la ficha médica en el JSON indicado traduciendo y estimando urgencia y confianza.
      `;
      contents = [SYSTEM_PROMPT, promptText];
    }

    let rawText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
      });
      rawText = response.text || '';
    } catch (modelErr: any) {
      console.warn('Intento con gemini-2.5-flash falló, intentando con gemini-1.5-flash:', modelErr?.message);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: contents,
      });
      rawText = fallbackResponse.text || '';
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta de Gemini.');
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    const confianza = typeof parsedData.confianza === 'number' ? parsedData.confianza : 0.75;
    const advertencia_confianza = confianza < 0.6 ? 'Traducción poco segura, confirmar con el paciente' : null;

    return res.json({
      ...parsedData,
      confianza,
      advertencia_confianza,
      es_demo: false,
    });
  } catch (error: any) {
    console.error('Error llamando a Gemini API:', error);
    return res.json({
      ...DEMO_CASES[0],
      es_demo: true,
      error_api: error.message || 'Error al conectar con la API de Gemini. Se ha activado el Modo Demostración.',
      nota_sistema: 'Modo demostración de respaldo activado por error de red o API.',
    });
  }
});

// Endpoint: POST /api/traducir-respuesta (Doctor's reply to Quechua)
app.post('/api/traducir-respuesta', async (req: Request, res: Response) => {
  const { textoEspanol, indicaciones } = req.body;

  if (!textoEspanol || !textoEspanol.trim()) {
    return res.status(400).json({ error: 'Texto en español requerido' });
  }

  const demoTranslations: Record<string, string> = {
    '¿Desde cuándo le duele?': "Hayk'aqmantapachataq nanasunki?",
    'Vamos a revisarle la presión y el pulso': "Ñit'iyniykita sonqoyki t'ik-t'ik-niyninta qhawasunchis",
    'Tome esta pastilla después de cada comida con agua tibia': "Kay hampita mikusqayki qepata upyay q'oñi yakuwan",
    'Descanse y guarde reposo por dos días': 'Iskay punchaw samariy wasiykipi',
    'Debe ir al centro de salud para un examen más detallado': 'Hampina wasiman rinayki allin qhawaykunapaq',
  };

  if (!GEMINI_API_KEY) {
    const match = Object.keys(demoTranslations).find(
      (k) =>
        textoEspanol.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(textoEspanol.toLowerCase())
    );

    const traduccionQuechua = match
      ? demoTranslations[match]
      : `Allillam kanki. Hampiqmi nin: "${textoEspanol}". Q'oñi yakuwan hampikuy.`;

    return res.json({
      texto_original: textoEspanol,
      traduccion_quechua: traduccionQuechua,
      pronunciacion_fonetica: 'Lectura fonética referencial (hablante nativo por validar)',
      es_demo: true,
      nota_sistema: 'Modo demostración: Traducción generada con plantilla estándar.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = `
      Eres un intérprete intercultural quechua-español en un centro de salud del Perú.
      Traduce el siguiente mensaje del médico (español) a un quechua claro, cálido, respetuoso y sencillo para un paciente quechuahablante.
      Mensaje médico: "${textoEspanol}"
      Indicaciones adicionales: "${indicaciones || 'Ninguna'}"

      Devuelve ÚNICAMENTE un JSON con:
      {
        "traduccion_quechua": "texto en quechua",
        "guia_pronunciacion": "guía simple de pronunciación en español",
        "tono": "cálido / tranquilizador"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const raw = response.text || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return res.json({
        texto_original: textoEspanol,
        traduccion_quechua: data.traduccion_quechua,
        guia_pronunciacion: data.guia_pronunciacion,
        es_demo: false,
      });
    }

    return res.json({
      texto_original: textoEspanol,
      traduccion_quechua: raw.trim(),
      es_demo: false,
    });
  } catch (err: any) {
    console.error('Error traduciendo respuesta médica con Gemini:', err);
    return res.json({
      texto_original: textoEspanol,
      traduccion_quechua: `Allillam kanki. Hampiqmi nin: "${textoEspanol}".`,
      es_demo: true,
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`[Willay Salud Backend] Servidor activo en http://localhost:${PORT}`);
  console.log(`[Willay Salud Backend] GEMINI_API_KEY configurada: ${Boolean(GEMINI_API_KEY)}`);
  console.log(`[Willay Salud Backend] JWT_SECRET activo para autenticación`);
});
