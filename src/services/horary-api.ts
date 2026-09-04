import type { Jornada, JornadaForm, Metricas } from '@/types/horary';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || 'No se pudo completar la solicitud');
  return body;
}

export function getDashboardData() {
  return Promise.all([
    request<Jornada[]>('/api/jornadas?estado=activa&filtroCupo=con_cupo'),
    request<Metricas>('/api/metricas'),
  ]);
}

export function createJornada(form: JornadaForm) {
  return request<Jornada>('/api/jornadas', {
    method: 'POST',
    body: JSON.stringify({ ...form, cupoTotal: Number(form.cupoTotal), activa: true }),
  });
}

export function deactivateJornada(id: string) {
  return request<Jornada>(`/api/jornadas/${id}`, { method: 'DELETE' });
}
