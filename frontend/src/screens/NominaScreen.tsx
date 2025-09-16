"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, RefreshCw, AlertCircle, DollarSign, FileText, TrendingUp } from "lucide-react"
import { generarNomina, obtenerNomina } from "@/services/nomina"

interface DetalleNomina {
  id: number
  empleado_id: number
  empleado_nombre?: string
  empleado_numero?: string
  empleado_tipo?: string
  dias_trabajados: number
  horas_totales: number
  entregas_totales: number
  base: number
  bono: number
  pago_entregas: number
  bruto: number
  vales: number
  isr: number
  neto: number
}

interface ResumenNomina {
  total_empleados: number
  total_bruto: number
  total_deducciones: number
  total_neto: number
  total_vales: number
}

export default function NominaScreen() {
  const [periodo, setPeriodo] = useState("2025-01")
  const [detalles, setDetalles] = useState<DetalleNomina[]>([])
  const [nominaId, setNominaId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGenerar = async () => {
    if (!periodo) {
      setError("Debe especificar un período")
      return
    }

    try {
      setLoading(true)
      setError("")
      const res = await generarNomina(periodo)
      setDetalles(res.data.detalles || [])
      setNominaId(res.data.nomina?.id || null)
    } catch (err: any) {
      setError(err.response?.data?.message || "Error generando nómina")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleObtener = async () => {
    if (!nominaId) return

    try {
      setLoading(true)
      const res = await obtenerNomina(nominaId)
      setDetalles(res.data.detalles || [])
    } catch (err: any) {
      setError("Error al obtener nómina")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const calcularResumen = (): ResumenNomina => {
    return detalles.reduce(
      (acc, detalle) => ({
        total_empleados: acc.total_empleados + 1,
        total_bruto: acc.total_bruto + (detalle.bruto || 0),
        total_deducciones: acc.total_deducciones + (detalle.isr || 0),
        total_neto: acc.total_neto + (detalle.neto || 0),
        total_vales: acc.total_vales + (detalle.vales || 0),
      }),
      {
        total_empleados: 0,
        total_bruto: 0,
        total_deducciones: 0,
        total_neto: 0,
        total_vales: 0,
      },
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  const getISRRate = (bruto: number) => {
    const baseRate = 9
    const additionalRate = bruto > 16000 ? 3 : 0
    return baseRate + additionalRate
  }

  const resumen = calcularResumen()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cálculo de Nómina</h1>
          <p className="text-muted-foreground">Genera y consulta los cálculos de nómina mensual</p>
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
            <FileText className="h-5 w-5" />
            Generar Nómina
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="periodo">Período (YYYY-MM)</Label>
              <Input
                id="periodo"
                placeholder="Ej: 2025-01"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGenerar} disabled={loading} className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                {loading ? "Generando..." : "Generar Nómina"}
              </Button>
              <Button
                variant="outline"
                onClick={handleObtener}
                disabled={!nominaId || loading}
                className="flex items-center gap-2 bg-transparent"
              >
                <RefreshCw className="h-4 w-4" />
                Refrescar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {detalles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Empleados</p>
                  <p className="text-2xl font-bold">{resumen.total_empleados}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Bruto</p>
                  <p className="text-2xl font-bold">{formatCurrency(resumen.total_bruto)}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Deducciones</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(resumen.total_deducciones)}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Neto</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(resumen.total_neto)}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calculator className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {detalles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Nómina - {periodo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Empleado</TableHead>
                    <TableHead className="font-semibold">Tipo</TableHead>
                    <TableHead className="font-semibold text-center">Días</TableHead>
                    <TableHead className="font-semibold text-center">Horas</TableHead>
                    <TableHead className="font-semibold text-center">Entregas</TableHead>
                    <TableHead className="font-semibold text-right">Sueldo Base</TableHead>
                    <TableHead className="font-semibold text-right">Bonos</TableHead>
                    <TableHead className="font-semibold text-right">Entregas</TableHead>
                    <TableHead className="font-semibold text-right">Bruto</TableHead>
                    <TableHead className="font-semibold text-right">Vales</TableHead>
                    <TableHead className="font-semibold text-right">ISR</TableHead>
                    <TableHead className="font-semibold text-right">Neto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalles.map((detalle) => (
                    <TableRow key={detalle.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div>
                          <div>{detalle.empleado_nombre || `Empleado ${detalle.empleado_id}`}</div>
                          <div className="text-xs text-muted-foreground">
                            {detalle.empleado_numero || `ID: ${detalle.empleado_id}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={detalle.empleado_tipo === "INTERNO" ? "default" : "secondary"}>
                          {detalle.empleado_tipo || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{detalle.dias_trabajados}</TableCell>
                      <TableCell className="text-center">{detalle.horas_totales}</TableCell>
                      <TableCell className="text-center">{detalle.entregas_totales}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(detalle.base)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(detalle.bono)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(detalle.pago_entregas)}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(detalle.bruto)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        {detalle.vales > 0 ? formatCurrency(detalle.vales) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-red-600">
                        <div>
                          {formatCurrency(detalle.isr)}
                          <div className="text-xs text-muted-foreground">({getISRRate(detalle.bruto)}%)</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-green-600">
                        {formatCurrency(detalle.neto)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Reglas de Cálculo de Nómina</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-green-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Sueldos y Bonos</h4>
              <ul className="space-y-1">
                <li>• Sueldo base: $30.00 por hora</li>
                <li>• Jornada estándar: 8 horas</li>
                <li>• Pago por entrega: $5.00</li>
                <li>• Bono chofer: $10.00/hora</li>
                <li>• Bono cargador: $5.00/hora</li>
                <li>• Auxiliares: bono del rol cubierto</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Deducciones y Beneficios</h4>
              <ul className="space-y-1">
                <li>• ISR base: 9% sobre sueldo bruto</li>
                <li>• ISR adicional: 3% si excede $16,000</li>
                <li>• Vales de despensa: 4% (solo internos)</li>
                <li>• Vales calculados antes de impuestos</li>
                <li>• Subcontratados: sin vales</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
