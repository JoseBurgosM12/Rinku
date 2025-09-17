const { Router } = require('express');
const { NominasCtrl } = require('./nomina.controller.js');
const { generarNominaPDF } = require('../../services/pdf.service.js');

const r = Router();

r.get("/:id/pdf", async (req, res) => {
  try {
    await generarNominaPDF(req.params.id, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

r.post('/', NominasCtrl.generar);
r.get('/:id', NominasCtrl.obtener);
r.get('/', NominasCtrl.listar);
r.patch('/:id/cerrar', NominasCtrl.cerrar);

module.exports = r;
