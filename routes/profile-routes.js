const express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/user-model');
const Lesson = require('../models/lesson-model');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../conf/keys');
var myUser;
var myLesson;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
// Load configs
try {
    var configs = require('../conf/config.js');
} catch (ex) {
    console.error('Could not load configs. Did you forget to create them?');
    console.error(ex);
    process.exit();
}



const authCheck = (req, res, next) => {
    if(!req.user){
        res.redirect('/auth/login');
    } else {
        next();
    }
};



router.get('/', authCheck, (req, res) => {
    res.render('profile', { user: req.user });
});



//takes you to new user page
router.get('/newUser', authCheck, (req, res, next) => {
    res.render('newUser', { user: req.user });
    //res.send(body);
});



//takes you to new user page
router.get('/license', (req, res, next) => {
    res.render('license', { user: req.user });
    //res.send(body);
});



var getJSON = function(url, callback) {
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};



router.post('/newUser/school', (req, res, next)=> {
  User.findOneAndUpdate({_id: myUser._id}, {school: req.body.schoolname}).then(function(){
  })
  res.location('/profile/newUser');
  res.redirect('/profile/newUser');
});



router.post('/newUser/class', (req, res, next)=> {
  User.findOneAndUpdate({_id: myUser._id}, {class: req.body.class}).then(function(){
  })
  res.location('/profile/newUser');
  res.redirect('/profile/newUser');
});



router.post('/newUser/name', (req, res, next)=> {
  User.findOneAndUpdate({_id: myUser._id}, {firstName: req.body.firstName}).then(function(){
  })
  res.location('/profile/newUser');
  res.redirect('/profile/newUser');
});



router.post('/newUser/year', (req, res, next)=> {
  User.findOneAndUpdate({_id: myUser._id}, {year: req.body.year}).then(function(){
  })
  res.location('/profile/newUser');
  res.redirect('/profile/newUser');
});



router.get('/userid', (req, res, next)=> {
  return myUser._id;
});



passport.serializeUser((user, done) => {
    done(null, user.id);
});



passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});



//authentication of a user, if not current, creates a new user for the db
passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {
        // check if user already exists in our own db
        User.findOne({googleId: profile.id}).then((currentUser) => {
            if(currentUser){
                // already have this user
                myUser = currentUser;
                //console.log(profile);
                done(null, currentUser);
            } else {
                // if not, create user in our db
                myUser = new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    thumbnail: profile._json.image.url,
                    school: "Unknown",
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    language: profile._json.language,
                    isUser: true,
                    year: 0000,
                    class: 0000
                }).save().then((newUser) => {
                    done(null, newUser);
                });
            }
        });
    })
);

module.exports = router;
