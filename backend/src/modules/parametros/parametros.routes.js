const { Router } = require("express");
const { ParametrosCtrl } = require("./parametros.controller.js");

const r = Router();

r.get("/", ParametrosCtrl.listar);
r.get("/activo", ParametrosCtrl.obtenerActivo);
r.post("/", ParametrosCtrl.crear);
r.put("/:id/desactivar", ParametrosCtrl.desactivar);

module.exports = r;
