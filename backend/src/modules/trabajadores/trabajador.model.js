const { DataTypes } = require('sequelize');
const { sequelize } = require('../../models');

const Empleado = sequelize.define('Empleado', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  nombre: { type: DataTypes.TEXT, allowNull: false },
  rol: { type: DataTypes.ENUM('CHOFER', 'CARGADOR', 'AUXILIAR'), allowNull: false },
  tipo: { type: DataTypes.ENUM('INTERNO', 'EXTERNO'), allowNull: false },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  creado_en: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  actualizado_en: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'empleados',
  timestamps: false
});

module.exports = { Empleado };
