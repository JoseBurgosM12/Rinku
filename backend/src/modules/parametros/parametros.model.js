const { DataTypes } = require("sequelize");
const { sequelize } = require("../../models");

const ParametrosNomina = sequelize.define(
  "ParametrosNomina",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vigente_desde: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    base_por_hora: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 30.0,
    },
    bono_hora_chofer: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 10.0,
    },
    bono_hora_cargador: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 5.0,
    },
    bono_hora_auxiliar: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    pago_por_entrega: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 5.0,
    },
    isr_base: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.09, // 9%
    },
    isr_extra_umbral_bruto: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 16000.0,
    },
    isr_extra_adicional: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.03, // 3%
    },
    vales_pct: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.04, // 4%
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "parametros_nomina",
    timestamps: false,
  }
);

module.exports = { ParametrosNomina };
