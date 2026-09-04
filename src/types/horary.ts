export type Jornada = {
  id: string;
  nombre: string;
  sede: string;
  fecha: string;
  cupoTotal: number;
  cupoOcupado: number;
  cupoDisponible: number;
  activa: boolean;
};

export type Metricas = {
  totalJornadasActivas: number;
  totalInscripcionesConfirmadas: number;
  porcentajeOcupacionGlobal: number;
};

export type JornadaForm = {
  nombre: string;
  sede: string;
  fecha: string;
  cupoTotal: string;
};
