const mongoose = require("mongoose");
const orderSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  item: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        required: true,
      },
    },
  ],
  totalPrice: {
    type: String,
  },
  orderDate: {
    type: Date,
    default:Date.now()
  },
  deliveryDate: {
    type: Date,
    default:Date.now()+7
  },
  status: {
    type: String,
    default:"Placed"
  },
  address: {
    type: Array,
  },
  paymentType: {
    type: String,
  },
});

module.exports = mongoose.model("Order", orderSchema);
