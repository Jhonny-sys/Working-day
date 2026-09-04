'use client';

import { useEffect, useState } from 'react';
import { CreateInscripcionModal } from '@/components/CreateInscripcionModal';
import { CreateJornadaModal } from '@/components/CreateJornadaModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { RegistrationsModal } from '@/components/RegistrationsModal';
import { DateRangeField } from '@/components/DateRangeField';
import { activateJornada, cancelInscripcion, createInscripcion, createJornada, deactivateJornada, getDashboardData, listInscripciones, listTiposDocumento, updateJornada } from '@/services/horary-api';
import type { Inscripcion, InscripcionForm, Jornada, JornadaForm, Metricas, TipoDocumento } from '@/types/horary';

type PendingConfirmation = { type: 'jornada' | 'activar'; jornada: Jornada } | { type: 'inscripcion'; id: string; jornadaId: string } | null;

function formatMonth(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('es-CO', { month: 'short' }).replace('.', '').toUpperCase();
}

function isPastDate(date: string) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return date < todayKey;
}

export default function Home() {
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Jornada | null>(null);
  const [registering, setRegistering] = useState<Jornada | null>(null);
  const [inscripciones, setInscripciones] = useState<Record<string, Inscripcion[]>>({});
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [selectedRegistrations, setSelectedRegistrations] = useState<{ jornada: Jornada; items: Inscripcion[] } | null>(null);
  const [message, setMessage] = useState('');
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [[jornadasData, metricasData], tipos] = await Promise.all([getDashboardData({ estado: statusFilter, fechaDesde: dateFrom, fechaHasta: dateTo }), listTiposDocumento()]);
      setJornadas(jornadasData);
      setMetricas(metricasData);
      setTiposDocumento(tipos);
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo conectar con la API');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [statusFilter, dateFrom, dateTo]);

  async function handleCreate(form: JornadaForm) {
    try {
      await createJornada(form);
      setModalOpen(false);
      setMessage('Jornada creada correctamente.');
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo crear la jornada');
    }
  }

  async function handleDeactivate(id: string) {
    try {
      await deactivateJornada(id);
      setMessage('Jornada desactivada.');
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo desactivar la jornada');
    }
  }

  async function handleActivate(jornada: Jornada) {
    try { await activateJornada(jornada); setMessage('Jornada activada nuevamente.'); await loadData(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo activar la jornada'); }
  }

  async function handleEdit(form: JornadaForm) {
    if (!editing) return;
    try { await updateJornada(editing.id, form); setEditing(null); setMessage('Jornada actualizada correctamente.'); await loadData(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo actualizar la jornada'); }
  }

  async function handleRegister(form: InscripcionForm) {
    if (!registering) return;
    if (isPastDate(registering.fecha)) {
      setRegistering(null);
      setMessage('No se puede inscribir a una jornada con fecha ya cumplida.');
      return;
    }
    try { await createInscripcion(registering.id, form); setRegistering(null); setMessage('Inscripción confirmada.'); await loadData(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo registrar la inscripción'); }
  }

  async function showInscripciones(jornada: Jornada) {
    try { const items = await listInscripciones(jornada.id); setInscripciones({ ...inscripciones, [jornada.id]: items }); setSelectedRegistrations({ jornada, items }); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudieron cargar las inscripciones'); }
  }

  async function handleCancelInscripcion(id: string, jornadaId: string) {
    try { await cancelInscripcion(id); await showInscripciones(jornadas.find((item) => item.id === jornadaId)!); await loadData(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo cancelar la inscripción'); }
  }

  function requestCancelInscripcion(id: string) {
    if (!selectedRegistrations) return;
    setPendingConfirmation({ type: 'inscripcion', id, jornadaId: selectedRegistrations.jornada.id });
  }

  async function confirmPendingAction() {
    const action = pendingConfirmation;
    setPendingConfirmation(null);
    if (!action) return;
    if (action.type === 'jornada') await handleDeactivate(action.jornada.id);
    if (action.type === 'activar') await handleActivate(action.jornada);
    if (action.type === 'inscripcion') await handleCancelInscripcion(action.id, action.jornadaId);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">H</span><span>HORARY</span></div>
        <div className="topbar-actions"><span className="status"><i /> Servicios operativos</span><button className="primary-button topbar-button" onClick={() => setModalOpen(true)}>+ Nueva jornada</button></div>
      </header>

      <section className="intro">
        <div><p className="eyebrow">Panel de coordinación</p><h1>Jornadas que<br /><em>sí caben.</em></h1></div>
        <p className="intro-copy">Administra fechas, sedes y capacidad desde un solo lugar. La operación vive en el panel; las acciones aparecen cuando las necesitas.</p>
      </section>

      <section className="metrics" aria-label="Resumen">
        <div><span>Jornadas activas</span><strong>{metricas?.totalJornadasActivas ?? '-'}</strong></div>
        <div><span>Inscripciones confirmadas</span><strong>{metricas?.totalInscripcionesConfirmadas ?? '-'}</strong></div>
        <div><span>Ocupación global</span><strong>{metricas ? `${metricas.porcentajeOcupacionGlobal}%` : '-'}</strong></div>
      </section>

      <section className="workspace">
        <div className="section-heading"><div><p className="eyebrow">Programación</p><h2>Todas las jornadas</h2></div><button className="refresh" onClick={loadData}>Actualizar</button></div>
        <div className="filter-toolbar"><button className={`filter-toggle ${filtersOpen ? 'open' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}>Filtrar <i className="dropdown-chevron" /></button>{(statusFilter || dateFrom || dateTo) && <span className="filter-count">Filtros activos</span>}</div>
        {filtersOpen && <div className="filters" aria-label="Filtros de jornadas">
          <label className="status-filter">Estado<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Todas</option><option value="activa">Activas</option><option value="inactiva">Inactivas</option></select></label>
          <div className="date-range"><span>Rango de fechas</span><DateRangeField from={dateFrom} to={dateTo} onApply={(from, to) => { setDateFrom(from); setDateTo(to); }} /></div>
          {(statusFilter || dateFrom || dateTo) && <button className="clear-filter" onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); }}>Limpiar filtros</button>}
        </div>}
        {message && <p className="notice" role="status">{message}</p>}
        {loading ? <p className="empty">Cargando jornadas...</p> : jornadas.length === 0 ? <p className="empty">No hay jornadas activas con cupos disponibles.</p> : (
          <div className="journey-list">{jornadas.map((jornada) => (
            <article className="journey" key={jornada.id}>
              <div className="date-block"><strong>{new Date(`${jornada.fecha}T00:00:00`).getDate()}</strong><span>{formatMonth(jornada.fecha)}</span></div>
              <div className="journey-info"><div className="journey-title"><h3>{jornada.nombre}</h3><span className={`status-badge ${jornada.activa ? 'active' : 'inactive'}`}>{jornada.activa ? 'Activa' : 'Inactiva'}</span></div><p>{jornada.sede} <span>·</span> {jornada.cupoDisponible} cupos libres</p><div className="journey-actions"><button className="action-button" disabled={!jornada.activa || !jornada.cupoDisponible || isPastDate(jornada.fecha)} onClick={() => setRegistering(jornada)}>{!jornada.activa ? 'Jornada inactiva' : isPastDate(jornada.fecha) ? 'Fecha cumplida' : jornada.cupoDisponible ? 'Inscribir persona' : 'Sin cupos'}</button><button className="action-button" onClick={() => setEditing(jornada)}>Editar</button><button className="action-button" onClick={() => showInscripciones(jornada)}>Ver inscritos</button></div></div>
              <div className="capacity"><div><span>Capacidad</span><strong>{jornada.cupoOcupado}/{jornada.cupoTotal}</strong></div><div className="bar"><i style={{ width: `${jornada.cupoTotal ? Math.min((jornada.cupoOcupado / jornada.cupoTotal) * 100, 100) : 0}%` }} /></div></div>
              {jornada.activa ? <button className="quiet-button" onClick={() => setPendingConfirmation({ type: 'jornada', jornada })}>Desactivar</button> : <button className="quiet-button activate-button" onClick={() => setPendingConfirmation({ type: 'activar', jornada })}>Activar</button>}
            </article>
          ))}</div>
        )}
      </section>

      <CreateJornadaModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
      {editing && <CreateJornadaModal open onClose={() => setEditing(null)} onSubmit={handleEdit} mode="edit" initialValue={{ nombre: editing.nombre, sede: editing.sede, fecha: editing.fecha, cupoTotal: String(editing.cupoTotal) }} />}
      {registering && <CreateInscripcionModal open jornadaNombre={registering.nombre} tiposDocumento={tiposDocumento} onClose={() => setRegistering(null)} onSubmit={handleRegister} />}
      {selectedRegistrations && <RegistrationsModal open jornadaNombre={selectedRegistrations.jornada.nombre} items={selectedRegistrations.items} onClose={() => setSelectedRegistrations(null)} onCancel={requestCancelInscripcion} />}
      <ConfirmModal
        open={Boolean(pendingConfirmation)}
        title={pendingConfirmation?.type === 'jornada' ? '¿Desactivar jornada?' : pendingConfirmation?.type === 'activar' ? '¿Activar jornada nuevamente?' : '¿Cancelar inscripción?'}
        description={pendingConfirmation?.type === 'jornada' ? 'La jornada dejará de estar disponible y no recibirá nuevas inscripciones.' : pendingConfirmation?.type === 'activar' ? 'La jornada volverá a estar disponible para nuevas inscripciones.' : 'La persona perderá su cupo en esta jornada. Esta acción se puede revisar desde el listado de inscritos.'}
        confirmLabel={pendingConfirmation?.type === 'jornada' ? 'Sí, desactivar' : pendingConfirmation?.type === 'activar' ? 'Sí, activar' : 'Sí, cancelar'}
        onCancel={() => setPendingConfirmation(null)}
        onConfirm={confirmPendingAction}
      />
    </main>
  );
}
