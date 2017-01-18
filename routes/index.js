var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user : req.user });
});

router.get('/register', function(req, res) {
    console.log(req.flash('error'));
    res.render('register', { title: 'Register', user : req.user, messages: req.flash('info') });
});

router.post('/register', function(req, res) {
  console.log(req.body);
  User.register(new User({ email : req.body.email }), req.body.password, function(err, user) {
      if (err) {
          return res.render('register', { user : user });
      }

      console.log(user);
      passport.authenticate('local', { failureRedirect: '/register',  failureFlash: true })(req, res, function () {
        if (err) {
          console.log(err);
            return next(err);
        }
        res.redirect('/');
      });
  });
});

router.get('/login', function(req, res) {
    res.render('login', { title: 'Login', user : req.user });
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
