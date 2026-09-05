import type { Inscripcion, InscripcionForm, Jornada, JornadaForm, Metricas, TipoDocumento } from '@/types/horary';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) throw new Error('Falta la variable de entorno requerida: NEXT_PUBLIC_API_URL');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || 'No se pudo completar la solicitud');
  return body;
}

export function getDashboardData(filters: { estado: string; fechaDesde: string; fechaHasta: string }) {
  const params = new URLSearchParams();
  if (filters.estado) params.set('estado', filters.estado);
  if (filters.fechaDesde) params.set('fechaDesde', filters.fechaDesde);
  if (filters.fechaHasta) params.set('fechaHasta', filters.fechaHasta);
  return Promise.all([
    request<Jornada[]>(`/api/jornadas${params.toString() ? `?${params.toString()}` : ''}`),
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

export function activateJornada(jornada: Jornada) {
  return request<Jornada>(`/api/jornadas/${jornada.id}`, { method: 'PUT', body: JSON.stringify({ nombre: jornada.nombre, sede: jornada.sede, fecha: jornada.fecha, cupoTotal: jornada.cupoTotal, activa: true }) });
}

export function deactivateJornada(id: string) {
  return request<Jornada>(`/api/jornadas/${id}`, { method: 'DELETE' });
}

export function listInscripciones(id: string) { return request<Inscripcion[]>(`/api/jornadas/${id}/inscripciones`); }
export function createInscripcion(id: string, form: InscripcionForm) { return request<Inscripcion>(`/api/jornadas/${id}/inscripciones`, { method: 'POST', body: JSON.stringify(form) }); }
export function cancelInscripcion(id: string) { return request<Inscripcion>(`/api/inscripciones/${id}`, { method: 'DELETE' }); }
export function listTiposDocumento() { return request<TipoDocumento[]>('/api/tipos-documento'); }
