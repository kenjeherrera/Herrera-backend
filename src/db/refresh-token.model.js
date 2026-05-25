const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING(512),
    allowNull: false,
  },
  expires: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdByIp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  revoked: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  revokedByIp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  replacedByToken: {
    type: DataTypes.STRING(512),
    allowNull: true,
  },
});

module.exports = RefreshToken;
