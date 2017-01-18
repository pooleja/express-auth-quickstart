var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var mongoose = require('mongoose');

// Models
var User = require('./models/user');

// Routes
var index = require('./routes/index');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

require('dotenv').config()

// Connect to mongo
mongoose.connect(process.env.DB_URL);


var app = express();

// Default Session settings
var sess = {
  secret: process.env.SESSION_SECRET,
  cookie: {},  
  saveUninitialized: false, // don't create session until something stored
  resave: false, //don't save session if unmodified
  store: new MongoStore({ 
    mongooseConnection: mongoose.connection,
    touchAfter: 24 * 3600 // time period in seconds
  }) // Use Mongo to store the session state
}

// Production Session settings
if (process.env.ENV === 'PROD') {
  app.set('trust proxy', 1) // trust first proxy 
  sess.cookie.secure = true // serve secure cookies 
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session and Passport
app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Routes
app.use('/', index);

// Set up passport local auth
passport.use(new LocalStrategy({ 
    usernameField: 'email', 
    passwordField: 'password'
  },
  User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.ENV === 'DEV' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
