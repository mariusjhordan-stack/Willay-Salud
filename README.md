# Willay Salud (PWA Mobile-First)

Prototipo funcional de salud intercultural que asiste la comunicación entre pacientes quechuahablantes y personal médico en español.

> **AVISO GENERAL Y DE PRIVACIDAD:**  
> Todos los datos de pacientes, DNI y registros clínicos son **ESTRICTAMENTE FICTICIOS** para propósitos de demostración. La aplicación no solicita ni almacena datos reales de personas.  
> *Aviso: Herramienta de apoyo a la comunicación. No reemplaza el diagnóstico médico.*

---

## Nuevas Capacidades Implementadas

### 1. Autenticación de Médicos (JWT + bcrypt)
- **Acceso diferenciado:** La vista del paciente no requiere autenticación; el panel médico cuenta con pantalla de login profesional (correo y contraseña).
- **Backend seguro:** Endpoint `POST /api/login` que valida credenciales con contraseñas hasheadas (`bcrypt`) y genera tokens JWT firmados con `JWT_SECRET`.
- **Roles:**
  - **`admin`:** Acceso a todos los pacientes y a la pestaña exclusiva de **Auditoría**.
  - **`medico`:** Acceso a la cola y triage de sus pacientes asignados.
- **Inactividad:** Cierre de sesión automático tras 10 minutos sin actividad.
- **Preparado para Firebase:** Estructura desacoplada en `authService.ts` lista para reemplazar el backend por Firebase Authentication.

#### Cuentas de Prueba (Modo Demostración):
| Nombre | Correo | Contraseña | Rol | Acceso |
|---|---|---|---|---|
| **Dra. Elena Quispe** | `admin@willaysalud.pe` | `Admin2026!` | `admin` | Todos los pacientes + Auditoría |
| **Dr. Carlos Mamani** | `dr.mamani@willaysalud.pe` | `Mamani2026!` | `medico` | Pacientes asignados + Triage |
| **Dra. Rosa Condori** | `dra.condori@willaysalud.pe` | `Condori2026!` | `medico` | Pacientes asignados + Triage |
*(En la pantalla de login se incluye un panel de 1-clic para ingresar de inmediato con cualquiera de estas cuentas)*

---

### 2. Registro y Modelo Completo de Pacientes
- **Campos del modelo:**
  - Identidad: `id`, `nombres`, `apellidos`, `dni` (ficticio), `edad`, `sexo`.
  - Origen y Lengua: `comunidad_distrito`, `variante_quechua`, `idioma_preferido`.
  - Accesibilidad: `nivel_lectura` (*lee*, *lee poco*, *no lee*), `discapacidad` (*ninguna*, *visual*, *auditiva*, *motora*, *intelectual*, *otra* + detalle), `necesidades_comunicacion` (*usa audio preferente*, *requiere acompañante*, etc.).
  - Clínico: `alergias`, `condiciones_cronicas`, `categoria_enfermedad`, `estado` (*en espera*, *en atencion*, *atendido*, *derivado*), `medico_asignado`.
  - **Consentimiento informado obligatorio:** No permite guardar ningún paciente si no se marca la aceptación del consentimiento informado.
- **Almacenamiento:** Archivo JSON en el backend (`server/data/pacientes.json`) con respaldo en `localStorage`.  
  *Nota técnica: Este almacenamiento simple en archivo JSON / localStorage es exclusivamente demostrativo para prototipos rápidos y NO es apto para entornos de producción médica.*

---

### 3. Clasificación por Categorías de Enfermedad
- **Categorías soportadas:**
  - `respiratoria`
  - `digestiva`
  - `cardiovascular`
  - `infecciosa`
  - `dolor/trauma`
  - `materno-infantil`
  - `cronica` (Hipertensión / Diabetes)
  - `neurologica`
  - `otra`
- **Sugerencia inteligente:** Función pura `sugerirCategoriaEnfermedad` que propone la categoría en base a zona anatómica, síntomas y respuestas del triaje. El médico puede ajustarla en cualquier momento desde la ficha.

---

### 4. Cola de Triage de Pacientes y Acciones
- **Cola de prioridad clínica:** Ordenada por defecto por nivel de urgencia (`Alta` > `Media` > `Baja`).
- **Buscador y Filtros combinables:** Por texto (nombre, DNI, comunidad), urgencia, categoría clínica, discapacidad y estado.
- **Señalización visual de accesibilidad:** Íconos visibles de alerta para necesidades especiales (*no lee / usa audio*, *discapacidad visual*, *auditiva*, *motora*).
- **Acciones disponibles por paciente:**
  - Ver ficha clínica completa e historial evolutivo.
  - Iniciar nueva consulta clínica.
  - Agregar notas médicas de evolución.
  - Cambiar estado de atención (*en espera*, *en atencion*, *atendido*, *derivado*).
  - Programar fecha y motivo de seguimiento.
  - Descargar expediente en PDF.

---

### 5. Historial Clínico Mejorado y Dashboard Resumen
- **Ficha del paciente:** Desglose de antecedentes, discapacidad, alergias, consultas previas y gráfico de evolución del dolor (`recharts`).
- **Panel Resumen del Médico:**
  - Métricas de consultas totales, casos urgentes, pacientes en espera y seguimientos pendientes.
  - Gráfico de barras interactivo de distribución por categoría de enfermedad.

---

### 6. Registro de Auditoría de Accesos (Solo Admin)
- Registro cronológico detallado de accesos a historias clínicas (médico, fecha/hora, acción, paciente consultado y detalles).
- Visible únicamente para usuarios con rol `admin` en la pestaña **Auditoría**.

---

### 7. Datos de Ejemplo Realistas (8 Pacientes Ficticios)
- Botón **"Cargar 8 Pacientes Demo"** que siembra pacientes con perfiles diversos:
  1. *Santusa Huillca Mamani* (74 años, Quechua Cusco-Collao, no lee, catarata senil, dolor de barriga).
  2. *Marisol Quispe Ccori* (23 años, gestante 28 semanas, fiebre + dolor abdominal, urgencia alta).
  3. *Mateo Condori Yupanqui* (8 años, niño, Quechua Chanka, dolor de garganta y fiebre).
  4. *Donato Ttito Pauccar* (68 años, secuela motora, dolor de pecho 5/5, urgencia alta).
  5. *Benita Ccama Huamán* (55 años, hipoacusia severa, hipertensión, cefalea).
  6. *Julián Mayhua Choque* (32 años, traumatismo por caída en faena, urgencia alta).
  7. *Asunción Champi Ccolque* (81 años, no lee, cefalea explosiva, estado derivado).
  8. *Valentina Flores Pillco* (42 años, faringitis leve, estado atendido).
- Cada paciente cuenta con 2 a 5 consultas con fechas escalonadas, notas médicas y evolución.

---

## Ejecución del Proyecto

```bash
npm run dev
```
- Aplicación Web PWA: [http://localhost:5173](http://localhost:5173)
- Servidor Express: [http://localhost:3001](http://localhost:3001)
