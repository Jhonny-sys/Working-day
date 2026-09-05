'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Props = { value: string; onChange: (value: string) => void; required?: boolean };
const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function toKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function fromKey(value: string) { const [year, month, day] = value.split('-').map(Number); return new Date(year, month - 1, day); }

export function DateField({ value, onChange, required = false }: Props) {
  const today = new Date();
  const selected = value ? fromKey(value) : today;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: MouseEvent) { if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const days = useMemo(() => {
    const firstDay = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7;
    const totalDays = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    return [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, index) => index + 1)];
  }, [view]);

  function selectDay(day: number) { onChange(toKey(new Date(view.getFullYear(), view.getMonth(), day))); setOpen(false); }
  function changeMonth(offset: number) { setView(new Date(view.getFullYear(), view.getMonth() + offset, 1)); }

  return <div className="date-picker" ref={wrapperRef}>
    <button type="button" className="date-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
      <span className="calendar-icon" aria-hidden="true">▣</span><span>{value ? selected.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Selecciona una fecha'}</span><i className={`dropdown-chevron ${open ? 'up' : ''}`} />
    </button>
    {required && <input className="date-required" tabIndex={-1} required={!value} value={value} onChange={() => undefined} aria-label="Fecha" />}
    {open && <div className="calendar-popover" role="dialog" aria-label="Calendario">
      <div className="calendar-header"><button type="button" className="chevron-button previous" onClick={() => changeMonth(-1)} aria-label="Mes anterior"><i /></button><strong>{monthNames[view.getMonth()]} de {view.getFullYear()}</strong><button type="button" className="chevron-button next" onClick={() => changeMonth(1)} aria-label="Mes siguiente"><i /></button></div>
      <div className="calendar-week">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">{days.map((day, index) => day ? <button type="button" key={`${day}-${index}`} className={value === toKey(new Date(view.getFullYear(), view.getMonth(), day)) ? 'selected-day' : ''} onClick={() => selectDay(day)}>{day}</button> : <span key={`empty-${index}`} />)}</div>
      <button type="button" className="calendar-today" onClick={() => { onChange(toKey(today)); setView(new Date(today.getFullYear(), today.getMonth(), 1)); setOpen(false); }}>Hoy</button>
    </div>}
    <small>{value ? selected.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Elige el día de la jornada'}</small>
  </div>;
}
