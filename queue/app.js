const express = require('express'),
    session = require('express-session'),
    passport = require('passport'),
    swig = require('swig'),
    SpotifyStrategy = require('./lib/passport-spotify/index').Strategy;

var path = require('path');

const mongoose = require('mongoose')
const mongo_uri = process.env.MONGODB_URI
mongoose.connect(mongo_uri)


const consolidate = require('consolidate');
const exphbs = require('express-handlebars');
const async = require('async')
const keys = require('./config/keys');

//Import the Spotify API
var SpotifyWebApi = require('node-spotify-api');


var spotifyApi = new SpotifyWebApi({
    id: keys.spotify.clientID,
    secret: keys.spotify.clientSecret,
    callbackURL: 'https://queuedup-v1.herokuapp.com/callback'
});

// var spotify = new Spotify(keys.spotifyKeys)

var http = require('http');

var socketIO = require('socket.io');

const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

const app = express();

const User = require('./models/user');
// Use Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Add after body parser initialization!
app.use(expressValidator());

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing. However, since this example does not
//   have a database of user records, the complete spotify profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Use the SpotifyStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, expires_in
//   and spotify profile), and invoke a callback with a user object.
passport.use(
    new SpotifyStrategy({
            clientID: keys.spotify.clientID,
            clientSecret: keys.spotify.clientSecret,
            callbackURL: 'https://queuedup-v1.herokuapp.com/callback'
        },
        function(accessToken, refreshToken, expires_in, profile, done) {
            // asynchronous verification, for effect...
            process.nextTick(function() {
                // To keep the example simple, the user's spotify profile is returned to
                // represent the logged-in user. In a typical application, you would want
                // to associate the spotify account with a user record in your database,
                // and return that user instead.
                User.findOne({ spotifyId: profile.id })
                    .then((currentUser) => {
                        if (currentUser) {
                            //already have the user
                            console.log('user is: ', currentUser)
                            console.log(accessToken)
                            console.log(expires_in)
                            currentUser.spotifyToken = accessToken
                            currentUser.save()
                                // profile.friendsList = currentUser.friendsList
                                // profile.sentRequest = currentUser.sentRequest
                                // profile.request = currentUser.request
                                // profile.totalRequest = currentUser.totalRequest
                        } else {
                            new User({
                                username: profile.displayName,
                                spotifyId: profile.id,
                                spotifyToken: accessToken
                            }).save().then((newUser) => {
                                console.log('new user created:' + newUser)
                                    // profile.friendsList = newUser.friendsList
                                    // profile.sentRequest = newUser.sentRequest
                                    // profile.request = newUser.request
                                    // profile.totalRequest = newUser.totalRequest
                            })
                        }
                    });
                return done(null, profile);

            });
        }
    )
);

const server = http.createServer(app);
const io = socketIO(server);

require('./socket/friend')(io);

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
    helpers: {
        ifIn: function(elem, list, options) {
            if (list.indexOf(elem) > -1) {
                return options.fn(this);
            }
            return options.inverse(this);
        }
    },
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

// Set Static Folder
app.use(express.static(path.join(__dirname, '/static')));
// Set Static Folder
app.use(express.static(path.join(__dirname, '/config')));

app.engine('html', consolidate.swig);

//Link Controllers
require('./controllers/posts.js')(app, ensureAuthenticated);
require('./controllers/friends.js')(app, ensureAuthenticated);
require('./controllers/queue_friends.js')(app, ensureAuthenticated);

// Set db
require('./data/queue-db');

app.get('/', function(req, res) {
    console.log("i made to the index")
    res.render('index', { user: req.user });

});

app.get('/login', function(req, res) {
    res.render('login', { user: req.user });
});

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
app.get(
    '/auth/spotify',
    passport.authenticate('spotify', {
        scope: ['user-read-email', 'user-read-private', 'user-modify-playback-state'],
        showDialog: true
    }),
    function(req, res) {
        // The request will be redirected to spotify for authentication, so this
        // function will not be called.
    }
);


// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get(
    '/callback',
    passport.authenticate('spotify', { failureRedirect: '/login' }),
    function(req, res) {
        console.log("in the callback function")
        res.redirect('/');
    }
);

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// Set Port
app.set('port', (process.env.PORT || 3000));

// app.listen(app.get('port'), function(){
// 	console.log('Server started on port '+app.get('port'));
// });

server.listen(app.get('port'), function() {
    console.log('listening on port 3000');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}