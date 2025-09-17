const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { ParametrosNomina, Nomina, NominaDetalle } = require('../modules/nomina/nomina.model.js');
const { Empleado } = require('../modules/trabajadores/trabajador.model.js');
const { Movimiento } = require('../modules/movimientos/movimientos.model.js');

/**
 * 
 * Calcula el rango de fechas (inicio y fin) para un periodo dado en formato 'YYYY-MM'.
 * Lanza un error si el formato es inválido.
 * @param {string} periodo - Periodo en formato 'YYYY-MM'
 * @returns {Object} - Objeto con las fechas de inicio y fin
 */
function rangoMes(periodo) {
  if (!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(periodo)) {
    const e = new Error('Periodo inválido. Usa YYYY-MM');
    e.status = 400;
    throw e;
  }
  const [y, m] = periodo.split('-').map(Number);
  const inicio = new Date(Date.UTC(y, m - 1, 1));
  const fin = new Date(Date.UTC(y, m, 0));
  return { inicio: inicio.toISOString().slice(0, 10), fin: fin.toISOString().slice(0, 10) };
}

/**
 * Obtiene los parámetros de nómina activos.
 * @returns {Promise<Object>} - Parámetros de nómina activos
 */
async function obtenerParametrosActivos() {
  const p = await ParametrosNomina.findOne({ where: { activo: true }, order: [['vigente_desde', 'DESC']] });
  if (!p) throw new Error('No hay parámetros de nómina activos');
  return p;
}

/**
 * Calcula y genera la nómina para un periodo dado.
 * @param {string} periodo - Periodo en formato 'YYYY-MM'
 * @returns {Promise<Object>} - Nómina generada
 */
async function calcularYGenerarNomina(periodo) {
  const { inicio, fin } = rangoMes(periodo);
  const params = await obtenerParametrosActivos();

  let existente = await Nomina.findOne({ where: { periodo } });

  if (existente) {
    if (existente.estado === "CERRADO") {
      const e = new Error("La nómina de ese periodo ya está cerrada y no puede recalcularse");
      e.status = 409;
      throw e;
    }
    await NominaDetalle.destroy({ where: { nomina_id: existente.id } });
    await existente.destroy();
    existente = null;
  }

  const movs = await Movimiento.findAll({
    where: { fecha: { [Op.between]: [inicio, fin] } },
    raw: true
  });

  if (!movs.length) {
    const e = new Error('No hay movimientos en el periodo');
    e.status = 404;
    throw e;
  }

  const empIds = [...new Set(movs.map(m => m.empleado_id))];
  const empleados = await Empleado.findAll({ where: { id: empIds }, raw: true });
  const mapaEmp = new Map(empleados.map(e => [e.id, e]));

  const agregados = new Map();
  for (const m of movs) {
    const e = mapaEmp.get(m.empleado_id);
    if (!e) continue;

    if (!agregados.has(e.id)) {
      agregados.set(e.id, {
        empleado: e,
        dias: 0,
        horas: 0,
        entregas: 0,
        horasAuxCubreChofer: 0,
        horasAuxCubreCargador: 0
      });
    }
    const a = agregados.get(e.id);
    a.dias += 1;
    a.horas += Number(m.horas);
    a.entregas += Number(m.entregas);

    if (e.rol === 'AUXILIAR' && m.cubrio_turno) {
      if (m.rol_cubierto === 'CHOFER') a.horasAuxCubreChofer += Number(m.horas);
      if (m.rol_cubierto === 'CARGADOR') a.horasAuxCubreCargador += Number(m.horas);
    }
  }

  const detallesCalculados = [];
  for (const [, x] of agregados) {
    const { empleado: e } = x;

    const base = Number(params.base_por_hora) * x.horas;

    let bono = 0;
    if (e.rol === 'CHOFER') bono = Number(params.bono_hora_chofer) * x.horas;
    else if (e.rol === 'CARGADOR') bono = Number(params.bono_hora_cargador) * x.horas;
    else if (e.rol === 'AUXILIAR') {
      bono =
        Number(params.bono_hora_chofer) * x.horasAuxCubreChofer +
        Number(params.bono_hora_cargador) * x.horasAuxCubreCargador;
    }

    const pagoEntregas = Number(params.pago_por_entrega) * x.entregas;
    const bruto = base + bono + pagoEntregas;
    const vales = e.tipo === 'INTERNO' ? Number(params.vales_pct) * bruto : 0;

    const isrRate = bruto > Number(params.isr_extra_umbral_bruto)
      ? Number(params.isr_base) + Number(params.isr_extra_adicional)
      : Number(params.isr_base);
    const isr = bruto * isrRate;

    const neto = bruto - isr;

    detallesCalculados.push({
      empleado_id: e.id,
      dias_trabajados: x.dias,
      horas_totales: x.horas,
      entregas_totales: x.entregas,
      base: Number(base.toFixed(2)),
      bono: Number(bono.toFixed(2)),
      pago_entregas: Number(pagoEntregas.toFixed(2)),
      bruto: Number(bruto.toFixed(2)),
      vales: Number(vales.toFixed(2)),
      isr: Number(isr.toFixed(2)),
      neto: Number(neto.toFixed(2)),
      empleado_nombre: e.nombre,
      empleado_numero: e.numero,
      empleado_tipo: e.tipo,
      empleado_rol: e.rol,
    });
  }

  return await sequelize.transaction(async (t) => {
    const nomina = await Nomina.create(
      { periodo, parametros_id: params.id, estado: "BORRADOR" },
      { transaction: t }
    );

    for (const det of detallesCalculados) {
      const { empleado_nombre, empleado_numero, empleado_tipo, empleado_rol, ...soloDB } = det;
      await NominaDetalle.create(
        { nomina_id: nomina.id, ...soloDB },
        { transaction: t }
      );
    }

    return { nomina, detalles: detallesCalculados };
  });
}

/**
 * Obtiene una nómina con sus detalles.
 * @param {number} id - ID de la nómina
 * @returns {Promise<Object|null>} - Nómina con detalles o null si no existe
 */
async function obtenerNominaConDetalles(id) {
  const nomina = await Nomina.findByPk(id);
  if (!nomina) return null;

  const detallesRaw = await NominaDetalle.findAll({
    where: { nomina_id: id },
    order: [['empleado_id','ASC']]
  });

  const empleados = await Empleado.findAll({
    where: { id: detallesRaw.map(d => d.empleado_id) },
    raw: true
  });
  const mapaEmp = new Map(empleados.map(e => [e.id, e]));

  const detalles = detallesRaw.map(d => {
    const data = d.toJSON();
    const emp = mapaEmp.get(data.empleado_id);
    return {
      ...data,
      base: Number(data.base),
      bono: Number(data.bono),
      pago_entregas: Number(data.pago_entregas),
      bruto: Number(data.bruto),
      vales: Number(data.vales),
      isr: Number(data.isr),
      neto: Number(data.neto),
      empleado_nombre: emp?.nombre || null,
      empleado_numero: emp?.numero || null,
      empleado_tipo: emp?.tipo || null,
      empleado_rol: emp?.rol || null,
    };
  });

  return { nomina, detalles };
}

module.exports = { calcularYGenerarNomina, obtenerNominaConDetalles };
