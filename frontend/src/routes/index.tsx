import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmpleadosScreen from "../screens/EmpleadosScreen";
import MovimientosScreen from "../screens/MovimientosScreen";
import NominaScreen from "../screens/NominaScreen";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EmpleadosScreen />} />
        <Route path="/movimientos" element={<MovimientosScreen />} />
        <Route path="/nomina" element={<NominaScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
