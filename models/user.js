module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
  });

  User.associate = (models) => {
    models.User.belongsTo(models.Role, { onDelete: 'CASCADE', foreignKey: { allowNull: false } });
  };

  return User;
};
