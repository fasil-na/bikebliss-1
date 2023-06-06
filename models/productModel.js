const mongoose = require("mongoose");
const Schema = mongoose.Schema;

ObjectId = Schema.ObjectId;
const productSchema = new Schema({
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: Array,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: false,
  },
  color: {
    type: String,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isCategoryDeleted: {
    type: Boolean,
    default: false,
  },
  stock: {
    type: Number,
    required: true,
  },
  offerPrice: {
    type: Number,
  },
  offerPercentage: {
    type: Number,
    default:0,
  },
});
module.exports = mongoose.model("Product", productSchema)
;
