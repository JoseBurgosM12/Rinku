const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');

/**
 * Rutas de los módulos
 */
const trabajadoresRutas = require('./modules/trabajadores/trabajador.routes.js');
const movimientosRoutes = require('./modules/movimientos/movimientos.routes.js');
const nominaRoutes = require('./modules/nomina/nomina.routes.js')
const parametrosRoutes = require('./modules/parametros/parametros.routes.js');

/**
 * Aplicación Express
 */
const app = express();
app.use(pinoHttp());
app.use(helmet());
app.use(cors());
app.use(express.json());

/**
 * Rutas
 */
app.use('/api/trabajadores', trabajadoresRutas);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/nomina', nominaRoutes);
app.use('/api/parametros', parametrosRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

module.exports = app;
