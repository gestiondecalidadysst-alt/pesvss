// Componentes de interfaz reutilizables, con el tema aprobado.
import type { ReactNode } from 'react';
import type { EstadoRequisito } from '../types';
import { ESTADO_META } from '../lib/dominios';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-card p-5 ${className}`}>{children}</div>
  );
}

export function MetricCard({ label, value, danger = false }: { label: string; value: ReactNode; danger?: boolean }) {
  return (
    <div className="bg-slate-100 rounded-lg p-4">
      <p className="text-sm text-slate-500 m-0">{label}</p>
      <p className={`text-2xl font-medium mt-1 mb-0 ${danger ? 'text-estado-vencido' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

export function StatusPill({ estado }: { estado: EstadoRequisito }) {
  const m = ESTADO_META[estado];
  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const base = 'text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50';
  const styles =
    variant === 'primary'
      ? 'bg-brand text-white hover:bg-brand-dark'
      : 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50';
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

// Barra de progreso simple (teal).
export function Progress({ pct }: { pct: number }) {
  const color = pct >= 90 ? '#15803D' : pct >= 50 ? '#B45309' : '#0F766E';
  return (
    <div className="h-1.5 rounded bg-slate-100 overflow-hidden">
      <div className="h-full" style={{ width: `${Math.min(100, Math.round(pct))}%`, background: color }} />
    </div>
  );
}
