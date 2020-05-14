/* Mongoose Connection */
const mongoose = require("mongoose");
assert = require("assert");

const url = "mongodb://mongo:27017/queue-db";
mongoose.Promise = global.Promise;



let connect = ()=> {
    console.log("attempting connection");
    mongoose.connect(
        url, { useNewUrlParser: true },
        function(err, db) {
            assert.equal(null, err);
            console.log("Connected successfully to database");
    
            // db.close(); turn on for testing
        }
    );
    mongoose.connection.on("error", console.error.bind(console, "MongoDB connection Error:"));
    mongoose.set("debug", true);
    
}

let timeout =  setTimeout(connect, 50000);

module.exports = mongoose.connection;