const mongoose = require('mongoose');

const wishlistSchema  = mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true,
    },
    item:[{
        product:{
            type:mongoose.Types.ObjectId,
            ref:'Product',
            required:true,
        }
    }],
})

module.exports = mongoose.model('Wishlist',wishlistSchema);