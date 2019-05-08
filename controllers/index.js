const express = require('express');

const pages = [
  { role: null, key: 'weather', text: 'Weather' },
  { role: 'admin', key: 'locations', text: 'Locations' },
  { role: null, key: 'users', text: 'Users' },
  { role: null, key: 'reports', text: 'Reports' },
];
function isAuthenticated(req, res, next) {
  res.locals.pages = pages;
  if (req.isAuthenticated()) {
    res.locals.isLogin = false;
    res.locals.user = req.user;
    return next();
  }
  res.locals.isLogin = true;
  res.locals.user = null;
  return res.render('index', {
    base_url: req.originalUrl,
    title: 'OWI Login',
    error: req.flash('message'),
  });
}

function init(passport) {
  const router = express.Router();

  router.post('/login', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true,
  }));

  router.all('*', isAuthenticated);

  // router.use('/users', require('./users'));

  router.get('/', (req, res) => {
    res.locals.page = 'weather';
    res.render('index', { title: 'OWI' });
  });

  return router;
}
module.exports = init;
