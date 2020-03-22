require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const compression = require('compression');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const path = require('path');
const hbs = require('express-handlebars');
const morgan = require('morgan');
const db = require('./models');
const hbsHelpers = require('./utils/hbsHelpers');
const { validateUserSession, validateUserRole } = require('./utils/authentication');

const app = express();

db.sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

app.use(morgan('dev'));
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, '/views'));
app.engine(
  'hbs',
  hbs({
    helpers: {
      ifEquals: hbsHelpers.ifEquals,
      incrementByOne: hbsHelpers.incrementByOne,
      ifIdInArr: hbsHelpers.ifIdInArr,
      isUserCompetencyIncludes: hbsHelpers.isUserCompetencyIncludes,
      isActive: hbsHelpers.isActive,
    },
    extname: '.hbs',
    layoutDir: `${__dirname}/views/layouts`,
    partialsDir: `${__dirname}/views/partials`,
  }),
);

app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    key: process.env.SESSION_KEY,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  }),
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.flashMessages = req.session.flashMessages;
  delete req.session.flashMessages;
  next();
});

app.use(validateUserSession);
app.use(validateUserRole);

require('./routes')(app);

app.get('*', (req, res) => {
  return res.render('layouts/error', { layout: 'error', partialName: '404' });
});

module.exports = app;
