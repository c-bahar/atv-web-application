module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      surname: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(90),
        allowNull: false,
      },
      roleId: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phoneNumber: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(45),
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
      tableName: 'USER',
    },
  );

  User.associate = (DB) => {
    DB.User.hasOne(DB.UserRole, {
      foreignKey: 'id',
      sourceKey: 'roleId',
    });
  };
  return User;
};
