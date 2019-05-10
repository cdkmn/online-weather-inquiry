const path = require('path');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const compression = require('compression');
const { User, sequelize } = require('./models');
const controllers = require('./controllers');

const port = process.env.port || 8080;

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session.  Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing.
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Use the LocalStrategy within Passport.
// Strategies in passport require a `verify` function, which accept
// credentials (in this case, a username and password), and invoke a callback
// with a user object.  In the real world, this would query a database;
// however, in this example we are using a baked-in set of users.
const strategy = new LocalStrategy({ passReqToCallback: true }, (req, username, password, done) => {
  // asynchronous verification, for effect...
  process.nextTick(async () => {
    // Find the user by username.  If there is no user with the given
    // username, or the password is not correct, set the user to `false` to
    // indicate failure and set a flash message.  Otherwise, return the
    // authenticated `user`.
    try {
      const user = await User.findOne({ where: { username } });
      const passValid = bcrypt.compareSync(password, user.password);
      if (passValid) {
        return done(null, user);
      }
      return done(null, false, req.flash('error', 'Invalid password'));
    } catch (e) {
      return done(null, false, req.flash('error', `Unknown user '${username}'`));
    }
  });
});
passport.use('login', strategy);

const app = express();
app.locals._ = _;
// configure Express
// Set .html as the default template extension
app.set('view engine', 'ejs');

// Initialize the ejs template engine
app.engine('html', require('ejs').renderFile);

// Tell express where it can find the templates
app.set('views', path.join(__dirname, '/views'));

// Make the files in the public folder available to the world
app.use(express.static(path.join(__dirname, '/public')));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  name: 'owi-session',
  keys: ['owi-secret', 'jafhkjashfkjh', 'sd13asd54s6d4a'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  cookie: {
    secure: true,
    httpOnly: true,
  },
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(compression());
app.use(controllers(passport));
app.use((req, res) => {
  res.status(404).render('errors/404');
});
sequelize.sync().then(async () => {
  try {
    const defaults = {
      password: bcrypt.hashSync('root', 8),
      role: 'admin',
    };
    await User.findOrCreate({ where: { username: 'root' }, defaults });
    app.listen(port, () => console.log(`Listening on port ${port}`));
  } catch (e) {
    console.log(e);
  }
});
