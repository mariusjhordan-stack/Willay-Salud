import { DoctorUser } from '../types';

const TOKEN_KEY = 'willay_salud_doctor_token';
const USER_KEY = 'willay_salud_doctor_user';
const LAST_ACTIVITY_KEY = 'willay_salud_last_activity';
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Servicio de autenticación diseñado con una interfaz limpia
 * para facilitar su reemplazo futuro por Firebase Authentication.
 */
export interface IAuthService {
  login(email: string, password: string): Promise<DoctorUser>;
  logout(): void;
  getCurrentUser(): DoctorUser | null;
  getToken(): string | null;
  updateLastActivity(): void;
  isSessionExpired(): boolean;
}

class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<DoctorUser> {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Credenciales inválidas');
      }

      const data = await response.json();
      const user: DoctorUser = {
        ...data.doctor,
        token: data.token,
      };

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      this.updateLastActivity();

      return user;
    } catch (e: any) {
      // Offline fallback demo login for pure offline demos
      if (email.toLowerCase().includes('admin') && password === 'Admin2026!') {
        const demoAdmin: DoctorUser = {
          id: 'doc-001',
          email: 'admin@willaysalud.pe',
          nombre: 'Dra. Elena Quispe (Demo Offline)',
          especialidad: 'Medicina General y Coordinación',
          rol: 'admin',
          token: 'demo_token_offline_admin',
        };
        localStorage.setItem(TOKEN_KEY, demoAdmin.token!);
        localStorage.setItem(USER_KEY, JSON.stringify(demoAdmin));
        this.updateLastActivity();
        return demoAdmin;
      }

      if (email.toLowerCase().includes('mamani') && password === 'Mamani2026!') {
        const demoMedico: DoctorUser = {
          id: 'doc-002',
          email: 'dr.mamani@willaysalud.pe',
          nombre: 'Dr. Carlos Mamani (Demo Offline)',
          especialidad: 'Medicina Rural y Triage',
          rol: 'medico',
          token: 'demo_token_offline_medico',
        };
        localStorage.setItem(TOKEN_KEY, demoMedico.token!);
        localStorage.setItem(USER_KEY, JSON.stringify(demoMedico));
        this.updateLastActivity();
        return demoMedico;
      }

      throw e;
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  }

  getCurrentUser(): DoctorUser | null {
    if (this.isSessionExpired()) {
      this.logout();
      return null;
    }
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    if (this.isSessionExpired()) {
      this.logout();
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  updateLastActivity(): void {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }

  isSessionExpired(): boolean {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return false;
    const diff = Date.now() - parseInt(lastActivity, 10);
    return diff > INACTIVITY_TIMEOUT_MS;
  }
}

export const authService = new AuthService();
