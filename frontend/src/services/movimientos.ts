import api from "./api";

export const getMovimientos = (params?: {
  empleado_id?: number;
  desde?: string;
  hasta?: string;
  cubrio_turno?: boolean;
  page?: number;
  limit?: number;
}) => api.get("/movimientos", { params });

export const getMovimiento = (id: number) => api.get(`/movimientos/${id}`);

export const createMovimiento = (data: {
  empleado_id: number;
  fecha: string;
  entregas: number;
  horas?: number;
  cubrio_turno?: boolean;
  rol_cubierto?: "CHOFER" | "CARGADOR" | null;
}) => api.post("/movimientos", data);

export const updateMovimiento = (
  id: number,
  data: Partial<{
    fecha: string;
    entregas: number;
    horas: number;
    cubrio_turno: boolean;
    rol_cubierto: "CHOFER" | "CARGADOR" | null;
  }>
) => api.put(`/movimientos/${id}`, data);

export const deleteMovimiento = (id: number) => api.delete(`/movimientos/${id}`);
