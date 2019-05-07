/* Load models and apply config */
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

const config = require('../config/db-config.js')[env];

const db = {};
let sequelize;

if (!_.isNil(config.use_env_variable)) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (!_.isNil(db[modelName].associate)) {
    if (_.isFunction(db[modelName].associate)) {
      db[modelName].associate(db);
    }
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
