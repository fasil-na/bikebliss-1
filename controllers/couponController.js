const Coupon = require('../models/couponModel');

const couponlistload = async (req, res) => {
  try {
    const coupondata = await Coupon.find();
    res.render("adminCouponList", { data: coupondata });
  } catch (error) {
    console.log(error.message);
  }
};

const couponCreate = async (req, res) => {
  try {
    res.render("adminCouponCreate");
  } catch (error) {
    console.log(error.message);
  }
};


const addCoupon = async (req, res) => {
  try {
    const coupnCode = req.body.name;
    const couponDiscount = req.body.percentage;
    const expiryDate = req.body.date;
    if (!coupnCode || !couponDiscount || !expiryDate) {
      return res.status(400).send("Missing required fields");
    }
    const lowerCouponCode = coupnCode.toLowerCase();
    const couponExist = await Coupon.findOne({ code: lowerCouponCode });
    if (!couponExist) {
      const newCoupon = new Coupon({
        code: coupnCode,
        percentage: couponDiscount,
        expiryDate: expiryDate,
      });
      await newCoupon.save();
      res.redirect("/admin/couponlist");
    } else {
      res.redirect("/admin/couponCreate");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.redirect("/admin/couponlist");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  couponlistload,
  couponCreate,
  addCoupon,
  deleteCoupon,
};



