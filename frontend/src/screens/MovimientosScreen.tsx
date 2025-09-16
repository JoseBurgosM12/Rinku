"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Activity, Plus, AlertCircle, Clock, Package, UserCheck } from "lucide-react"
import { getMovimientos, createMovimiento } from "@/services/movimientos"
import { getTrabajadores } from "@/services/trabajadores"

interface Empleado {
  id: number
  numero: string
  nombre: string
  rol: "CHOFER" | "CARGADOR" | "AUXILIAR"
  tipo: "INTERNO" | "EXTERNO"
}

interface Movimiento {
  id: number
  empleado_id: number
  fecha: string
  entregas: number
  horas: number
  cubrio_turno: boolean
  rol_cubierto: string | null
}

export default function MovimientosScreen() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [form, setForm] = useState({
    empleado_id: "",
    fecha: new Date().toISOString().split("T")[0],
    entregas: 0,
    horas: 8,
    cubrio_turno: false,
    rol_cubierto: null as null | "CHOFER" | "CARGADOR",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const cargar = async () => {
    try {
      setLoading(true)
      const [movRes, empRes] = await Promise.all([getMovimientos(), getTrabajadores()])
      setMovimientos(movRes.data.data || movRes.data)
      setEmpleados(empRes.data)
      setError("")
    } catch (err) {
      setError("Error al cargar datos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value })
  }

  const validateForm = () => {
    if (!form.empleado_id) return "Debe seleccionar un empleado"
    if (!form.fecha) return "La fecha es requerida"
    if (form.horas < 0 || form.horas > 24) return "Las horas deben estar entre 0 y 24"
    if (form.entregas < 0) return "Las entregas no pueden ser negativas"

    const empleado = empleados.find((e) => e.id === Number(form.empleado_id))
    if (!empleado) return "Empleado no encontrado"

    if (form.cubrio_turno && empleado.rol !== "AUXILIAR") {
      return "Solo los empleados auxiliares pueden cubrir turnos de otros roles"
    }

    if (form.cubrio_turno && !form.rol_cubierto) {
      return "Debe especificar qué rol cubrió"
    }

    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      await createMovimiento({
        empleado_id: Number(form.empleado_id),
        fecha: form.fecha,
        entregas: Number(form.entregas),
        horas: Number(form.horas),
        cubrio_turno: form.cubrio_turno,
        rol_cubierto: form.cubrio_turno ? form.rol_cubierto : null,
      })

      setForm({
        empleado_id: "",
        fecha: new Date().toISOString().split("T")[0],
        entregas: 0,
        horas: 8,
        cubrio_turno: false,
        rol_cubierto: null,
      })
      setError("")
      await cargar()
    } catch (err) {
      setError("Error al registrar movimiento")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getEmpleadoNombre = (empleadoId: number) => {
    const empleado = empleados.find((e) => e.id === empleadoId)
    return empleado ? `${empleado.nombre} (${empleado.numero})` : "Empleado no encontrado"
  }

  const getEmpleadoRol = (empleadoId: number) => {
    const empleado = empleados.find((e) => e.id === empleadoId)
    return empleado?.rol || "N/A"
  }

  const selectedEmpleado = empleados.find((e) => e.id === Number(form.empleado_id))
  const canCoverShift = selectedEmpleado?.rol === "AUXILIAR"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Registro de Movimientos</h1>
          <p className="text-muted-foreground">Registra las actividades diarias de los empleados</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Registrar Nuevo Movimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="empleado">Empleado</Label>
              <Select value={form.empleado_id} onValueChange={(value) => handleChange("empleado_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione empleado" />
                </SelectTrigger>
                <SelectContent>
                  {empleados.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.nombre} ({emp.numero}) - {emp.rol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={form.fecha}
                onChange={(e) => handleChange("fecha", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horas Trabajadas
              </Label>
              <Input
                id="horas"
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={form.horas}
                onChange={(e) => handleChange("horas", Number(e.target.value))}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entregas" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Entregas Realizadas
              </Label>
              <Input
                id="entregas"
                type="number"
                min="0"
                value={form.entregas}
                onChange={(e) => handleChange("entregas", Number(e.target.value))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="cubrio_turno"
                checked={form.cubrio_turno}
                onCheckedChange={(checked) => {
                  handleChange("cubrio_turno", checked)
                  if (!checked) handleChange("rol_cubierto", null)
                }}
                disabled={loading || !canCoverShift}
              />
              <Label htmlFor="cubrio_turno" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Cubrió turno de otro empleado
              </Label>
            </div>

            {!canCoverShift && selectedEmpleado && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Solo los empleados con rol <strong>AUXILIAR</strong> pueden cubrir turnos. El empleado seleccionado
                  tiene rol <strong>{selectedEmpleado.rol}</strong>.
                </AlertDescription>
              </Alert>
            )}

            {form.cubrio_turno && canCoverShift && (
              <div className="space-y-2">
                <Label htmlFor="rol_cubierto">Rol que cubrió</Label>
                <Select
                  value={form.rol_cubierto || ""}
                  onValueChange={(value) => handleChange("rol_cubierto", value as "CHOFER" | "CARGADOR")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el rol cubierto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHOFER">Chofer (+$10.00/hora)</SelectItem>
                    <SelectItem value="CARGADOR">Cargador (+$5.00/hora)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {loading ? "Registrando..." : "Registrar Movimiento"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos ({movimientos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Empleado</TableHead>
                  <TableHead className="font-semibold">Rol Base</TableHead>
                  <TableHead className="font-semibold">Fecha</TableHead>
                  <TableHead className="font-semibold">Horas</TableHead>
                  <TableHead className="font-semibold">Entregas</TableHead>
                  <TableHead className="font-semibold">Cubrió Turno</TableHead>
                  <TableHead className="font-semibold">Rol Cubierto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No hay movimientos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  movimientos.map((mov) => (
                    <TableRow key={mov.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{getEmpleadoNombre(mov.empleado_id)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getEmpleadoRol(mov.empleado_id)}</Badge>
                      </TableCell>
                      <TableCell>{new Date(mov.fecha).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {mov.horas}h
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {mov.entregas}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={mov.cubrio_turno ? "default" : "secondary"}>
                          {mov.cubrio_turno ? "Sí" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {mov.rol_cubierto ? (
                          <Badge className="bg-green-100 text-green-800">{mov.rol_cubierto}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-800">Reglas de Cobertura de Turnos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-700">
          <div className="space-y-2">
            <p>
              <strong>Solo los empleados AUXILIARES pueden cubrir turnos de otros roles.</strong>
            </p>
            <p>• Al cubrir como CHOFER: reciben $10.00 adicional por hora</p>
            <p>• Al cubrir como CARGADOR: reciben $5.00 adicional por hora</p>
            <p>• Los CHOFERES y CARGADORES no pueden cubrir otros roles</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
