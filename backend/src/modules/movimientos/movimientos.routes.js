const { Router } = require('express');
const { MovimientosCtrl } = require('./movimientos.controller.js');

const r = Router();

r.get('/', MovimientosCtrl.listar);
r.get('/:id', MovimientosCtrl.obtener);
r.post('/', MovimientosCtrl.crear);
r.put('/:id', MovimientosCtrl.actualizar);
r.delete('/:id', MovimientosCtrl.eliminar);

module.exports = r;
