import api from "./api";

// Obtener todos los trabajadores
export const getTrabajadores = () => api.get("/trabajadores");

// Obtener un trabajador por ID
export const createTrabajador = (data: any) => api.post("/trabajadores", data);

// Actualizar un trabajador
export const updateTrabajador = (id: number, data: any) => api.put(`/trabajadores/${id}`, data);

// Eliminar un trabajador
export const deleteTrabajador = (id: number) => api.delete(`/trabajadores/${id}`);
