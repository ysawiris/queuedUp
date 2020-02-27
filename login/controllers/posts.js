module.exports = app => {
    // CREATE
    app.post("/posts/new", (req, res) => {
        console.log(req.body);
    });
};