'use client';

import { useEffect, useState } from 'react';
import { CreateInscripcionModal } from '@/components/CreateInscripcionModal';
import { CreateJornadaModal } from '@/components/CreateJornadaModal';
import { cancelInscripcion, createInscripcion, createJornada, deactivateJornada, getDashboardData, listInscripciones, updateJornada } from '@/services/horary-api';
import type { Inscripcion, InscripcionForm, Jornada, JornadaForm, Metricas } from '@/types/horary';

function formatMonth(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('es-CO', { month: 'short' }).replace('.', '').toUpperCase();
}

export default function Home() {
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Jornada | null>(null);
  const [registering, setRegistering] = useState<Jornada | null>(null);
  const [inscripciones, setInscripciones] = useState<Record<string, Inscripcion[]>>({});
  const [message, setMessage] = useState('');

  async function loadData() {
    setLoading(true);
    try {
      const [jornadasData, metricasData] = await getDashboardData();
      setJornadas(jornadasData);
      setMetricas(metricasData);
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo conectar con la API');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

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

  async function handleEdit(form: JornadaForm) {
    if (!editing) return;
    try { await updateJornada(editing.id, form); setEditing(null); setMessage('Jornada actualizada correctamente.'); await loadData(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo actualizar la jornada'); }
  }

  async function handleRegister(form: InscripcionForm) {
    if (!registering) return;
    try { await createInscripcion(registering.id, form); setRegistering(null); setMessage('Inscripción confirmada.'); await loadData(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo registrar la inscripción'); }
  }

  async function showInscripciones(jornada: Jornada) {
    try { setInscripciones({ ...inscripciones, [jornada.id]: await listInscripciones(jornada.id) }); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudieron cargar las inscripciones'); }
  }

  async function handleCancelInscripcion(id: string, jornadaId: string) {
    try { await cancelInscripcion(id); await showInscripciones(jornadas.find((item) => item.id === jornadaId)!); await loadData(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo cancelar la inscripción'); }
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
        <div className="section-heading"><div><p className="eyebrow">Programación activa</p><h2>Jornadas disponibles</h2></div><button className="refresh" onClick={loadData}>Actualizar</button></div>
        {message && <p className="notice" role="status">{message}</p>}
        {loading ? <p className="empty">Cargando jornadas...</p> : jornadas.length === 0 ? <p className="empty">No hay jornadas activas con cupos disponibles.</p> : (
          <div className="journey-list">{jornadas.map((jornada) => (
            <article className="journey" key={jornada.id}>
              <div className="date-block"><strong>{new Date(`${jornada.fecha}T00:00:00`).getDate()}</strong><span>{formatMonth(jornada.fecha)}</span></div>
              <div className="journey-info"><h3>{jornada.nombre}</h3><p>{jornada.sede} <span>·</span> {jornada.cupoDisponible} cupos libres</p><div className="journey-actions"><button className="action-button" disabled={!jornada.cupoDisponible} onClick={() => setRegistering(jornada)}>Inscribir persona</button><button className="action-button" onClick={() => setEditing(jornada)}>Editar</button><button className="action-button" onClick={() => showInscripciones(jornada)}>Ver inscritos</button></div></div>
              <div className="capacity"><div><span>Capacidad</span><strong>{jornada.cupoOcupado}/{jornada.cupoTotal}</strong></div><div className="bar"><i style={{ width: `${jornada.cupoTotal ? Math.min((jornada.cupoOcupado / jornada.cupoTotal) * 100, 100) : 0}%` }} /></div></div>
              <button className="quiet-button" onClick={() => handleDeactivate(jornada.id)}>Desactivar</button>
            </article>
          ))}</div>
        )}
      </section>

      <CreateJornadaModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
      {editing && <CreateJornadaModal open onClose={() => setEditing(null)} onSubmit={handleEdit} mode="edit" initialValue={{ nombre: editing.nombre, sede: editing.sede, fecha: editing.fecha, cupoTotal: String(editing.cupoTotal) }} />}
      {registering && <CreateInscripcionModal open jornadaNombre={registering.nombre} onClose={() => setRegistering(null)} onSubmit={handleRegister} />}
      {Object.entries(inscripciones).map(([jornadaId, items]) => <section className="registrations" key={jornadaId}><div className="section-heading"><h2>Personas inscritas</h2><button className="refresh" onClick={() => setInscripciones({ ...inscripciones, [jornadaId]: [] })}>Cerrar</button></div>{items.length === 0 ? <p className="empty">No hay inscripciones confirmadas.</p> : items.map((item) => <div className="registration" key={item.id}><span>{item.nombreCompleto}</span><small>{item.correo} · {item.numeroDocumento}</small><button className="quiet-button" onClick={() => handleCancelInscripcion(item.id, jornadaId)}>Cancelar</button></div>)}</section>)}
    </main>
  );
}
