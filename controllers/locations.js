const express = require('express');
const { Location, Sequelize } = require('../models');

const router = express.Router();

function titleCase(str) {
  return str.toLowerCase()
    .split(' ')
    .map(word => (word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');
}

function hasAuth(req, res, next) {
  if (req.user.role === 'admin') {
    return next();
  }
  return res.status(403).render('errors/403');
}

async function listAll(req, res) {
  try {
    const locations = await Location.findAll();
    if (locations.length > 0) {
      return res.json({ status: true, locations });
    }
    return res.json({ status: false, message: 'Location record not found.' });
  } catch (e) {
    return res.status(500).end();
  }
}

async function list(req, res) {
  try {
    const page = parseInt(req.params.page, 10) || 1;
    const limit = parseInt(req.query.quantity, 10) || 20;
    const offset = (page - 1) * limit;
    const result = await Location.findAndCountAll({ offset, limit, order: [['id', 'DESC']] });
    if (result.count > 0) {
      return res.json({ status: true, totalCount: result.count, locations: result.rows });
    }
    return res.json({ status: false, message: 'Location record not found.' });
  } catch (err) {
    console.log(err);
    if (err instanceof Sequelize.BaseError) {
      return res.status(500).end();
    }
    return res.status(400).end();
  }
}

router.all('*', hasAuth);

router.get('/', (req, res) => {
  res.locals.page = 'locations';
  res.render('index', { title: 'OWI Locations' });
});
router.post('/', async (req, res) => {
  try {
    const name = titleCase(req.body.location);
    await Location.create({ name });
    return res.json({ status: true });
  } catch (err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      const name = titleCase(req.body.location);
      return res.json({ status: false, message: `'${name}' already exists.` });
    }
    return res.status(500).end();
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isNaN(id)) {
      await Location.destroy({ where: { id } });
      return res.json({ status: true });
    }
    throw new Error('Bad Request');
  } catch (err) {
    if (err instanceof Sequelize.BaseError) {
      return res.status(500).end();
    }
    return res.status(400).end();
  }
});

router.get('/list', listAll);
router.get('/list/:page', list);

module.exports = router;
