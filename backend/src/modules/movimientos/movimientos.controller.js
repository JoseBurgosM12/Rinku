const { Op } = require('sequelize');
const { Movimiento } = require('./movimientos.model.js');
const { Empleado } = require('../trabajadores/trabajador.model.js'); 

/**
 * Valida el payload de la solicitud.
 * @param {*} body 
 * @returns 
 */
function validarPayload(body) {
  const errores = [];

  if (body.entregas == null || Number.isNaN(Number(body.entregas)) || body.entregas < 0) {
    errores.push('entregas debe ser un entero >= 0');
  }
  if (!body.fecha) errores.push('fecha es obligatoria (YYYY-MM-DD)');
  if (body.horas != null && !(Number(body.horas) > 0 && Number(body.horas) <= 12)) {
    errores.push('horas debe estar en (0, 12]');
  }

  const cubrio = !!body.cubrio_turno;
  if (cubrio && !body.rol_cubierto) errores.push('rol_cubierto es obligatorio si cubrio_turno = true');
  if (!cubrio && body.rol_cubierto) errores.push('rol_cubierto debe ser null si cubrio_turno = false');

  return errores;
}

/**
 * 
 * Valida que si se marcó cubrió turno, el empleado sea AUXILIAR.
 * @param {*} empleado_id 
 * @param {*} cubrio_turno 
 * @returns 
 */
async function validarCoberturaConEmpleado(empleado_id, cubrio_turno) {
  if (!cubrio_turno) return;
  const emp = await Empleado.findByPk(empleado_id, { attributes: ['id', 'rol'] });
  if (!emp) throw new Error('Empleado no encontrado');
  if (emp.rol !== 'AUXILIAR') {
    const err = new Error('Solo un AUXILIAR puede registrar cobertura de rol');
    err.status = 400;
    throw err;
  }
}

/**
 * Controlador para gestionar movimientos.
 */
const MovimientosCtrl = {
  /**
   * Lista los movimientos.
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  listar: async (req, res, next) => {
    try {
      const { empleado_id, desde, hasta, cubrio_turno, page = 1, limit = 20 } = req.query;
      const where = {};
      if (empleado_id) where.empleado_id = empleado_id;
      if (cubrio_turno === 'true') where.cubrio_turno = true;
      if (cubrio_turno === 'false') where.cubrio_turno = false;
      if (desde || hasta) {
        where.fecha = {};
        if (desde) where.fecha[Op.gte] = desde;
        if (hasta) where.fecha[Op.lte] = hasta;
      }

      const offset = (Number(page) - 1) * Number(limit);
      const { rows, count } = await Movimiento.findAndCountAll({
        where,
        order: [['fecha', 'DESC']],
        offset,
        limit: Number(limit)
      });

      res.json({ data: rows, total: count, page: Number(page), limit: Number(limit) });
    } catch (e) {
      next(e);
    }
  },

  /**
   * Obtiene un movimiento por su ID.
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  obtener: async (req, res, next) => {
    try {
      const mov = await Movimiento.findByPk(req.params.id);
      if (!mov) return res.status(404).json({ message: 'No encontrado' });
      res.json(mov);
    } catch (e) {
      next(e);
    }
  },

  /**
   * Crea un nuevo movimiento.
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  crear: async (req, res, next) => {
    try {
      const errores = validarPayload(req.body);
      if (errores.length) return res.status(400).json({ errors: errores });

      await validarCoberturaConEmpleado(req.body.empleado_id, req.body.cubrio_turno);

      // Normaliza payload
      const payload = { ...req.body };
      if (!payload.cubrio_turno || payload.rol_cubierto === '') payload.rol_cubierto = null;
      payload.empleado_id = Number(payload.empleado_id);
      if (payload.horas != null) payload.horas = Number(payload.horas);
      payload.entregas = Number(payload.entregas);

      const creado = await Movimiento.create(payload);
      res.status(201).json(creado);
    } catch (e) {
      if (e.message?.includes('Solo un AUXILIAR')) {
        return res.status(e.status || 400).json({ message: e.message });
      }
      next(e);
    }
  },

  /**
   * Actualiza un movimiento.
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  actualizar: async (req, res, next) => {
    try {
      const errores = validarPayload({
        ...req.body,
        cubrio_turno: req.body.cubrio_turno ?? false,
        rol_cubierto: req.body.rol_cubierto ?? null
      });
      if (errores.length) return res.status(400).json({ errors: errores });

      const mov = await Movimiento.findByPk(req.params.id);
      if (!mov) return res.status(404).json({ message: 'No encontrado' });

      await validarCoberturaConEmpleado(mov.empleado_id, req.body.cubrio_turno ?? mov.cubrio_turno);

      const body = { ...req.body };
      if ((body.cubrio_turno ?? mov.cubrio_turno) === false || body.rol_cubierto === '') {
        body.rol_cubierto = null;
      }
      if (body.empleado_id != null) body.empleado_id = Number(body.empleado_id);
      if (body.horas != null) body.horas = Number(body.horas);
      if (body.entregas != null) body.entregas = Number(body.entregas);

      await mov.update(body, { returning: true });
      res.json(mov);
    } catch (e) {
      if (e.message?.includes('Solo un AUXILIAR')) {
        return res.status(e.status || 400).json({ message: e.message });
      }
      next(e);
    }
  },

  /**
   * Elimina un movimiento.
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  eliminar: async (req, res, next) => {
    try {
      const n = await Movimiento.destroy({ where: { id: req.params.id } });
      if (!n) return res.status(404).json({ message: 'No encontrado' });
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  }
};

module.exports = { MovimientosCtrl };
