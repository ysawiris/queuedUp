const User = require("../models/user");
var async = require("async");
const { response } = require("express");
const { name } = require("ejs");

module.exports = (app, ensureAuthenticated) => {
	app.get("/user-search", ensureAuthenticated, (req, res) => {
		User.find({ username: { $ne: req.user.username } }, function (err, users) {
			if (err) throw err;
			var userMap = {};

			users.forEach(function (user) {
				userMap["name"] = user.username;
				userMap["photo"] = user.photo;
				userMap["spotifyId"] = user.spotifyId;
			});

			res.send([userMap]);
		});
	});
	app.get("/search", ensureAuthenticated, (req, res) => {
		var sent = [];
		var friends = [];
		var received = [];
		// this look gets the user friend request so we can display
		User.findOne({ spotifyId: req.user.id })
			.then((currentUser) => {
				if (currentUser) {
					console.log(currentUser.request);
					received = currentUser.request;
					sent = currentUser.sentRequest;
					friends = currentUser.friendsList;
				}
			})
			.catch((err) => {
				console.log(err.message);
			});
		// User.find({ username: { $ne: req.user.username } }, function (err, users) {
		// 	if (err) throw err;
		// 	var userMap = {};

		// 	users.forEach(function (user) {
		// 		userMap[user.username] = 1;
		// 	});

		// 	res.send([userMap]);
		// });

		User.find({ username: { $ne: req.user.username } }, function (err, result) {
			if (err) throw err;

			console.log(result);

			res.render("search", {
				user: req.user,
				result: result,
				sent: sent,
				friends: friends,
				received: received,
			});
		});
	});

	app.post("/search", ensureAuthenticated, (req, res) => {
		var searchfriend = req.body.searchfriend;
		if (searchfriend) {
			var mssg = "";
			if (searchfriend == req.user.username) {
				searchfriend = null;
			}
			User.find({ username: searchfriend }, function (err, result) {
				if (err) throw err;
				res.render("search", {
					result: result,
					mssg: mssg,
				});
			});
		}

		async.parallel(
			[
				function (callback) {
					if (req.body.receiverName) {
						User.findOne({ spotifyId: req.user.id })
							.then((user) => {
								User.update(
									{
										username: req.body.receiverName,
										"request.userId": { $ne: user._id },
										"friendsList.friendId": { $ne: user._id },
									},
									{
										$push: {
											request: {
												userId: user._id,
												username: user.username,
											},
										},
										$inc: { totalRequest: 1 },
									},
									(err, count) => {
										console.log(err);
										callback(err, count);
									}
								);
							})
							.catch((err) => {
								console.log(err.message);
							});
					}
				},
				function (callback) {
					if (req.body.receiverName) {
						User.findOne({ spotifyId: req.user.id })
							.then((user) => {
								User.update(
									{
										username: req.user.username,
										"sentRequest.username": { $ne: req.body.receiverName },
									},
									{
										$push: {
											sentRequest: {
												username: req.body.receiverName,
											},
										},
									},
									(err, count) => {
										callback(err, count);
									}
								);
							})
							.catch((err) => {
								console.log(err.message);
							});
					}
				},
			],
			(err, results) => {
				res.redirect("/search");
			}
		);

		async.parallel(
			[
				// this function is updated for the receiver of the friend request when it is accepted
				function (callback) {
					if (req.body.senderId) {
						User.findOne({ spotifyId: req.user.id })
							.then((user) => {
								User.update(
									{
										_id: user._id,
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
									},
									(err, count) => {
										callback(err, count);
									}
								);
							})
							.catch((err) => {
								console.log(err.message);
							});
					}
				},
				// this function is updated for the sender of the friend request when it is accepted by the receiver
				function (callback) {
					if (req.body.senderId) {
						User.findOne({ spotifyId: req.user.id })
							.then((user) => {
								User.update(
									{
										_id: req.body.senderId,
										"friendsList.friendId": { $ne: user._id },
									},
									{
										$push: {
											friendsList: {
												friendId: user._id,
												friendName: user.username,
											},
										},
										$pull: {
											sentRequest: {
												username: user.username,
											},
										},
									},
									(err, count) => {
										callback(err, count);
									}
								);
							})
							.catch((err) => {
								console.log(err.message);
							});
					}
				},
				function (callback) {
					if (req.body.user_Id) {
						User.findOne({ spotifyId: req.user.id })
							.then((user) => {
								User.update(
									{
										_id: user._id,
										"request.userId": { $eq: req.body.user_Id },
									},
									{
										$pull: {
											request: {
												userId: req.body.user_Id,
											},
										},
										$inc: { totalRequest: -1 },
									},
									(err, count) => {
										callback(err, count);
									}
								);
							})
							.catch((err) => {
								console.log(err.message);
							});
					}
				},

				function (callback) {
					if (req.body.user_Id) {
						User.findOne({ spotifyId: req.user.id })
							.then((user) => {
								User.update(
									{
										_id: req.body.user_Id,
										"sentRequest.username": { $eq: user.username },
									},
									{
										$pull: {
											sentRequest: {
												username: user.username,
											},
										},
									},
									(err, count) => {
										callback(err, count);
									}
								);
							})
							.catch((err) => {
								console.log(err.message);
							});
					}
				},
			],
			(err, results) => {
				res.redirect("/search");
			}
		);
	});
};
