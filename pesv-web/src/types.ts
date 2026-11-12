// Tipos compartidos con la API (pesv-api). En una versión posterior
// pueden extraerse a un paquete común para no duplicarlos.

export type NivelPesv = 'BASICO' | 'ESTANDAR' | 'AVANZADO';
export type Misionalidad = 'TRANSPORTE' | 'OTRA';
export type EstadoRequisito =
  | 'NO_APLICA'
  | 'PENDIENTE'
  | 'EN_PROGRESO'
  | 'CUMPLE'
  | 'VENCIDO';

export interface Organizacion {
  id: string;
  nombre: string;
  misionalidad: Misionalidad;
  numVehiculos: number;
  numConductores: number;
  nivelCalculado: NivelPesv;
  nivelManual: NivelPesv | null;
}

// estados: mapa paso -> estado
export type Estados = Record<number, EstadoRequisito>;

export interface RespuestaOrg {
  organizacion: Organizacion;
  nivel: NivelPesv;
  estados: Estados;
}

export interface Resumen {
  nivel: NivelPesv;
  porcentaje: number;
  estados: Estados;
}

export interface Requisito {
  paso: number;
  nombre: string;
  nivelMinimo: NivelPesv;
  entradas: { origenPaso: number; tipoDato: string }[];
  salidas: { destinoPaso: number; tipoDato: string }[];
}
