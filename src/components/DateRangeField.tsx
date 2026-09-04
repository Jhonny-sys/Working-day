'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Props = { from: string; to: string; onApply: (from: string, to: string) => void };
const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const pad = (value: number) => String(value).padStart(2, '0');
const keyOf = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const parseDate = (value: string) => { const [year, month, day] = value.split('-').map(Number); return new Date(year, month - 1, day); };
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export function DateRangeField({ from, to, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const [cursor, setCursor] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selecting, setSelecting] = useState<'from' | 'to'>('from');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: MouseEvent) { if (!ref.current?.contains(event.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  function openPicker() {
    setDraftFrom(from); setDraftTo(to); setSelecting(from ? 'to' : 'from');
    if (from) { const date = parseDate(from); setCursor(new Date(date.getFullYear(), date.getMonth(), 1)); }
    setOpen(true);
  }

  function chooseDay(day: number) {
    const value = keyOf(new Date(cursor.getFullYear(), cursor.getMonth(), day));
    if (selecting === 'from' || (draftTo && value > draftTo)) { setDraftFrom(value); setDraftTo(''); setSelecting('to'); }
    else { setDraftTo(value); setSelecting('from'); }
  }

  function preset(days: number) {
    const end = startOfDay(new Date()); const start = new Date(end); start.setDate(end.getDate() - days + 1);
    setDraftFrom(keyOf(start)); setDraftTo(keyOf(end)); setSelecting('from');
  }

  const calendarDays = useMemo(() => {
    const first = (new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay() + 6) % 7;
    const total = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: total }, (_, index) => index + 1)];
  }, [cursor]);

  const label = from || to ? `${from || 'Desde'}${to ? ` - ${to}` : ''}` : 'Selecciona un rango';

  return <div className="range-picker" ref={ref}>
    <button type="button" className="range-trigger" onClick={openPicker} aria-expanded={open}><span className="calendar-icon">▣</span><span>{label}</span><span className="date-chevron">⌄</span></button>
    {open && <div className="range-popover" role="dialog" aria-label="Selector de rango de fechas">
      <div className="range-inputs"><button type="button" className={selecting === 'from' ? 'range-input selected' : 'range-input'} onClick={() => setSelecting('from')}><small>Desde</small><strong>{draftFrom || 'dd/mm/aaaa'}</strong></button><button type="button" className={selecting === 'to' ? 'range-input selected' : 'range-input'} onClick={() => setSelecting('to')}><small>Hasta</small><strong>{draftTo || 'dd/mm/aaaa'}</strong></button></div>
      <div className="range-body"><div className="range-calendar"><div className="calendar-header"><button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>‹</button><strong>{months[cursor.getMonth()]} de {cursor.getFullYear()}</strong><button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>›</button></div><div className="calendar-week">{weekDays.map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{calendarDays.map((day, index) => { const value = day ? keyOf(new Date(cursor.getFullYear(), cursor.getMonth(), day)) : ''; const inRange = value && draftFrom && draftTo && value >= draftFrom && value <= draftTo; return day ? <button type="button" key={index} className={`${value === draftFrom || value === draftTo ? 'selected-day' : ''} ${inRange ? 'in-range' : ''}`} onClick={() => chooseDay(day)}>{day}</button> : <span key={index} />; })}</div></div><aside className="range-presets"><strong>Periodos rápidos</strong><button type="button" onClick={() => preset(1)}>Hoy</button><button type="button" onClick={() => preset(7)}>Últimos 7 días</button><button type="button" onClick={() => preset(14)}>Últimos 14 días</button><button type="button" onClick={() => preset(30)}>Últimos 30 días</button></aside></div>
      <div className="range-actions"><button type="button" className="secondary-button" onClick={() => { setDraftFrom(''); setDraftTo(''); onApply('', ''); setOpen(false); }}>Limpiar</button><button type="button" className="primary-button" disabled={!draftFrom || !draftTo} onClick={() => { onApply(draftFrom, draftTo); setOpen(false); }}>Aplicar</button></div>
    </div>}
  </div>;
}
