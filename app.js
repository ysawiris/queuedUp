require("dotenv").config();

const path = require("path");
const express = require("express");
const passport = require("passport");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const { getIronSession } = require("iron-session");

const SpotifyStrategy = require("./lib/passport-spotify").Strategy;
const { upsertUserOnLogin } = require("./data/redis");
const { loadFreshUser } = require("./lib/spotify");

const PORT = process.env.PORT || 8080;
const SESSION_PASSWORD = process.env.SESSION_PASSWORD;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_CALLBACK_URL =
	process.env.SPOTIFY_CALLBACK_URL || `http://localhost:${PORT}/callback`;

if (!SESSION_PASSWORD || SESSION_PASSWORD.length < 32) {
	throw new Error(
		"SESSION_PASSWORD must be set and at least 32 characters long."
	);
}
if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
	throw new Error(
		"SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in the environment."
	);
}

const sessionOptions = {
	password: SESSION_PASSWORD,
	cookieName: "queued_up_session",
	cookieOptions: {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 60 * 24 * 7,
	},
};

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

passport.use(
	new SpotifyStrategy(
		{
			clientID: SPOTIFY_CLIENT_ID,
			clientSecret: SPOTIFY_CLIENT_SECRET,
			callbackURL: SPOTIFY_CALLBACK_URL,
		},
		async (accessToken, refreshToken, expires_in, profile, done) => {
			try {
				const photo = (profile.photos && profile.photos[0]) || "";
				await upsertUserOnLogin({
					spotifyId: profile.id,
					username: profile.displayName || profile.id,
					photo,
					spotifyToken: accessToken,
					refreshToken,
					expiresIn: expires_in,
				});
				return done(null, {
					id: profile.id,
					username: profile.displayName || profile.id,
					displayName: profile.displayName || profile.id,
					photo,
					profileUrl: profile.profileUrl || "",
				});
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

// Stateless encrypted-cookie session — no server-side store, so this
// works on serverless with no shared memory between invocations.
app.use(async (req, res, next) => {
	try {
		req.session = await getIronSession(req, res, sessionOptions);
		next();
	} catch (err) {
		next(err);
	}
});

app.use(passport.initialize());

// Rebuild the profile-shaped req.user the views/controllers expect
// from the signed session cookie.
app.use((req, res, next) => {
	const u = req.session && req.session.user;
	if (u) {
		req.user = {
			provider: "spotify",
			id: u.spotifyId,
			username: u.username,
			displayName: u.displayName || u.username,
			photos: u.photo ? [u.photo] : [],
			profileUrl: u.profileUrl || "",
		};
	}
	next();
});

app.use(express.static(path.join(__dirname, "public")));

require("./controllers/posts")(app, ensureAuthenticated);
require("./controllers/friends")(app, ensureAuthenticated);
require("./controllers/queue_friends")(app, ensureAuthenticated);

app.get("/", (req, res) => {
	res.render("index", { user: req.user || null });
});

app.get("/login", (req, res) => {
	if (req.user) return res.redirect("/");
	res.render("login", { user: req.user || null });
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
		session: false,
	})
);

app.get(
	"/callback",
	passport.authenticate("spotify", {
		failureRedirect: "/login",
		session: false,
	}),
	async (req, res) => {
		req.session.user = {
			spotifyId: req.user.id,
			username: req.user.username,
			displayName: req.user.displayName,
			photo: req.user.photo,
			profileUrl: req.user.profileUrl,
		};
		await req.session.save();
		res.redirect("/");
	}
);

app.get("/logout", (req, res) => {
	req.session.destroy();
	res.redirect("/");
});

app.get("/healthcheck", (req, res) => res.json({ status: "UP" }));

app.use((req, res) => {
	res.status(404).render("error", {
		user: req.user || null,
		code: 404,
		message: "We couldn't find that page.",
	});
});

app.use((err, req, res, _next) => {
	console.error(err);
	res.status(500).render("error", {
		user: req.user || null,
		code: 500,
		message: "Something went wrong on our end.",
	});
});

function ensureAuthenticated(req, res, next) {
	if (req.user) return next();
	res.redirect("/login");
}

if (require.main === module) {
	app.listen(PORT, () => {
		console.log(`Queued Up listening on port ${PORT}`);
	});
}

module.exports = app;
