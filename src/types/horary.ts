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

export type Inscripcion = { id: string; jornadaId: string; nombreCompleto: string; tipoDocumento: string; numeroDocumento: string; correo: string; estado: string };
export type InscripcionForm = { nombreCompleto: string; tipoDocumento: string; numeroDocumento: string; correo: string };
export type TipoDocumento = { codigo: string; nombre: string; categoria: string };
