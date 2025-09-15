const { calcularYGenerarNomina, obtenerNominaConDetalles } = require('../../services/nomina.service.js');

const NominasCtrl = {
  generar: async (req, res, next) => {
    try {
      const periodo = req.query.periodo;
      const { nomina, detalles } = await calcularYGenerarNomina(periodo);
      res.status(201).json({ nomina, detalles });
    } catch (e) {
      res.status(e.status || 400).json({ message: e.message });
    }
  },

  obtener: async (req, res, next) => {
    try {
      const data = await obtenerNominaConDetalles(req.params.id);
      if (!data) return res.status(404).json({ message: 'No encontrado' });
      res.json(data);
    } catch (e) { next(e); }
  }
};

module.exports = { NominasCtrl };
