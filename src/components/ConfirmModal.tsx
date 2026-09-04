'use client';

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({ open, title, description, confirmLabel, onCancel, onConfirm }: Props) {
  if (!open) return null;

  return (
    <div className="modal-layer" role="presentation">
      <section className="modal modal-card confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description">
        <div className="confirm-icon" aria-hidden="true">!</div>
        <div className="modal-header">
          <div><p className="eyebrow">Confirmar acción</p><h2 id="confirm-title">{title}</h2></div>
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Cerrar ventana">×</button>
        </div>
        <p className="modal-description" id="confirm-description">{description}</p>
        <div className="modal-actions"><button className="secondary-button" type="button" onClick={onCancel}>Volver</button><button className="danger-button" type="button" onClick={onConfirm}>{confirmLabel}</button></div>
      </section>
    </div>
  );
}
