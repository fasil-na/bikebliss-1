const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    number: {
        type: Number,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    blockStatus: {
        type: Boolean,
    }
})

module.exports = mongoose.model("User", userSchema);
