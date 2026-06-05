const {
	listUsers,
	getUser,
	sendFriendRequest,
	acceptFriendRequest,
	dismissRequest,
} = require("../data/redis");

module.exports = (app, ensureAuthenticated) => {
	app.get("/user-search", ensureAuthenticated, async (req, res) => {
		try {
			const users = await listUsers();
			const userMap = users
				.filter((u) => u.spotifyId !== req.user.id)
				.map((u) => ({ name: u.username, photo: u.photo }));
			res.json(userMap);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to load users" });
		}
	});

	app.get("/current-user", ensureAuthenticated, (req, res) => {
		res.json(req.user || {});
	});

	app.get("/search", ensureAuthenticated, async (req, res) => {
		try {
			const me = await getUser(req.user.id);
			const users = await listUsers();
			res.render("search", {
				user: req.user,
				result: users.filter((u) => u.spotifyId !== req.user.id),
				sent: (me && me.sentRequest) || [],
				friends: (me && me.friendsList) || [],
				received: (me && me.request) || [],
			});
		} catch (err) {
			console.error(err);
			res.status(500).render("error", {
				user: req.user,
				code: 500,
				message: "Couldn't load search.",
			});
		}
	});

	app.post("/search", ensureAuthenticated, async (req, res) => {
		try {
			if (req.body.receiverName) {
				await sendFriendRequest(req.user.id, req.body.receiverName);
			}
			if (req.body.senderId) {
				await acceptFriendRequest(
					req.user.id,
					req.body.senderId,
					req.body.senderName
				);
			}
			if (req.body.user_Id) {
				await dismissRequest(req.user.id, req.body.user_Id);
			}
			res.redirect("/search");
		} catch (err) {
			console.error(err);
			res.redirect("/search");
		}
	});
};
