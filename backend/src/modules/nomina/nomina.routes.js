const { Router } = require('express');
const { NominasCtrl } = require('./nomina.controller.js');

const r = Router();

r.post('/', NominasCtrl.generar);
r.get('/:id', NominasCtrl.obtener);

module.exports = r;
