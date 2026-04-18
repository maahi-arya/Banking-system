const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema({
    token:{
        type: String,
        required:[true, "token is required to blacklist"],
        unique: [true, "Token is already blacklisted"]
    }
}, {
    timestamps: true
})

tokenBlacklistSchema.index( {createdAt: 1},{   //we want to automatically delete the blacklisted token after 3 days because after 3 days the token will expire and we dont want to store the token in database.  An index is like a shortcut to find data faster, without index mongodb scans all documents
    //Create an index on createdAt field in ascending order (1), if it is -1 then it will create index in descending order
    expireAfterSeconds: 60*60*24*3
})

tokenBlacklistModel = mongoose.model("tokenBlacklist", tokenBlacklistSchema)

module.exports = tokenBlacklistModel;