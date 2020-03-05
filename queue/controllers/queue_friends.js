const User = require('../models/user');
var async = require('async');

module.exports = (app, ensureAuthenticated) => {

    app.get('/accounts', ensureAuthenticated, function(req, res) {

        const currentUser = req.user.id;

        User.findOne({ 'spotifyId': currentUser })
            .then(user => {
                console.log(`${user}`)
                console.log(user.friendsList[0].friendName)
                User.findOne({ 'username': user.friendsList[0].friendName })
                    .then(usersFriend => {
                        console.log(usersFriend.spotifyToken)
                        res.render("account", { user, newfriend: user.request, passport: req.user, usersFriend });

                    })
                    // console.log(req.user)
                    // res.render("account", { user, newfriend: user.request, passport: req.user });
            })
            .catch(err => {
                console.log(err.message);
            });

        // res.render('account', { user: req.user, newfriend: currentUser.request });
    });

    app.get('/friends', ensureAuthenticated, function(req, res) {
        const currentUser = req.user.id;

        User.findOne({ 'spotifyId': currentUser })
            .then(user => {
                if (user.friendsList) {
                    let friends = user.friendsList
                    console.log(`friends:${user.friendsList}`)

                    res.render("account", { user, newfriend: user.request, passport: req.user, friends });

                } else {
                    res.render("account", { user, newfriend: user.request, passport: req.user });
                }
            })
            .catch(err => {
                console.log(err.message);
            });
    });

    app.get('/friends/:id', ensureAuthenticated, function(req, res) {

        User.findById(req.params.id)
            .then(frienduser => {
                console.log(frienduser)
                res.render('friends-show', { user: req.user, frienduser })
            })
            .catch(err => {
                console.log(err.message);
            });
    });




}