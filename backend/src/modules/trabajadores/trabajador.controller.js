const { Empleado } = require('./trabajador.model.js');

/**
 * Controlador para gestionar empleados.
 */
const TrabajadoresCtrl = {
  /**
   * Lista todos los empleados.
   * @param {*} _req 
   * @param {*} res 
   * @param {*} next 
   */
  listar: async (_req, res, next) => {
    try { res.json(await Empleado.findAll({ order: [['id', 'DESC']] })); }
    catch (e) { next(e); }
  },
  /**
   * Crea un nuevo empleado.
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  crear: async (req, res, next) => {
    try { const nuevo = await Empleado.create(req.body); res.status(201).json(nuevo); }
    catch (e) { next(e); }
  },
  /**
   * Actualiza un empleado existente.
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  actualizar: async (req, res, next) => {
    try {
      const [n] = await Empleado.update(req.body, { where: { id: req.params.id }, returning: true });
      if (!n) return res.status(404).json({ message: 'No encontrado' });
      const upd = await Empleado.findByPk(req.params.id);
      res.json(upd);
    } catch (e) { next(e); }
  },
  /**
   * Elimina un empleado existente.
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  eliminar: async (req, res, next) => {
    try {
      const n = await Empleado.destroy({ where: { id: req.params.id } });
      if (!n) return res.status(404).json({ message: 'No encontrado' });
      res.status(204).end();
    } catch (e) { next(e); }
  }
};

module.exports = { TrabajadoresCtrl };
