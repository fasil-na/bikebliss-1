const mongoose = require("mongoose");

const offerSchema = mongoose.Schema({

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Prodcut",
    },
    startdate: {
        type: String,
        required: true,
    },
    percentage: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("Offer", offerSchema);