const { createPost, listPosts } = require("../data/redis");

module.exports = (app, ensureAuthenticated) => {
	app.get("/posts/new", ensureAuthenticated, (req, res) => {
		res.render("post-new", { user: req.user });
	});

	app.post("/posts/new", ensureAuthenticated, async (req, res) => {
		try {
			await createPost(req.user.id, {
				title: req.body.title,
				summary: req.body.summary,
			});
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
			const posts = await listPosts(req.user.id);
			res.render("posts", { posts, user: req.user });
		} catch (err) {
			console.error(err);
			res.status(500).render("posts", { posts: [], user: req.user });
		}
	});
};
