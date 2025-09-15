const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../models');
const { ParametrosNomina, Nomina, NominaDetalle } = require('../modules/nominas/modelo.js');
const { Empleado } = require('../modules/trabajadores/trabajador.model.js');
const { Movimiento } = require('../modules/movimientos/movimientos.model.js');

function rangoMes(periodo) {
  if (!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(periodo)) {
    const e = new Error('Periodo inválido. Usa YYYY-MM');
    e.status = 400;
    throw e;
  }
  const [y, m] = periodo.split('-').map(Number);
  const inicio = new Date(Date.UTC(y, m - 1, 1));
  const fin = new Date(Date.UTC(y, m, 0)); // último día del mes
  return { inicio: inicio.toISOString().slice(0, 10), fin: fin.toISOString().slice(0, 10) };
}

async function obtenerParametrosActivos() {
  const p = await ParametrosNomina.findOne({ where: { activo: true }, order: [['vigente_desde', 'DESC']] });
  if (!p) throw new Error('No hay parámetros de nómina activos');
  return p;
}

async function calcularYGenerarNomina(periodo) {
  const { inicio, fin } = rangoMes(periodo);
  const params = await obtenerParametrosActivos();

  const existente = await Nomina.findOne({ where: { periodo } });
  if (existente) {
    const e = new Error('La nómina de ese periodo ya existe');
    e.status = 409;
    throw e;
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
      base: base.toFixed(2),
      bono: bono.toFixed(2),
      pago_entregas: pagoEntregas.toFixed(2),
      bruto: bruto.toFixed(2),
      vales: vales.toFixed(2),
      isr: isr.toFixed(2),
      neto: neto.toFixed(2)
    });
  }

  return await sequelize.transaction(async (t) => {
    const nomina = await Nomina.create(
      { periodo, parametros_id: params.id },
      { transaction: t }
    );

    for (const det of detallesCalculados) {
      await NominaDetalle.create(
        { nomina_id: nomina.id, ...det },
        { transaction: t }
      );
    }

    const detalles = await NominaDetalle.findAll({ where: { nomina_id: nomina.id }, transaction: t });
    return { nomina, detalles };
  });
}

async function obtenerNominaConDetalles(id) {
  const nomina = await Nomina.findByPk(id);
  if (!nomina) return null;
  const detalles = await NominaDetalle.findAll({ where: { nomina_id: id }, order: [['empleado_id','ASC']] });
  return { nomina, detalles };
}

module.exports = { calcularYGenerarNomina, obtenerNominaConDetalles };
