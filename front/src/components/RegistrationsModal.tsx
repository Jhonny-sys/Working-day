'use client';

import type { Inscripcion } from '@/types/horary';

type Props = {
  open: boolean;
  jornadaNombre: string;
  items: Inscripcion[];
  onClose: () => void;
  onCancel: (id: string) => void;
};

export function RegistrationsModal({ open, jornadaNombre, items, onClose, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className="modal-layer">
      <section className="modal registrations-modal" role="dialog" aria-modal="true" aria-labelledby="registrations-title">
        <div className="modal-header">
          <div><p className="eyebrow">Control de cupos</p><h2 id="registrations-title">Personas inscritas</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar ventana">×</button>
        </div>
        <p className="modal-description">Inscripciones confirmadas para <strong>{jornadaNombre}</strong>.</p>
        <div className="registrations-summary"><strong>{items.length}</strong><span>{items.length === 1 ? 'persona confirmada' : 'personas confirmadas'}</span></div>
        {items.length === 0 ? <p className="empty modal-empty">No hay inscripciones confirmadas.</p> : <div className="registration-list">{items.map((item) => <div className="registration" key={item.id}><div><strong>{item.nombreCompleto}</strong><small>{item.tipoDocumento} {item.numeroDocumento} · {item.correo}</small></div><button className="quiet-button" onClick={() => onCancel(item.id)}>Cancelar</button></div>)}</div>}
        <div className="modal-actions"><button className="secondary-button" type="button" onClick={onClose}>Cerrar</button></div>
      </section>
    </div>
  );
}
