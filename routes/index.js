var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var router = express.Router();

// GET home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user : req.user });
});

// GET registration page for new user
router.get('/register', function(req, res) {
    res.render('register', { title: 'Register', user : req.user, messages: req.flash('info'), errors: req.flash('error') });
});

// POST registration for a new user
router.post('/register', function(req, res) {
  
  // First register it through the model
  User.register(new User({ email : req.body.email }), req.body.password, function(err, user) {
      if (err) {
          console.log(JSON.stringify(err));
          req.flash('error', "Failed to register user account.")
          return res.redirect('/register');        
      }

      // If registration was successful, authenticate the new user
      passport.authenticate('local', { failureRedirect: '/register',  failureFlash: true })(req, res, function () {
        if (err) {

            req.flash('error', err)
            return res.redirect('/register');
        }

        // Send the email registration validation
        emailService.sendEmailVerification(user.emailVerificationToken, function(error){
            if(error){
              req.flash('error', err)
              return res.redirect('/register');
            }

            // Redirect them to the email verification notice
            res.redirect('/verify_email');
        })        
      });
  });
});

// GET the login page
router.get('/login', function(req, res) {
    res.render('login', { title: 'Login', user : req.user });
});

// POST the login info for a new user session
router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function(req, res) {
    res.redirect('/');
});

// GET the logout url to exit a current session
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// GET email verification - when the user has not verified their email address yet
router.get('/verify_email', function(req, res) {
    res.render('verify', { title: 'Verify', messages: req.flash('info'), errors: req.flash('error') });
});

// GET token verification page to validate user account email address
router.get('/verify_email/:token', function(req, res) {
    User.verifyToken(token, function(err){
      if(err){
        req.flash('error', err)
        return res.redirect('/verify_email');
      }

      // Success
      res.redirect('/');      
    });
});

module.exports = router;
