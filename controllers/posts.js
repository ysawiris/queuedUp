const Post = require("../models/post");

module.exports = (app, ensureAuthenticated) => {
	app.get("/posts/new", ensureAuthenticated, (req, res) => {
		res.render("post-new", { user: req.user });
	});

	app.post("/posts/new", ensureAuthenticated, async (req, res) => {
		try {
			const post = new Post({
				title: req.body.title,
				summary: req.body.summary,
				user: req.user.id,
			});
			await post.save();
			res.redirect("/posts");
		} catch (err) {
			console.error(err);
			res.status(400).render("post-new", {
				user: req.user,
				error: "Could not save your message. Please try again.",
			});
		}
	});

	app.get("/posts", ensureAuthenticated, async (req, res) => {
		try {
			const posts = await Post.find({ user: req.user.id })
				.sort({ createdAt: -1 })
				.lean();
			res.render("posts", { posts, user: req.user });
		} catch (err) {
			console.error(err);
			res.status(500).render("posts", { posts: [], user: req.user });
		}
	});
};
