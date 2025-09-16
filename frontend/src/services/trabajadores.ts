import api from "./api";

export const getTrabajadores = () => api.get("/trabajadores");
export const createTrabajador = (data: any) => api.post("/trabajadores", data);
export const updateTrabajador = (id: number, data: any) => api.put(`/trabajadores/${id}`, data);
export const deleteTrabajador = (id: number) => api.delete(`/trabajadores/${id}`);
