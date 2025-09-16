import api from "./api";

export const generarNomina = (periodo: string) =>
  api.post(`/nomina?periodo=${periodo}`);

export const obtenerNomina = (id: number) => api.get(`/nomina/${id}`);
