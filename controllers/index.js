const express = require('express');

const router = express.Router();

router.use('/users', require('./users'));

router.get('/', (req, res) => {
  res.render('index');
});

module.exports = router;
