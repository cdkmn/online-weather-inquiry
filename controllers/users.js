const express = require('express');
const bcrypt = require('bcryptjs');
const { User, Sequelize } = require('../models');

const router = express.Router();

function hasAuth(req, res, next) {
  if (req.user.role === 'admin') {
    return next();
  }
  return res.status(403).render('errors/403');
}

async function listAll(req, res) {
  try {
    const users = await User.findAll();
    if (users.length > 0) {
      return res.json({ status: true, users });
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
    const result = await User.findAndCountAll({ offset, limit, order: [['id', 'DESC']] });
    if (result.count > 0) {
      return res.json({ status: true, totalCount: result.count, users: result.rows });
    }
    return res.json({ status: false, message: 'User record not found.' });
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
  res.locals.page = 'users';
  res.render('index', { title: 'OWI Users' });
});
router.post('/', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPass = bcrypt.hashSync(password, 8);
    await User.create({ username, password: hashedPass, role });
    return res.json({ status: true });
  } catch (err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      return res.json({ status: false, message: `'${username}' already exists.` });
    }
    return res.status(500).end();
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { username, role } = req.body;
    if (!Number.isNaN(id)) {
      await User.update({ username, role }, { where: { id } });
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

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isNaN(id)) {
      await User.destroy({ where: { id } });
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
