// This file is the entry point for Node. It sets up a few global settings,
// connects to Mongo, and loads the route groups. It also handles the base
// route.

// Load libraries
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongo = require('express-mongo-db');
var cookieSession = require('cookie-session');
var passport = require('passport');
var mongoose = require('mongoose');
var keys = require('./conf/keys');

// Load configs
try {
    var configs = require('./conf/config.js')
} catch (ex) {
    console.error('Could not load configs. Did you forget to create them?')
    console.error(ex)
    process.exit()
}

// Set app configs
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', './views')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// set up session cookies
app.use(cookieSession({
    maxAge: 60 * 60 * 1000, //1 hour
    keys: [keys.session.cookieKey]
}))

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Load routes
var sections = require('./routes/sections.js')
app.use('/section', sections)

var verify = require('./routes/verify.js')
app.use('/', verify)

var admin = require('./routes/admin.js')
app.use('/admin', admin)

var authRoutes = require('./routes/auth-routes');
app.use('/auth', authRoutes);

var profileRoutes = require('./routes/profile-routes');
app.use('/profile', profileRoutes);

// create home route
app.get('/', (req, res) => {
    res.render('home', { user: req.user });
})

// connect to mongodb
mongoose.connect(keys.mongodb.dbURI,{ useMongoClient: true }, () => {
    //console.log('connected to mongodb');
});


// Listen on port in the configs
app.listen(configs.port, () => {
    //console.info('Listening on port ' + configs.port + '...')
});
