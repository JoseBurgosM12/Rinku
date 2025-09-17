const { DataTypes } = require('sequelize');
const { sequelize } = require('../../models');

const ParametrosNomina = sequelize.define('ParametrosNomina', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vigente_desde: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
  base_por_hora: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 30.00 },
  bono_hora_chofer: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 10.00 },
  bono_hora_cargador: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 5.00 },
  bono_hora_auxiliar: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0.00 },
  pago_por_entrega: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 5.00 },
  isr_base: { type: DataTypes.DECIMAL(5,4), allowNull: false, defaultValue: 0.09 },
  isr_extra_umbral_bruto: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 16000.00 },
  isr_extra_adicional: { type: DataTypes.DECIMAL(5,4), allowNull: false, defaultValue: 0.03 },
  vales_pct: { type: DataTypes.DECIMAL(5,4), allowNull: false, defaultValue: 0.04 },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'parametros_nomina',
  timestamps: false
});

const Nomina = sequelize.define('Nomina', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  periodo: { type: DataTypes.STRING(7), allowNull: false }, // 'YYYY-MM'
  generado_en: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  parametros_id: { type: DataTypes.INTEGER, allowNull: false },
  estado: { 
    type: DataTypes.ENUM('BORRADOR', 'CERRADA'),
    allowNull: false,
    defaultValue: 'BORRADOR'
  }
}, {
  tableName: 'nominas',
  timestamps: false
});

const NominaDetalle = sequelize.define('NominaDetalle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nomina_id: { type: DataTypes.INTEGER, allowNull: false },
  empleado_id: { type: DataTypes.INTEGER, allowNull: false },
  dias_trabajados: { type: DataTypes.INTEGER, allowNull: false },
  horas_totales: { type: DataTypes.INTEGER, allowNull: false },
  entregas_totales: { type: DataTypes.INTEGER, allowNull: false },
  base: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  bono: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  pago_entregas: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  bruto: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  vales: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  isr: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  neto: { type: DataTypes.DECIMAL(12,2), allowNull: false }
}, {
  tableName: 'nomina_detalles',
  timestamps: false
});

NominaDetalle.belongsTo(Nomina, { foreignKey: 'nomina_id' });

module.exports = {
  ParametrosNomina,
  Nomina,
  NominaDetalle
};
