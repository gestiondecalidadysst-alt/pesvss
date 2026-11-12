// Agrupación de los 24 pasos en los 6 dominios de trabajo (la navegación
// de la app se organiza por dominios, no por número de paso).

import type { EstadoRequisito, NivelPesv } from '../types';

export interface Dominio {
  id: string;
  nombre: string;
  icono: string; // nombre de icono (línea)
  pasos: number[];
}

export const DOMINIOS: Dominio[] = [
  { id: 'gobierno', nombre: 'Gobierno y liderazgo', icono: 'crown', pasos: [1, 2, 3, 4, 7] },
  { id: 'riesgo', nombre: 'Riesgo', icono: 'alert', pasos: [5, 6, 8] },
  { id: 'personas', nombre: 'Personas y competencias', icono: 'users', pasos: [9, 10, 11] },
  { id: 'flota', nombre: 'Flota y operación', icono: 'truck', pasos: [14, 15, 16, 17] },
  { id: 'respuesta', nombre: 'Respuesta y eventos', icono: 'urgent', pasos: [12, 13, 18] },
  { id: 'desempeno', nombre: 'Desempeño y auditoría', icono: 'chart', pasos: [19, 20, 21, 22, 23, 24] },
];

// Metadatos de cada estado: etiqueta y color (semáforo).
export const ESTADO_META: Record<EstadoRequisito, { label: string; color: string; bg: string }> = {
  CUMPLE: { label: 'Cumple', color: '#15803D', bg: '#DCFCE7' },
  EN_PROGRESO: { label: 'En progreso', color: '#B45309', bg: '#FEF3C7' },
  VENCIDO: { label: 'Vencido', color: '#B91C1C', bg: '#FEE2E2' },
  PENDIENTE: { label: 'Pendiente', color: '#64748B', bg: '#F1F5F9' },
  NO_APLICA: { label: 'No aplica', color: '#94A3B8', bg: '#F8FAFC' },
};

export const NIVEL_LABEL: Record<NivelPesv, string> = {
  BASICO: 'Básico',
  ESTANDAR: 'Estándar',
  AVANZADO: 'Avanzado',
};
