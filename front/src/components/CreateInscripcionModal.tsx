'use client';

import { FormEvent, useState } from 'react';
import type { InscripcionForm, TipoDocumento } from '@/types/horary';

type Props = { open: boolean; jornadaNombre: string; tiposDocumento: TipoDocumento[]; onClose: () => void; onSubmit: (form: InscripcionForm) => Promise<void> };
const initialForm: InscripcionForm = { nombreCompleto: '', tipoDocumento: '', numeroDocumento: '', correo: '' };

export function CreateInscripcionModal({ open, jornadaNombre, tiposDocumento, onClose, onSubmit }: Props) {
  const [form, setForm] = useState(initialForm);
  if (!open) return null;
  function close() { setForm(initialForm); onClose(); }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); await onSubmit(form); setForm(initialForm); }
  return <div className="modal-layer"><section className="modal modal-card" role="dialog" aria-modal="true" aria-labelledby="inscripcion-title">
    <div className="modal-header"><div><p className="eyebrow">Cupos disponibles</p><h2 id="inscripcion-title">Registrar persona</h2></div><button className="icon-button" type="button" onClick={close} aria-label="Cerrar ventana">×</button></div>
    <p className="modal-description">Inscripción para <strong>{jornadaNombre}</strong>.</p>
    <form onSubmit={submit} className="modal-form">
      <label>Nombre completo<input required maxLength={100} value={form.nombreCompleto} onChange={(event) => setForm({ ...form, nombreCompleto: event.target.value })} /></label>
      <div className="form-row"><label>Tipo de documento<select required value={form.tipoDocumento} onChange={(event) => setForm({ ...form, tipoDocumento: event.target.value })}><option value="">Selecciona una opción</option>{tiposDocumento.map((tipo) => <option key={tipo.codigo} value={tipo.codigo}>{tipo.codigo}</option>)}</select></label><label>Número de documento<input required maxLength={100} inputMode="numeric" pattern="[0-9]+" type="text" value={form.numeroDocumento} onChange={(event) => setForm({ ...form, numeroDocumento: event.target.value.replace(/\D/g, '') })} /></label></div>
      <label>Correo electrónico<input required maxLength={100} type="email" value={form.correo} onChange={(event) => setForm({ ...form, correo: event.target.value })} /></label>
      <div className="modal-actions"><button className="secondary-button" type="button" onClick={close}>Cancelar</button><button className="primary-button" type="submit">Confirmar inscripción</button></div>
    </form>
  </section></div>;
}