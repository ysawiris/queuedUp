const mongoose = require("mongoose");

const MONGO_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/queue-db";

async function connectDb() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("MongoDB connected:", mongoose.connection.name);
	} catch (err) {
		console.error("MongoDB connection error:", err.message);
		process.exit(1);
	}

	mongoose.connection.on("error", (err) => {
		console.error("MongoDB error:", err.message);
	});

	mongoose.connection.on("disconnected", () => {
		console.warn("MongoDB disconnected");
	});
}

module.exports = connectDb;
