module.exports = (sequelize, DataTypes) => {
  const TowFirm = sequelize.define(
    'TowFirm',
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      faxNumber: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      provinceCode: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      registrationDate: {
        type: 'TIMESTAMP',
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
      tableName: 'TOW_FIRM',
    },
  );
  return TowFirm;
};
