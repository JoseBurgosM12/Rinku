import { useState } from "react"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Badge } from "./components/ui/badge"
import { Users, Activity, Calculator, Building2 } from "lucide-react"
import EmpleadosScreen from "./screens/EmpleadosScreen"
import MovimientosScreen from "./screens/MovimientosScreen"
import NominaScreen from "./screens/NominaScreen"

type ActiveModule = "dashboard" | "empleados" | "movimientos" | "nomina"

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>("dashboard")

  const modules = [
    { id: "empleados" as const, title: "Empleados", description: "Gestión de trabajadores", icon: Users, color: "bg-blue-500" },
    { id: "movimientos" as const, title: "Movimientos", description: "Registro de actividades", icon: Activity, color: "bg-green-500" },
    { id: "nomina" as const, title: "Nómina", description: "Cálculo de sueldos", icon: Calculator, color: "bg-purple-500" },
  ]

  const renderContent = () => {
    switch (activeModule) {
      case "empleados": return <EmpleadosScreen />
      case "movimientos": return <MovimientosScreen />
      case "nomina": return <NominaScreen />
      default: return (
       <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Building2 className="h-12 w-12 text-primary" />
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Rinku</h1>
                  <p className="text-muted-foreground">Sistema de Nómina Cinematográfica</p>
                </div>
              </div>
              <Badge variant="outline" className="text-sm">
                Empresa Japonesa de Cine
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {modules.map((module) => {
                const Icon = module.icon
                return (
                  <Card
                    key={module.id}
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    onClick={() => setActiveModule(module.id)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div
                        className={`w-16 h-16 ${module.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{module.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground mb-4">{module.description}</p>
                      <Button variant="outline" className="w-full bg-transparent">
                        Acceder
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Reglas de Negocio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Sueldos Base</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• $30 pesos por hora</li>
                      <li>• Jornada de 8 horas</li>
                      <li>• $5 por entrega</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Bonos por Rol</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Choferes: $10/hora</li>
                      <li>• Cargadores: $5/hora</li>
                      <li>• Auxiliares: Sin bono</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Cobertura de Turnos</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Solo auxiliares pueden cubrir</li>
                      <li>• Reciben bono del rol cubierto</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Deducciones</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• ISR: 9% general</li>
                      <li>• ISR adicional: 3% (&gt;$16,000)</li>
                      <li>• Vales: 4% (solo internos)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => setActiveModule("dashboard")} className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-6 w-6" /> Rinku
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              {modules.map((m) => (
                <Button
                  key={m.id}
                  variant={activeModule === m.id ? "default" : "ghost"}
                  onClick={() => setActiveModule(m.id)}
                  className="flex items-center gap-2"
                >
                  <m.icon className="h-4 w-4" /> {m.title}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{renderContent()}</main>
    </div>
  )
}
