import api from "./api"

export interface ParametrosNomina {
  id: number
  vigente_desde: string
  base_por_hora: number
  bono_hora_chofer: number
  bono_hora_cargador: number
  bono_hora_auxiliar: number
  pago_por_entrega: number
  isr_base: number
  isr_extra_umbral_bruto: number
  isr_extra_adicional: number
  vales_pct: number
  activo: boolean
}

// Obtener todos los parámetros
export const getParametros = async () => {
  const res = await api.get<ParametrosNomina[]>("/parametros")
  return res.data
}

// Obtener el activo
export const getParametrosNomina = async () => {
  const res = await api.get<ParametrosNomina>("/parametros/activo")
  return res.data
}

// Crear uno nuevo (se desactiva el anterior)
export const createParametrosNomina = async (payload: Omit<ParametrosNomina, "id" | "activo">) => {
  const res = await api.post<ParametrosNomina>("/parametros", payload)
  return res.data
}

// Desactivar manualmente
export const deactivateParametrosNomina = async (id: number) => {
  const res = await api.put(`/parametros/${id}/desactivar`)
  return res.data
}
