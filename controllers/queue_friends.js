const User = require("../models/user");

module.exports = (app, ensureAuthenticated) => {
	app.get("/accounts", ensureAuthenticated, async (req, res) => {
		try {
			const user = await User.findOne({ spotifyId: req.user.id });
			if (!user) return res.redirect("/");
			res.render("account", {
				user,
				newfriend: user.request,
				passport: req.user,
				friends: user.friendsList,
			});
		} catch (err) {
			console.error(err);
			res.redirect("/");
		}
	});

	app.get("/friends", ensureAuthenticated, async (req, res) => {
		try {
			const user = await User.findOne({ spotifyId: req.user.id });
			if (!user) return res.redirect("/");
			res.render("account", {
				user,
				newfriend: user.request,
				passport: req.user,
				friends: user.friendsList,
			});
		} catch (err) {
			console.error(err);
			res.redirect("/");
		}
	});

	app.get("/friends/:id", ensureAuthenticated, async (req, res) => {
		try {
			const frienduser = await User.findById(req.params.id);
			const user = await User.findOne({ spotifyId: req.user.id });
			if (!frienduser || !user) return res.redirect("/friends");
			res.render("friends-show", {
				user,
				frienduser,
				currentuser: req.user,
			});
		} catch (err) {
			console.error(err);
			res.redirect("/friends");
		}
	});
};
