const express = require('express');
const request = require('request-promise-native');
const { StatusCodeError } = require('request-promise-native/errors');
const { Location, Log, Sequelize } = require('../models');
const locations = require('./locations');
const users = require('./users');

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
    role: 'admin',
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
  if (req.is('json') || req.is('application/json')) {
    const redirect = req.get('referer') || '/';
    return res.redirect(redirect);
  }
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

  router.get('/', async (req, res) => {
    res.locals.page = 'weather';
    try {
      const locs = await Location.findAll();
      res.locals.locations = locs;
      return res.render('index', { title: 'OWI' });
    } catch (e) {
      res.locals.locations = [];
      return res.render('index', { title: 'OWI' });
    }
  });

  router.get('/weather/:id', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let reqBegin = 0;
    const id = parseInt(req.params.id, 10);
    try {
      if (!Number.isNaN(id)) {
        const location = await Location.findByPk(id);
        reqBegin = Date.now();
        const uri = encodeURI(`https://api.apixu.com/v1/current.json?key=ac934d785d05411981e92342191305&q=${location.name}`);
        const result = await request(uri);
        const reqTime = Date.now() - reqBegin;
        await Log.create({
          queryTime: new Date(),
          userIp: ip,
          queryResult: JSON.stringify(result),
          queryDuration: reqTime,
          queryStatus: 'SUCCESSFUL',
          UserId: req.user.id,
          LocationId: id,
        });
        return res.json({ status: true, data: result });
      }
      throw new Error('Bad Request');
    } catch (err) {
      console.log(JSON.parse(err.error));
      if (err instanceof StatusCodeError) {
        const reqTime = Date.now() - reqBegin;
        if (err.statusCode === 400) {
          const { message } = JSON.parse(err.error).error;
          Log.create({
            queryTime: new Date(),
            userIp: ip,
            queryResult: JSON.stringify(err.error),
            queryDuration: reqTime,
            queryStatus: 'SUCCESSFUL',
            UserId: req.user.id,
            LocationId: id,
          });
          return res.json({ status: false, message });
        }
        Log.create({
          queryTime: new Date(),
          userIp: ip,
          queryResult: JSON.stringify(err.error),
          queryDuration: reqTime,
          queryStatus: 'FAILED',
          UserId: req.user.id,
          LocationId: id,
        });
        return res.json({ status: false, message: err.message });
      }
      if (err instanceof Sequelize.BaseError) {
        return res.status(500).end();
      }
      return res.status(400).end();
    }
  });

  router.get('/logout', (req, res) => {
    const redirect = req.get('referer') || '/';
    console.log(redirect);
    req.logout();
    res.redirect(redirect);
  });

  router.use('/locations', locations);
  router.use('/users', users);

  return router;
}
module.exports = init;
