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
    },
    address:{
        type:Array,
      },
      wallet:{
        type:Number,
        default:0,
      },
      referral:{
        type:String,
      }
})

module.exports = mongoose.model("User", userSchema);
