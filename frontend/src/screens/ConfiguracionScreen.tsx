"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, RefreshCw, DollarSign, Percent, Clock, Truck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  getParametrosNomina, 
  createParametrosNomina, 
  type ParametrosNomina 
} from "@/services/parametros"

export default function ConfiguracionScreen() {
  const [parametros, setParametros] = useState<ParametrosNomina | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadParametros()
  }, [])

const loadParametros = async () => {
  try {
    setLoading(true)
    const data = await getParametrosNomina()
    setParametros({
      ...data,
      base_por_hora: Number(data.base_por_hora),
      bono_hora_chofer: Number(data.bono_hora_chofer),
      bono_hora_cargador: Number(data.bono_hora_cargador),
      bono_hora_auxiliar: Number(data.bono_hora_auxiliar),
      pago_por_entrega: Number(data.pago_por_entrega),
      isr_base: Number(data.isr_base),
      isr_extra_umbral_bruto: Number(data.isr_extra_umbral_bruto),
      isr_extra_adicional: Number(data.isr_extra_adicional),
      vales_pct: Number(data.vales_pct),
    })
    setHasChanges(false)
  } catch (error) {
    toast({
      title: "Error",
      description: "No se pudieron cargar los parámetros",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}

  const handleInputChange = (field: keyof ParametrosNomina, value: string | number | boolean) => {
    if (!parametros) return
    setParametros((prev) => ({ ...prev!, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!parametros) return

    try {
      setSaving(true)
      // creamos un nuevo registro en vez de editar
      await createParametrosNomina({
        vigente_desde: parametros.vigente_desde,
        base_por_hora: parametros.base_por_hora,
        bono_hora_chofer: parametros.bono_hora_chofer,
        bono_hora_cargador: parametros.bono_hora_cargador,
        bono_hora_auxiliar: parametros.bono_hora_auxiliar,
        pago_por_entrega: parametros.pago_por_entrega,
        isr_base: parametros.isr_base,
        isr_extra_umbral_bruto: Number(parametros.isr_extra_umbral_bruto),
        isr_extra_adicional: parametros.isr_extra_adicional,
        vales_pct: parametros.vales_pct,
      })
      toast({ title: "Éxito", description: "Se crearon nuevos parámetros" })
      await loadParametros()
    } catch (error) { 
      toast({
        title: "Error",
        description: "No se pudieron guardar los parámetros",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    loadParametros()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!parametros) {
    return (
      <Alert>
        <AlertDescription>No se pudieron cargar los parámetros de configuración.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Configuración</h1>
            <p className="text-muted-foreground">Parámetros del sistema de nómina</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={parametros.activo ? "default" : "secondary"}>
            {parametros.activo ? "Activo" : "Inactivo"}
          </Badge>
          <Badge variant="outline">
            Vigente desde: {new Date(parametros.vigente_desde).toLocaleDateString()}
          </Badge>
        </div>
      </div>

      {hasChanges && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>Tienes cambios sin guardar</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Descartar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sueldos Base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Sueldos Base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="base_por_hora">Pago por Hora (MXN)</Label>
              <Input
                id="base_por_hora"
                type="number"
                step="0.01"
                value={parametros.base_por_hora}
                onChange={(e) => handleInputChange("base_por_hora", Number.parseFloat(e.target.value) || 0)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Sueldo base por hora trabajada</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pago_por_entrega">Pago por Entrega (MXN)</Label>
              <Input
                id="pago_por_entrega"
                type="number"
                step="0.01"
                value={parametros.pago_por_entrega}
                onChange={(e) => handleInputChange("pago_por_entrega", Number.parseFloat(e.target.value) || 0)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Pago adicional por cada entrega realizada</p>
            </div>
          </CardContent>
        </Card>

        {/* Bonos por Rol */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Bonos por Rol
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bono_hora_chofer">Bono Chofer (MXN/hora)</Label>
              <Input
                id="bono_hora_chofer"
                type="number"
                step="0.01"
                value={parametros.bono_hora_chofer}
                onChange={(e) => handleInputChange("bono_hora_chofer", Number.parseFloat(e.target.value) || 0)}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bono_hora_cargador">Bono Cargador (MXN/hora)</Label>
              <Input
                id="bono_hora_cargador"
                type="number"
                step="0.01"
                value={parametros.bono_hora_cargador}
                onChange={(e) => handleInputChange("bono_hora_cargador", Number.parseFloat(e.target.value) || 0)}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bono_hora_auxiliar">Bono Auxiliar (MXN/hora)</Label>
              <Input
                id="bono_hora_auxiliar"
                type="number"
                step="0.01"
                value={parametros.bono_hora_auxiliar}
                onChange={(e) => handleInputChange("bono_hora_auxiliar", Number.parseFloat(e.target.value) || 0)}
                className="font-mono"
                disabled
              />
              <p className="text-xs text-muted-foreground">Los auxiliares no reciben bono base (solo cuando cubren)</p>
            </div>
          </CardContent>
        </Card>

        {/* Impuestos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Impuestos (ISR)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="isr_base">ISR Base (%)</Label>
              <Input
                id="isr_base"
                type="number"
                step="0.001"
                min="0"
                max="1"
                value={parametros.isr_base}
                onChange={(e) => handleInputChange("isr_base", Number.parseFloat(e.target.value) || 0)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Porcentaje base de ISR (ej: 0.09 = 9%)</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="isr_extra_umbral_bruto">Umbral ISR Adicional (MXN)</Label>
              <Input
                id="isr_extra_umbral_bruto"
                type="number"
                step="0.01"
                value={parametros.isr_extra_umbral_bruto}
                onChange={(e) => handleInputChange("isr_extra_umbral_bruto", Number.parseFloat(e.target.value) || 0)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Sueldo mensual a partir del cual aplica ISR adicional</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isr_extra_adicional">ISR Adicional (%)</Label>
              <Input
                id="isr_extra_adicional"
                type="number"
                step="0.001"
                min="0"
                max="1"
                value={parametros.isr_extra_adicional}
                onChange={(e) => handleInputChange("isr_extra_adicional", Number.parseFloat(e.target.value) || 0)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Porcentaje adicional de ISR (ej: 0.03 = 3%)</p>
            </div>
          </CardContent>
        </Card>

        {/* Vales de Despensa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Beneficios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vales_pct">Vales de Despensa (%)</Label>
              <Input
                id="vales_pct"
                type="number"
                step="0.001"
                min="0"
                max="1"
                value={parametros.vales_pct}
                onChange={(e) => handleInputChange("vales_pct", Number.parseFloat(e.target.value) || 0)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Porcentaje de vales (ej: 0.04 = 4%, solo empleados internos)
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="vigente_desde">Vigente Desde</Label>
              <Input
                id="vigente_desde"
                type="date"
                value={parametros.vigente_desde.split("T")[0]}
                onChange={(e) => handleInputChange("vigente_desde", e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                checked={parametros.activo}
                onCheckedChange={(checked) => handleInputChange("activo", checked)}
              />
              <Label htmlFor="activo">Configuración Activa</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de Cálculos */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa de Cálculos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Ejemplo: Chofer Interno</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>Sueldo base (8h): ${(parametros.base_por_hora * 8 * 30).toFixed(2)}</div>
                <div>Bono (8h): ${(parametros.bono_hora_chofer * 8 * 30).toFixed(2)}</div>
                <div>Por entregas (5): ${(parametros.pago_por_entrega * 5 * 30).toFixed(2)}</div>
                <div className="font-semibold">
                  Bruto: $
                  {(
                    (parametros.base_por_hora + parametros.bono_hora_chofer) * 8 * 30 +
                    parametros.pago_por_entrega * 5 * 30
                  ).toFixed(2)}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Deducciones</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>ISR Base ({(parametros.isr_base * 100).toFixed(1)}%)</div>
                <div>
                  ISR Adicional ({(parametros.isr_extra_adicional * 100).toFixed(1)}% si &gt; $
                  {parametros.isr_extra_umbral_bruto.toFixed(0)})
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Beneficios</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>Vales ({(parametros.vales_pct * 100).toFixed(1)}% solo internos)</div>
                <div>Aplicado antes de impuestos</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Restablecer
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges || saving}>
          {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}
