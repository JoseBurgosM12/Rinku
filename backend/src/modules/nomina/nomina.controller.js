const { calcularYGenerarNomina, obtenerNominaConDetalles } = require('../../services/nomina.service.js');
const { Nomina } = require('./nomina.model.js');

/**
 * Controlador para gestionar nóminas.
 */
const NominasCtrl = {
  /**
   * Genera una nueva nómina.
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  generar: async (req, res, next) => {
    try {
      const periodo = req.query.periodo;
      const { nomina, detalles } = await calcularYGenerarNomina(periodo);
      res.status(201).json({ nomina, detalles });
    } catch (e) {
      res.status(e.status || 400).json({ message: e.message });
    }
  },

  /**
   * Obtiene una nómina por su ID.
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  obtener: async (req, res, next) => {
    try {
      const data = await obtenerNominaConDetalles(req.params.id);
      if (!data) return res.status(404).json({ message: 'No encontrado' });
      res.json(data);
    } catch (e) { next(e); }
  },

  /**
   * Lista todas las nóminas.
   * @param {*} _req 
   * @param {*} res 
   * @param {*} next 
   */
  listar: async (_req, res) => {
    try {
      const nominas = await Nomina.findAll({
        order: [['periodo', 'DESC']],
      });
      res.json(nominas);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },
  
  /**
   * Cierra una nómina.
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
  cerrar: async (req, res) => {
  try {
    const id = req.params.id;
    const nomina = await Nomina.findByPk(id);
    if (!nomina) return res.status(404).json({ message: 'Nómina no encontrada' });

    if (nomina.estado === 'CERRADA') {
      return res.status(400).json({ message: 'La nómina ya está cerrada' });
    }

    nomina.estado = 'CERRADA';
    await nomina.save();

    res.json({ message: 'Nómina cerrada correctamente', nomina });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}
};

module.exports = { NominasCtrl };
