const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    spotifyId: { type: String, required: true },
    spotifyToken: { type: String, required: true },
    sentRequest: [{
        username: { type: String, default: '' }
    }],
    request: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        username: { type: String, default: '' }
    }],
    friendsList: [{
        friendId: { type: Schema.Types.ObjectId, ref: 'User' },
        friendName: { type: String, default: '' }
    }],
    totalRequest: { type: Number, default: 0 }
});



module.exports = mongoose.model("User", UserSchema);