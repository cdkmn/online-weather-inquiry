const express = require('express');
const locations = require('./locations');

const pages = [
  {
    role: null,
    key: 'weather',
    text: 'Weather',
    path: '/',
  },
  {
    role: 'admin',
    key: 'locations',
    text: 'Locations',
    path: '/locations',
  },
  {
    role: null,
    key: 'users',
    text: 'Users',
    path: 'users',
  },
  {
    role: null,
    key: 'reports',
    text: 'Reports',
    path: 'reports',
  },
];
function isAuthenticated(req, res, next) {
  res.locals.pages = pages;
  res.locals.error = req.flash('error');
  if (req.isAuthenticated()) {
    res.locals.isLogin = false;
    res.locals.user = req.user;
    return next();
  }
  res.locals.isLogin = true;
  res.locals.user = null;
  return res.render('index', {
    title: 'OWI Login',
  });
}

function init(passport) {
  const router = express.Router();

  router.post('/login', (req, res, next) => {
    const redirect = req.get('referer') || '/';
    const options = {
      successRedirect: redirect,
      failureRedirect: redirect,
      failureFlash: true,
    };
    passport.authenticate('login', options)(req, res, next);
  });

  router.all('*', isAuthenticated);

  router.get('/', (req, res) => {
    res.locals.page = 'weather';
    res.render('index', { title: 'OWI' });
  });

  router.get('/logout', (req, res) => {
    const redirect = req.get('referer') || '/';
    console.log(redirect);
    req.logout();
    res.redirect(redirect);
  });

  router.use('/locations', locations);

  return router;
}
module.exports = init;
