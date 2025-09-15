const { Router } = require('express');
const { TrabajadoresCtrl } = require('./trabajador.controller.js');

const r = Router();
r.get('/', TrabajadoresCtrl.listar);
r.post('/', TrabajadoresCtrl.crear);
r.put('/:id', TrabajadoresCtrl.actualizar);
r.delete('/:id', TrabajadoresCtrl.eliminar);

module.exports = r;
