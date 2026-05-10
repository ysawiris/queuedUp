require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const { Server: SocketIOServer } = require("socket.io");

const SpotifyStrategy = require("./lib/passport-spotify").Strategy;
const User = require("./models/user");
const connectDb = require("./data/queue-db");

const PORT = process.env.PORT || 8080;
const SESSION_SECRET = process.env.SESSION_SECRET;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_CALLBACK_URL =
	process.env.SPOTIFY_CALLBACK_URL || `http://localhost:${PORT}/callback`;

if (!SESSION_SECRET) {
	throw new Error("SESSION_SECRET must be set in the environment.");
}
if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
	throw new Error(
		"SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in the environment."
	);
}

const app = express();

app.use(
	helmet({
		contentSecurityPolicy: false,
	})
);
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
	new SpotifyStrategy(
		{
			clientID: SPOTIFY_CLIENT_ID,
			clientSecret: SPOTIFY_CLIENT_SECRET,
			callbackURL: SPOTIFY_CALLBACK_URL,
		},
		async (accessToken, refreshToken, expires_in, profile, done) => {
			try {
				const photo = profile.photos && profile.photos[0];
				const existing = await User.findOne({ spotifyId: profile.id });

				if (existing) {
					existing.spotifyToken = accessToken;
					if (photo) existing.photo = photo;
					await existing.save();
				} else {
					await new User({
						username: profile.displayName || profile.id,
						photo,
						spotifyId: profile.id,
						spotifyToken: accessToken,
					}).save();
				}
				return done(null, profile);
			} catch (err) {
				return done(err);
			}
		}
	)
);

app.engine(
	"handlebars",
	exphbs.engine({
		defaultLayout: "main",
		helpers: {
			ifIn(elem, list, options) {
				if (Array.isArray(list) && list.indexOf(elem) > -1) {
					return options.fn(this);
				}
				return options.inverse(this);
			},
		},
	})
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(
	session({
		secret: SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			maxAge: 1000 * 60 * 60 * 24 * 7,
		},
	})
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));
app.use("/static", express.static(path.join(__dirname, "views/static")));

require("./controllers/posts")(app, ensureAuthenticated);
require("./controllers/friends")(app, ensureAuthenticated);
require("./controllers/queue_friends")(app, ensureAuthenticated);

connectDb();

app.get("/", (req, res) => {
	res.render("index", { user: req.user });
});

app.get("/login", (req, res) => {
	if (req.user) return res.redirect("/");
	res.render("login", { user: req.user });
});

app.get(
	"/auth/spotify",
	passport.authenticate("spotify", {
		scope: [
			"user-read-email",
			"user-read-private",
			"user-modify-playback-state",
		],
		showDialog: true,
	})
);

app.get(
	"/callback",
	passport.authenticate("spotify", { failureRedirect: "/login" }),
	(req, res) => res.redirect("/")
);

app.get("/logout", (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err);
		res.redirect("/");
	});
});

app.get("/healthcheck", (req, res) => res.json({ status: "UP" }));

app.use((req, res) => {
	res.status(404).render("error", {
		user: req.user,
		code: 404,
		message: "We couldn't find that page.",
	});
});

app.use((err, req, res, _next) => {
	console.error(err);
	res.status(500).render("error", {
		user: req.user,
		code: 500,
		message: "Something went wrong on our end.",
	});
});

const server = http.createServer(app);
const io = new SocketIOServer(server);
require("./socket/friend")(io);

server.listen(PORT, () => {
	console.log(`Queued Up listening on port ${PORT}`);
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect("/login");
}
