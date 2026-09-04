import type { Inscripcion, InscripcionForm, Jornada, JornadaForm, Metricas, TipoDocumento } from '@/types/horary';

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

export function updateJornada(id: string, form: JornadaForm) {
  return request<Jornada>(`/api/jornadas/${id}`, { method: 'PUT', body: JSON.stringify({ ...form, cupoTotal: Number(form.cupoTotal) }) });
}

export function deactivateJornada(id: string) {
  return request<Jornada>(`/api/jornadas/${id}`, { method: 'DELETE' });
}

export function listInscripciones(id: string) { return request<Inscripcion[]>(`/api/jornadas/${id}/inscripciones`); }
export function createInscripcion(id: string, form: InscripcionForm) { return request<Inscripcion>(`/api/jornadas/${id}/inscripciones`, { method: 'POST', body: JSON.stringify(form) }); }
export function cancelInscripcion(id: string) { return request<Inscripcion>(`/api/inscripciones/${id}`, { method: 'DELETE' }); }
export function listTiposDocumento() { return request<TipoDocumento[]>('/api/tipos-documento'); }
