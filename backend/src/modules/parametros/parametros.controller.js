const { ParametrosNomina } = require("./parametros.model.js");

/**
 * Controlador para gestionar parámetros de nómina.
 */
const ParametrosCtrl = {
  /**
   * Lista todos los parámetros de nómina.
   * @param {*} _req 
   * @param {*} res 
   * @param {*} next 
   */
  listar: async (_req, res, next) => {
    try {
      const data = await ParametrosNomina.findAll({
        order: [["vigente_desde", "DESC"]],
      });
      res.json(data);
    } catch (e) {
      next(e);
    }
  },

  /**
   * Obtiene los parámetros de nómina activos.
   * @param {*} _req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  obtenerActivo: async (_req, res, next) => {
    try {
      const activo = await ParametrosNomina.findOne({
        where: { activo: true },
        order: [["vigente_desde", "DESC"]],
      });
      if (!activo) return res.status(404).json({ message: "No hay parámetros activos" });
      res.json(activo);
    } catch (e) {
      next(e);
    }
  },

  /**
   * Crea un nuevo parámetro de nómina.
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  crear: async (req, res, next) => {
    try {
      // Desactivar el anterior activo
      await ParametrosNomina.update({ activo: false }, { where: { activo: true } });

      const nuevo = await ParametrosNomina.create({
        ...req.body,
        vigente_desde: req.body.vigente_desde || new Date(),
        activo: true,
      });

      res.status(201).json(nuevo);
    } catch (e) {
      next(e);
    }
  },

  /**
   * Desactiva un parámetro de nómina.
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  desactivar: async (req, res, next) => {
    try {
      const param = await ParametrosNomina.findByPk(req.params.id);
      if (!param) return res.status(404).json({ message: "No encontrado" });

      await param.update({ activo: false });
      res.json({ message: "Parámetros desactivados" });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { ParametrosCtrl };
