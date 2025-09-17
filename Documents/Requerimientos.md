A. Análisis de los requerimientos funcionales
a. Requerimientos
Alta / Baja / Edición de empleados con rol y tipo de contratación.
Registro de asistencias / días trabajados y, si aplica, coberturas (auxiliar que cubre a un chofer o cargador por un día).
Registro de entregas por día.
Cálculo mensual por empleado: desglose de sueldo base, bonos, entregas, sueldo bruto, ISR, vales y sueldo neto.
b. Entradas
Alta de empleado con su rol y tipo de contratación.
Registro del día trabajado y entregas por día.
c. Procesos
 Cálculo por empleado y mes:
Sueldo base = (Pago por hora * Horas de la jornada) * Días trabajados.
Bono por entregas = bono por entrega * cantidad de entregas.
Bono por tipo de empleado = bono por hora * horas trabajadas.
Bono por cobertura (auxiliar cubriendo turno) = bono por hora * horas cubiertas.
Sueldo bruto = sueldo base + bono de entregas + bono por tipo + bono por cobertura.
ISR:
Si el sueldo bruto ≤ $16,000 → ISR = Sueldo Bruto * 0.09.
Si el sueldo bruto > $16,000 → ISR = Sueldo Bruto * 0.12.
Vales de empleado = Sueldo Bruto * 0.04 (excepto subcontratados).
Sueldo neto = Sueldo Bruto - ISR.
d. Salidas
 Desglose mensual por empleado:
Sueldo Base
Bono (tipo de empleado)
Bono por entregas
Bono por cobertura (en caso de auxiliar)
Sueldo Bruto
ISR
Vales
Sueldo Neto




B. Diagrama de secuencia


C. Casos de prueba del cálculo de sueldo mensual

ID
Descripcion de la prueba
Entradas
Salida esperada
TC-01 
Chofer interno
con entregas
moderadas
Días=22,
Rol=Chofer,
Tipo=Interno,
Entregas=60,
Coberturas=0


Sueldo Base
30×8×22=5,280;
Bono por cargo
10×8×22=1,760;
Bono por entregas
5×60=300;
Sueldo Bruto=7,340;
ISR 9%=660.60;
Sueldo Neto=6,679.40;
Vales 4%=293.60


TC-02 
Chofer interno
con entregas
moderadas
superando los
$16,000
Días=30,
Rol=Chofer,
Tipo=Interno,
Entregas=2000
Sueldo Base
30×8×30=7,200;
Bono por cargo
10×8×30=2,400;
Bono por entregas
5×2000=10,000;
Sueldo Bruto=19,600;
ISR 12%=2,352;
Sueldo Neto=17,248;
Vales 4%=784;
TC-03 
Auxiliar
subcontratado
cubre Chofer 5
días
Días=22,
Rol=Auxiliar,
Tipo=Subcontratado,
Entregas=50,
Cobertura Chofer=5
días
Sueldo Base
30×8×22=5,280;
Bono cobertura
10×8×5=400;
Entregas 5×50=250;
Bruto=5,930;
ISR 9%=533.70;
Neto=5,396.30;
Vales=0


D. Codificación y herramientas utilizadas
a. IDE y herramientas utilizadas (entorno de desarrollo):
Visual Studio Code
Node.js + NPM
PostgreSQL
Git & GitHub (control de versiones)
b. Versiones utilizadas:
Node.js 20.x
NPM 11.5.2
Express 4.x
Sequelize 6.x
PostgreSQL 17.5
React 18.x
Vite 5.x
c. Ambientación del equipo (pasos reproducibles):
Instalación de Node.js + NPM
Descargar desde https://nodejs.org e instalar el paquete para Windows/Mac/Linux.
Instalación de PostgreSQL
Descargar desde https://www.postgresql.org/ y seguir el asistente de instalación.
Configuración del proyecto Backend (API)

 mkdir backend && cd backend
npm init -y
npm install express sequelize pg pg-hstore
Configuración del proyecto Frontend (React + Vite)
 npm create vite@latest frontend
cd frontend
npm install
npm run dev

E. Resultados de pruebas
ID
Descripción de la prueba
Resultado de la prueba
¿Por qué falló?
TC-01
Chofer interno con entregas moderadas
OK (valores coinciden con esperado)


TC-02
Chofer interno con entregas moderadas superando $16,000
OK (Aplica 12% ISR correctamente)


TC-03
Auxiliar subcontratado sube chofer 5 dias
OK (sin vales, bono solo en dias cubiertos)




