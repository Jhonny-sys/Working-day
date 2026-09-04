'use client';

import { ChangeEvent } from 'react';

type Props = { value: string; onChange: (value: string) => void; required?: boolean };

export function DateField({ value, onChange, required = false }: Props) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return (
    <div className="date-field">
      <span className="calendar-icon" aria-hidden="true">▣</span>
      <input aria-label="Fecha de la jornada" required={required} type="date" value={value} onChange={handleChange} />
      <small>{value ? new Date(`${value}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Selecciona una fecha'}</small>
    </div>
  );
}
