module.exports = (sequelize, DataTypes) => {
  const ParkingType = sequelize.define(
    'ParkingType',
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      description: {
        type: DataTypes.STRING(245),
        allowNull: true,
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
      tableName: 'PARKING_TYPE',
    },
  );
  return ParkingType;
};
