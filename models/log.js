function associate(models) {
  models.Log.belongsTo(models.User, {
    foreignKey: { allowNull: false },
  });
}
function init(sequelize, DataTypes) {
  const schema = {
    queryTime: { type: DataTypes.STRING, allowNull: false, unique: true },
    locationId: DataTypes.STRING,
    userIp: DataTypes.STRING,
    queryResult: DataTypes.TEXT,
    queryDuration: DataTypes.BIGINT,
    queryStatus: DataTypes.STRING,
  };

  const Log = sequelize.define('Log', schema);
  Log.associate = associate;
  return Log;
}
module.exports = init;
