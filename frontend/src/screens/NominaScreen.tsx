"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, RefreshCw, AlertCircle, DollarSign, FileText, TrendingUp, Eye } from "lucide-react"
import { createNomina, getNomina, getNominas, closeNomina } from "@/services/nomina"

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
  const [nomina, setNomina] = useState<any | null>(null)

  const [nominas, setNominas] = useState<any[]>([])

  useEffect(() => {
    loadNominas()
  }, [])

  const loadNominas = async () => {
    try {
      const res = await getNominas()
      setNominas(res.data || [])
    } catch (err) {
      console.error("Error cargando nóminas", err)
    }
  }

  const handleGenerar = async () => {
    if (!periodo) {
      setError("Debe especificar un período")
      return
    }

    try {
      setLoading(true)
      setError("")
      const res = await createNomina(periodo)
      setDetalles(res.data.detalles || [])
      setNominaId(res.data.nomina?.id || null)
      setNomina(res.data.nomina || null)
      await loadNominas()
    } catch (err: any) {
      setError(err.response?.data?.message || "Error generando nómina")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

    const handleCerrar = async () => {
    if (!nominaId) return;
    try {
      setLoading(true);
      const res = await closeNomina(nominaId);
      setNomina(res.data);
      await loadNominas(); 
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cerrar nómina");
    } finally {
      setLoading(false);
    }
  };

  const handleObtener = async () => {
    if (!nominaId) return
    try {
      setLoading(true)
      const res = await getNomina(nominaId)
      setDetalles(res.data.detalles || [])
      setNomina(res.data.nomina || null) 
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
        total_bruto: acc.total_bruto + Number(detalle.bruto || 0),
        total_deducciones: acc.total_deducciones + Number(detalle.isr || 0),
        total_neto: acc.total_neto + Number(detalle.neto || 0),
        total_vales: acc.total_vales + Number(detalle.vales || 0),
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount)

  const getISRRate = (bruto: number) => {
    const baseRate = 9
    const additionalRate = bruto > 16000 ? 3 : 0
    return baseRate + additionalRate
  }

  const resumen = calcularResumen()

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cálculo de Nómina</h1>
          <p className="text-muted-foreground">Genera y consulta los cálculos de nómina mensual</p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* FORMULARIO GENERAR */}
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
              <Button
                variant="outline"
                onClick={() => window.open(`http://localhost:3000/api/nomina/${nominaId}/pdf`, "_blank")}
                disabled={!nominaId}
              >
                Descargar PDF
              </Button>
              <Button
                variant="destructive"
                onClick={handleCerrar}
                disabled={!nominaId || nomina?.estado !== "BORRADOR"}
              >
                Cerrar Nómina
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {nomina?.estado === "CERRADO" && (
        <Alert variant="default">
          <AlertDescription>✅ La nómina ha sido cerrada correctamente</AlertDescription>
        </Alert>
      )}
      
      {/* RESUMEN */}
      {detalles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-6"><p>Empleados</p><p className="text-2xl font-bold">{resumen.total_empleados}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p>Total Bruto</p><p className="text-2xl font-bold">{formatCurrency(resumen.total_bruto)}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p>Total Deducciones</p><p className="text-2xl font-bold text-red-600">{formatCurrency(resumen.total_deducciones)}</p></CardContent></Card>
          <Card><CardContent className="p-6"><p>Total Neto</p><p className="text-2xl font-bold text-green-600">{formatCurrency(resumen.total_neto)}</p></CardContent></Card>
        </div>
      )}

      {/* DETALLE */}
      {detalles.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Detalle de Nómina - {periodo}</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Días</TableHead>
                    <TableHead className="text-center">Horas</TableHead>
                    <TableHead className="text-center">Entregas</TableHead>
                    <TableHead className="text-right">Sueldo Base</TableHead>
                    <TableHead className="text-right">Bonos</TableHead>
                    <TableHead className="text-right">Entregas</TableHead>
                    <TableHead className="text-right">Bruto</TableHead>
                    <TableHead className="text-right">Vales</TableHead>
                    <TableHead className="text-right">ISR</TableHead>
                    <TableHead className="text-right">Neto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalles.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.empleado_nombre || `Empleado ${d.empleado_id}`}</TableCell>
                      <TableCell><Badge variant={d.empleado_tipo === "INTERNO" ? "default" : "secondary"}>{d.empleado_tipo || "N/A"}</Badge></TableCell>
                      <TableCell className="text-center">{d.dias_trabajados}</TableCell>
                      <TableCell className="text-center">{d.horas_totales}</TableCell>
                      <TableCell className="text-center">{d.entregas_totales}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(d.base)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(d.bono)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(d.pago_entregas)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(d.bruto)}</TableCell>
                      <TableCell className="text-right font-mono">{d.vales > 0 ? formatCurrency(d.vales) : "-"}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(d.isr)}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-green-600">{formatCurrency(d.neto)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* HISTORIAL */}
      <Card>
        <CardHeader><CardTitle>Historial de Nóminas</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Generado en</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nominas.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>{n.id}</TableCell>
                  <TableCell>{n.periodo}</TableCell>
                  <TableCell>{new Date(n.generado_en).toLocaleString()}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setNominaId(n.id); handleObtener(); }}>
                      <Eye className="h-4 w-4" /> Ver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(`http://localhost:3000/api/nomina/${n.id}/pdf`, "_blank")}>
                      <FileText className="h-4 w-4" /> PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
