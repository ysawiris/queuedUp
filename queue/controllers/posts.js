const Post = require('../models/post');


module.exports = (app) => {

    // CREATE
    app.post('/posts/new', (req, res) => {
        console.log(`${req.user.id}`)
        if (req.user) {
            var post = new Post(req.body);
            post.user = req.user.id;

            post
                .save()
                .then(post => {
                    console.log(`The post: ${post}`)
                    return post.user;
                })
                .then(user => {
                    console.log(`The user: ${user}`)
                    console.log(`The array: ${user.posts}`)
                        // REDIRECT TO THE NEW POST
                    res.redirect('/');
                })
                .catch(err => {
                    console.log(err.message);
                });
        } else {
            return res.status(401); // UNAUTHORIZED
        }
    });
};