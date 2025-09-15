const { DataTypes } = require('sequelize');
const { sequelize } = require('../../models');

const Movimiento = sequelize.define(
  'Movimiento',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empleado_id: { type: DataTypes.INTEGER, allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    entregas: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    cubrio_turno: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    rol_cubierto: {
      type: DataTypes.ENUM('CHOFER', 'CARGADOR'),
      allowNull: true
    },
    horas: { type: DataTypes.DECIMAL(4, 2), allowNull: false, defaultValue: 8 },
    creado_en: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    actualizado_en: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  {
    tableName: 'movimientos',
    timestamps: false
  }
);

module.exports = { Movimiento };
