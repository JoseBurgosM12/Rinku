import api from "./api";

// Generar la nómina para un período específico
export const createNomina = (periodo: string) =>
  api.post(`/nomina?periodo=${periodo}`);

// Obtener una nómina por ID
export const getNomina = (id: number) => api.get(`/nomina/${id}`);

// Listar todas las nóminas
export const getNominas = () =>
  api.get(`/nomina`);

// Cerrar una nómina (hacerla inmutable)
export const closeNomina = (id: number) =>
  api.patch(`/nomina/${id}/cerrar`);
