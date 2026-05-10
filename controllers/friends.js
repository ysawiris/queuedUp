const User = require("../models/user");

module.exports = (app, ensureAuthenticated) => {
	app.get("/user-search", ensureAuthenticated, async (req, res) => {
		try {
			const users = await User.find(
				{ username: { $ne: req.user.username } },
				"username photo"
			).lean();
			const userMap = users.map((u) => ({ name: u.username, photo: u.photo }));
			res.json(userMap);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to load users" });
		}
	});

	app.get("/current-user", ensureAuthenticated, (req, res) => {
		if (!req.user) return res.json({});
		res.json(req.user);
	});

	app.get("/search", ensureAuthenticated, async (req, res) => {
		try {
			const currentUser = await User.findOne({ spotifyId: req.user.id }).lean();
			const received = currentUser?.request || [];
			const sent = currentUser?.sentRequest || [];
			const friends = currentUser?.friendsList || [];

			const result = await User.find({
				username: { $ne: req.user.username },
			}).lean();

			res.render("search", {
				user: req.user,
				result,
				sent,
				friends,
				received,
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
			const me = await User.findOne({ spotifyId: req.user.id });
			if (!me) return res.redirect("/search");

			if (req.body.receiverName && req.body.receiverName !== me.username) {
				await User.updateOne(
					{
						username: req.body.receiverName,
						"request.userId": { $ne: me._id },
						"friendsList.friendId": { $ne: me._id },
					},
					{
						$push: {
							request: { userId: me._id, username: me.username },
						},
						$inc: { totalRequest: 1 },
					}
				);

				await User.updateOne(
					{
						username: me.username,
						"sentRequest.username": { $ne: req.body.receiverName },
					},
					{
						$push: { sentRequest: { username: req.body.receiverName } },
					}
				);
			}

			if (req.body.senderId) {
				await User.updateOne(
					{
						_id: me._id,
						"friendsList.friendId": { $ne: req.body.senderId },
					},
					{
						$push: {
							friendsList: {
								friendId: req.body.senderId,
								friendName: req.body.senderName,
							},
						},
						$pull: {
							request: {
								userId: req.body.senderId,
								username: req.body.senderName,
							},
						},
						$inc: { totalRequest: -1 },
					}
				);

				await User.updateOne(
					{
						_id: req.body.senderId,
						"friendsList.friendId": { $ne: me._id },
					},
					{
						$push: {
							friendsList: { friendId: me._id, friendName: me.username },
						},
						$pull: { sentRequest: { username: me.username } },
					}
				);
			}

			if (req.body.user_Id) {
				await User.updateOne(
					{
						_id: me._id,
						"request.userId": req.body.user_Id,
					},
					{
						$pull: { request: { userId: req.body.user_Id } },
						$inc: { totalRequest: -1 },
					}
				);

				await User.updateOne(
					{
						_id: req.body.user_Id,
						"sentRequest.username": me.username,
					},
					{ $pull: { sentRequest: { username: me.username } } }
				);
			}

			res.redirect("/search");
		} catch (err) {
			console.error(err);
			res.redirect("/search");
		}
	});
};
