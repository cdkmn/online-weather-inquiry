function associate(models) {
  models.User.hasMany(models.Log);
}
function init(sequelize, DataTypes) {
  const schema = {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM,
      values: ['admin', 'standard'],
      allowNull: false,
    },
  };
  const User = sequelize.define('User', schema);
  User.associate = associate;
  return User;
}
module.exports = init;
