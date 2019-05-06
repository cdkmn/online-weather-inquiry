module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    key: DataTypes.STRING,
    name: DataTypes.STRING,
  });

  Role.associate = (models) => {
    models.Role.hasMany(models.User);
  };

  return Role;
};
