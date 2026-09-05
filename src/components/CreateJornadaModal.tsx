'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import type { JornadaForm } from '@/types/horary';
import { DateField } from './DateField';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: JornadaForm) => Promise<void>;
  initialValue?: JornadaForm;
  mode?: 'create' | 'edit';
  minCupo?: number;
};

const initialForm: JornadaForm = { nombre: '', sede: '', fecha: '', cupoTotal: '20' };

export function CreateJornadaModal({ open, onClose, onSubmit, initialValue = initialForm, mode = 'create', minCupo = 0 }: Props) {
  const [form, setForm] = useState(initialValue);
  const [submitError, setSubmitError] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function closeModal() {
    setForm(initialValue);
    setSubmitError('');
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError('');
    try {
      await onSubmit(form);
      setForm(initialValue);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo guardar la jornada');
    }
  }

  return (
    <dialog ref={dialogRef} className="modal" onCancel={closeModal}>
      <div className="modal-header">
        <div><p className="eyebrow">Programación</p><h2>{mode === 'edit' ? 'Editar jornada' : 'Nueva jornada'}</h2></div>
        <button className="icon-button" type="button" onClick={closeModal} aria-label="Cerrar ventana">×</button>
      </div>
      <p className="modal-description">Define la fecha, sede y capacidad. El cupo podrá controlarse desde el panel.</p>
      {submitError && <p className="modal-error modal-error-top" role="alert"><strong>No se pudo guardar la jornada</strong><span>{submitError}</span></p>}
      <form onSubmit={handleSubmit} className="modal-form">
        <label>Nombre<input required maxLength={100} value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} placeholder="Ej. Jornada de vacunación" /></label>
        <label>Sede<input required maxLength={100} value={form.sede} onChange={(event) => setForm({ ...form, sede: event.target.value })} placeholder="Ej. Centro Norte" /></label>
        <div className="form-row"><label>Fecha<DateField required value={form.fecha} onChange={(fecha) => setForm({ ...form, fecha })} /></label><label>Cupos<input required min={minCupo} type="number" value={form.cupoTotal} onChange={(event) => setForm({ ...form, cupoTotal: event.target.value })} />{mode === 'edit' && minCupo > 0 && <small className="field-hint">Mínimo: {minCupo} cupos ocupados</small>}</label></div>
        <div className="modal-actions"><button className="secondary-button" type="button" onClick={closeModal}>Cancelar</button><button className="primary-button" type="submit">{mode === 'edit' ? 'Guardar cambios' : 'Crear jornada'}</button></div>
      </form>
    </dialog>
  );
}
