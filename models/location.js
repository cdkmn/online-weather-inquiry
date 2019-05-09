function init(sequelize, DataTypes) {
  const schema = {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  };

  const Location = sequelize.define('Location', schema);
  return Location;
}
module.exports = init;
