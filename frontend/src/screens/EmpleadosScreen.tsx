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
import { Trash2, Users, Plus, AlertCircle } from "lucide-react"
import { getTrabajadores, createTrabajador, deleteTrabajador } from "@/services/trabajadores"

interface Empleado {
  id: number
  numero: string
  nombre: string
  rol: "CHOFER" | "CARGADOR" | "AUXILIAR"
  tipo: "INTERNO" | "EXTERNO"
}

export default function EmpleadosScreen() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [form, setForm] = useState({
    numero: "",
    nombre: "",
    rol: "CHOFER" as const,
    tipo: "INTERNO" as const,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const cargar = async () => {
    try {
      setLoading(true)
      const res = await getTrabajadores()
      setEmpleados(res.data)
      setError("")
    } catch (err) {
      setError("Error al cargar empleados")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
  }

  const validateForm = () => {
    if (!form.numero.trim()) return "El número de empleado es requerido"
    if (!form.nombre.trim()) return "El nombre es requerido"
    if (empleados.some((emp) => emp.numero === form.numero.trim())) {
      return "Ya existe un empleado con este número"
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
      await createTrabajador({
        numero: form.numero.trim(),
        nombre: form.nombre.trim(),
        rol: form.rol,
        tipo: form.tipo,
      })
      setForm({ numero: "", nombre: "", rol: "CHOFER", tipo: "INTERNO" })
      setError("")
      await cargar()
    } catch (err) {
      setError("Error al crear empleado")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este empleado?")) return

    try {
      setLoading(true)
      await deleteTrabajador(id)
      await cargar()
    } catch (err) {
      setError("Error al eliminar empleado")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case "CHOFER":
        return "bg-blue-100 text-blue-800"
      case "CARGADOR":
        return "bg-green-100 text-green-800"
      case "AUXILIAR":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTipoBadgeColor = (tipo: string) => {
    return tipo === "INTERNO" ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Empleados</h1>
          <p className="text-muted-foreground">Administra los trabajadores de Rinku</p>
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
            Agregar Nuevo Empleado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Número de Empleado</Label>
              <Input
                id="numero"
                placeholder="Ej: EMP001"
                value={form.numero}
                onChange={(e) => handleChange("numero", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                placeholder="Nombre del empleado"
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select value={form.rol} onValueChange={(value) => handleChange("rol", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHOFER">Chofer</SelectItem>
                  <SelectItem value="CARGADOR">Cargador</SelectItem>
                  <SelectItem value="AUXILIAR">Auxiliar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={form.tipo} onValueChange={(value) => handleChange("tipo", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNO">Interno</SelectItem>
                  <SelectItem value="EXTERNO">Subcontratado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {loading ? "Agregando..." : "Agregar Empleado"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados ({empleados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Número</TableHead>
                  <TableHead className="font-semibold">Nombre</TableHead>
                  <TableHead className="font-semibold">Rol</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Bono/Hora</TableHead>
                  <TableHead className="font-semibold text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empleados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay empleados registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  empleados.map((emp) => (
                    <TableRow key={emp.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{emp.numero}</TableCell>
                      <TableCell>{emp.nombre}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(emp.rol)}>{emp.rol}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTipoBadgeColor(emp.tipo)}>{emp.tipo}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {emp.rol === "CHOFER" ? "$10.00" : emp.rol === "CARGADOR" ? "$5.00" : "$0.00"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(emp.id)}
                          disabled={loading}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Información de Roles</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Choferes</h4>
              <ul className="space-y-1">
                <li>• Bono: $10.00/hora</li>
                <li>• No pueden cubrir otros roles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cargadores</h4>
              <ul className="space-y-1">
                <li>• Bono: $5.00/hora</li>
                <li>• No pueden cubrir otros roles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Auxiliares</h4>
              <ul className="space-y-1">
                <li>• Sin bono base</li>
                <li>• Pueden cubrir cualquier rol</li>
                <li>• Reciben bono del rol cubierto</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
