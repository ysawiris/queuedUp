const { getUser } = require("../data/redis");
const { loadFreshUser } = require("../lib/spotify");

module.exports = (app, ensureAuthenticated) => {
	const renderAccount = async (req, res) => {
		try {
			const user = await getUser(req.user.id);
			if (!user) return res.redirect("/");
			res.render("account", {
				user,
				newfriend: user.request || [],
				passport: req.user,
				friends: user.friendsList || [],
			});
		} catch (err) {
			console.error(err);
			res.redirect("/");
		}
	};

	app.get("/accounts", ensureAuthenticated, renderAccount);
	app.get("/friends", ensureAuthenticated, renderAccount);

	app.get("/friends/:id", ensureAuthenticated, async (req, res) => {
		try {
			// loadFreshUser refreshes Spotify tokens so the rendered
			// friend/user tokens the client uses aren't already expired.
			const frienduser = await loadFreshUser(req.params.id);
			const user = await loadFreshUser(req.user.id);
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
