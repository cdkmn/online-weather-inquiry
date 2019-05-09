const express = require('express');
const { Location } = require('../models');

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
function list(req, res) {
  try {
    const page = parseInt(req.params.page, 10) || 1;
    const limit = parseInt(req.query.quantity, 10) || 20;
    const offset = (page - 1) * limit;
    Location.count()
      .then((totalCount) => {
        let status = false;
        if (totalCount > 0) {
          status = true;
          Location.findAll({ offset, limit })
            .then(locations => res.json({ status, totalCount, locations }))
            .catch((err) => {
              console.log(err);
              res.status(500).end();
            });
        }
        res.json({ status, message: 'Location record not found.' });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).end();
      });
  } catch (e) {
    res.status(400).end();
  }
}

router.all('*', hasAuth);

router.get('/', (req, res) => {
  res.locals.page = 'locations';
  res.render('index', { title: 'OWI Locations' });
});

router.get('/list', list);
router.get('/list/:page', list);

router.post('/add', (req, res) => {
  try {
    const name = titleCase(req.body.location);
    Location.create({ name })
      .then(() => {
        res.json({ status: true });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).end();
      });
  } catch (e) {
    res.status(500).end();
  }
});

module.exports = router;
