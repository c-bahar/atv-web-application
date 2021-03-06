module.exports = (sequelize, DataTypes) => {
  const AdditionalFee = sequelize.define(
    'AdditionalFee',
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      fee: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
      tableName: 'ADDITIONAL_FEE',
    },
  );
  return AdditionalFee;
};
