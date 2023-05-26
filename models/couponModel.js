const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({

  code: {
    type: String,
    required: true,
  },

  percentage: {
    type: Number,
    required: true,
  },

  expiryDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    default: "Active",
  },

  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]

});

module.exports = mongoose.model('Coupon', couponSchema);









