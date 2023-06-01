
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const User = require("../models/userModel");
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Banner = require('../models/bannerModel');
const Wishlist = require("../models/wishlistModel");
const Coupon = require("../models/couponModel");
const Razorpay = require("razorpay");


const { ObjectId } = require("mongodb");

const homeload = async (req, res) => {
  try {
    const category = await Category.find({ isDeleted: false });
    const bannerData = await Banner.find();
    const lastAddedProducts = await Product.find({ isDeleted: false })
      .sort({ _id: -1 })
      .limit(4);
    let userData = null;
    if (req.session.user) {
      const userId = req.session.user;
      userData = await User.findOne({ _id: userId });
      res.render("home", { userData, data: category, bannerData, lastAddedProducts });
    } else {
      res.render("home", { data: category, bannerData, lastAddedProducts });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const loginload = async (req, res) => {
  try {
    res.render("login", { footer: "" });
  } catch (error) {
    console.log(error.message);
  }
};

const signupload = async (req, res) => {
  try {
    res.render("signup", { footer: "" });
  } catch (error) {
    console.log(error.message);
  }
};

const forgot_pass = async (req, res) => {
  try {
    res.render("forgot_pass");
  } catch (error) {
    console.log(error.message);
  }
};
let saveOtp;
let saveForgotPasswordOtp;
let name;
let email;
let number;
let password;
let refCode;
const sendOtp = async (req, res) => {
  try {
    const emailExist = await User.findOne({ email: req.body.email ? req.body.email : email });
    if (!emailExist) {
      if (!saveOtp) {
        let generatedOtp = generateOTP();
        saveOtp = generatedOtp;
        name = req.body.name ? req.body.name : name;
        email = req.body.email ? req.body.email : email;
        number = req.body.number ? req.body.number : number;
        password = req.body.password ? req.body.password : password;
        refCode = req.body.referral
        sendOtpMail(email, generatedOtp);
        res.render("otpEnter", { footer: "" })
        setTimeout(() => {
          saveOtp = null;
        }, 60 * 1000);
      } else {
        res.render("otpEnter", { footer: "", })
      }
    } else {
      res.render("signup", { footer: "Userdata already exists" })
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgotPasswordOtp = async (req, res) => {
  try {
    const emailExist = await User.findOne({ email: req.body.email ? req.body.email : email });
    if (emailExist) {
      if (!saveForgotPasswordOtp) {
        let generatedOtp = generateOTP();
        saveForgotPasswordOtp = generatedOtp;
        email = req.body.email ? req.body.email : email;
        sendForgotPasswordOtpMail(email, generatedOtp);
        res.render("forgotPasswordOtpEnter", { footer: "" })
        setTimeout(() => {
          saveForgotPasswordOtp = null;
        }, 60 * 1000);
      } else {
        res.render("forgotPasswordOtpEnter", { footer: "", })
      }
    } else {
      res.render("forgot_pass", { footer: "Email does not exists" })
    }
  } catch (error) {
    console.log(error.message);
  }
};

function generateOTP() {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

async function sendOtpMail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'fazilfaizy4@gmail.com',
        pass: 'jxrvchrvqwygaflw'
      }
    });
    const mailOptions = {
      from: 'fazilfaizy4@gmail.com',
      to: email,
      subject: 'Your OTP for user verification',
      text: `Your OTP is ${otp}. Please enter this code to verify your account.`
    };
    const result = await transporter.sendMail(mailOptions);
    console.log(result);
  } catch (error) {
    console.log(error.message);
  }
}

async function sendForgotPasswordOtpMail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'fazilfaizy4@gmail.com',
        pass: 'jxrvchrvqwygaflw'
      }
    });
    const mailOptions = {
      from: 'fazilfaizy4@gmail.com',
      to: email,
      subject: 'Your OTP for password resetting',
      text: `Your OTP is ${otp}. Please enter this code to reset your password.`
    };
    const result = await transporter.sendMail(mailOptions);
    console.log(result);
  } catch (error) {
    console.log(error.message);
  }
}

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
}

const verifyOtp = async (req, res) => {
  const userExist = await User.find({ referral: refCode })
  if (userExist.length == 0) {
    const EnteredOtp = req.body.otp;
    if (EnteredOtp === saveOtp) {
      const referralCode = generateReferralCode(8);
      const securedPassword = await securePassword(password);
      const newUser = new User({
        name: name,
        email: email,
        number: number,
        password: securedPassword,
        blockStatus: false,
        referral: referralCode,
      });
      await newUser.save();
      res.render("login", { footer: "Account Created Successfully, Please Login" });
    } else {
      res.render("otpEnter", { footer: "Incorrect OTP" })
    }
  } else {
    const referredUserId = userExist[0]._id
    let existingWalletAmount = userExist[0].wallet;
    let updatedWalletAmount = existingWalletAmount + 100;
    await User.findByIdAndUpdate(referredUserId, { $set: { wallet: updatedWalletAmount } });
    const EnteredOtp = req.body.otp;
    if (EnteredOtp === saveOtp) {
      const referralCode = generateReferralCode(8);
      const securedPassword = await securePassword(password);
      const newUser = new User({
        name: name,
        email: email,
        number: number,
        password: securedPassword,
        blockStatus: false,
        referral: referralCode,
        wallet: 100
      });
      await newUser.save();
      res.render("login", { footer: "Account Created Successfully, Please Login" });
    } else {
      res.render("otpEnter", { footer: "Incorrect OTP" })
    }

  }
}

function generateReferralCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}

const verifyForgotPasswordOtp = async (req, res) => {
  const EnteredForgotPasswordOtp = req.body.otp;
  if (EnteredForgotPasswordOtp === saveForgotPasswordOtp) {
    res.render("passwordReset", { footer: "" });
  } else {
    res.render("forgotPasswordOtpEnter", { footer: "Incorrect OTP" })
  }
}

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    const bannerData = await Banner.find();
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        if (user.blockStatus) {
          res.render("login", { footer: "User Is Blocked" });
        } else {
          req.session.user = user._id;
          const CategoryList = await Category.find({ isDeleted: false });
          const lastAddedProducts = await Product.find({ isDeleted: false })
            .sort({ _id: -1 })
            .limit(4);
          res.render("home", { data: CategoryList, userData: user, bannerData: bannerData, lastAddedProducts });
        }
      } else {
        res.render("login", { footer: "Email and Password is Invalid" });
      }
    } else {
      res.render("login", { footer: "Email and Password is Invalid" });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const resettingPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.body.email;
    const emailExist = await User.findOne({ email: email });
    if (emailExist) {
      const securedPassword = await securePassword(password);
      await User.updateOne({ email: email }, { $set: { password: securedPassword } })
      res.render("login", { footer: "Password Resetted  Successfully , Please Login" });
    } else {
      res.render("passwordReset", { footer: "Incorrect Email" })
    }

  } catch (error) {
    console.log(error.message);
  }
}

const loadMyAccount = async (req, res) => {
  try {
    let session = req.session.user;
    const user = await User.findOne({ _id: session })
    res.render("myAccount", { userData: user, message: "" });
  } catch (error) {
    console.log(error.message);
  }
};

const categoryDetail = async (req, res) => {
  if (req.params.id) {
    try {
      const categoryId = new ObjectId(req.params.id);
      const entireProductData = await Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        }, {
          $match: {
            isDeleted: false,
            "category._id": categoryId
          }
        }
      ])
      const colorOption = [...new Set(entireProductData.map(obj => obj.color))];
      const brandOption = [...new Set(entireProductData.map(obj => obj.brand))];
      const sizeOption = [...new Set(entireProductData.map(obj => obj.size))];

      const productData = await Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        }, {
          $match: {
            isDeleted: false,
            "category._id": categoryId
          }
        },
        {
          $limit: 2
        }
      ]);

      if (req.session.user) {
        userData = req.session.user;
        User.findOne({ _id: userData }).then((user) => {
          res.render("productList", {
            userData: user,
            data: productData,
            brandOption: brandOption,
            sizeOption: sizeOption,
            colorOption: colorOption,
            colorSelected: [],
            brandSelected: [],
            sizeSelected: [],
            categoryId: categoryId,
            page: 1,
            sort: 0
          });
        });
      } else {
        res.render("productList", { data: productData, sort: 0, colorSelected: [], brandSelected: [], sizeSelected: [], brandOption: brandOption, sizeOption: sizeOption, colorOption: colorOption, categoryId: categoryId, page: 1, sort: 0 });
      }
    } catch (error) {
      console.log(error.message);
    }
  }
};

const sortedProductList = async (req, res) => {
  try {
    const categoryId = new ObjectId(req.query.id);
    const entireProductData = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      }, {
        $match: {
          isDeleted: false,
          "category._id": categoryId
        }
      }
    ]);
    const colorOption = [...new Set(entireProductData.map(obj => obj.color))];
    const brandOption = [...new Set(entireProductData.map(obj => obj.brand))];
    const sizeOption = [...new Set(entireProductData.map(obj => obj.size))];


    const sortValue = parseInt(req.query.value, 10)
    const color = req.query.color ? req.query.color.split(",") : []
    const brand = req.query.brand ? req.query.brand.split(",") : []
    const size = req.query.size ? req.query.size.split(",") : []
    const page = parseInt(req.query.page, 10) - 1
    const limitVal = parseInt(req.query.limit, 10)

    let query = {
      isDeleted: false,
      "category._id": categoryId,
    }
    if (brand.length > 0) {
      query.brand = { $in: brand }
    }
    if (size.length > 0) {
      query.size = { $in: size }
    }
    if (color.length > 0) {
      query.color = { $in: color }
    }


    let z = {
      $sort: {
        price: sortValue,
      },
    }

    let y = [
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      }, {
        $match: query,
      },
    ]

    if (sortValue != 0) {
      y.push(z)
    }
    const sortedProductData = await Product.aggregate(y).skip(page).limit(limitVal)
    if (req.session.user) {
      userData = req.session.user;
      User.findOne({ _id: userData }).then((user) => {
        res.render("productList", {
          userData: user,
          data: sortedProductData,
          sort: sortValue, colorSelected: color, brandSelected: brand, sizeSelected: size, brandOption: brandOption, sizeOption: sizeOption, colorOption: colorOption, categoryId: categoryId, page: page + 1
        });
      });
    } else {
      res.render("productList", { data: sortedProductData, sort: sortValue, colorSelected: color, brandSelected: brand, sizeSelected: size, brandOption: brandOption, sizeOption: sizeOption, colorOption: colorOption, categoryId: categoryId, page: page + 1 });
    }

  } catch (error) {
    console.log(error.message);
  }
};


const prodDetails = async (req, res) => {
  if (req.params.id) {
    try {

      const productId = new ObjectId(req.params.id);
      userData = req.session.user;
      const productObj = await Product.aggregate([
        {
          $match: {
            _id: productId
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: "$categoryDetails",
        },
      ]);
      if (req.session.user) {
        User.findOne({ _id: userData }).then((user) => {
          res.render("product", { userData: user, data: productObj, text: "" });
        });
      } else {
        res.render("product", { data: productObj, text: "" });
      }
    } catch (error) {
      console.log(error.message);
    }
  }
};



const loadCart = async (req, res) => {
  try {
    let totalPrice = 0;
    let session = req.session.user;
    const user = await User.findOne({ _id: session })
    const cart = await Cart.findOne({ userId: session })
    const today = new Date();
    const coupon = await Coupon.find({
      expiryDate: { $gte: today },
      usedBy: { $nin: [user._id] }
    });

    if (!cart) {
      res.render("cart", { userData: user, items: [], totalPrice, coupon: coupon });
    } else {
      const cartData = await Cart.aggregate([
        {
          $match: {
            "userId": new ObjectId(session)
          }
        },
        {
          $unwind: "$item",
        },
        {
          $lookup: {
            from: "products",
            localField: "item.product",
            foreignField: "_id",
            as: "item.product",
          },
        },
        {
          $unwind: "$item.product",
        },
        {
          $lookup: {
            from: "categories",
            localField: "item.product.category",
            foreignField: "_id",
            as: "item.product.category",
          },
        },
        {
          $unwind: "$item.product.category",
        },
      ]);
      if (cartData.length > 0) {
        
        for(let i=0;i<cartData.length;i++)
        {totalPrice = totalPrice+(cartData[i].item.product.price*cartData[i].item.quantity)}
        
      } else {
        totalPrice = 0
      }
      res.render("cart", { userData: user, items: cartData, totalPrice, coupon: coupon });
    }

  } catch (err) {
    console.error(err);
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.session.user;
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId });
    const userCart = await Cart.findOne({ userId: userId });
    if (userCart) {
      const itemIndex = userCart.item.findIndex(
        (item) => item.product.toString() == productId
      );
      if (itemIndex >= 0) {
        const updates = [
          {
            updateOne: {
              filter: { userId: userId, "item.product": productId },
              update: { $inc: { "item.$.quantity": 1 } }
            }
          },
          {
            updateOne: {
              filter: { userId: userId },
              update: { $inc: { "totalPrice": Number(product.price) } }
            }
          }
        ];
        await Cart.bulkWrite(updates)
      } else {
        const updates = [
          {
            updateOne: {
              filter: { userId: userId },
              update: {
                $push: {
                  item: {
                    product: productId,
                    price: product.price,
                    quantity: 1,
                  },
                }
              }
            }
          },
          {
            updateOne: {
              filter: { userId: userId },
              update: { $inc: { "totalPrice": Number(product.price) } }
            }
          }
        ];
        await Cart.bulkWrite(updates)
      }
    } else {
      const createNew = await Cart.create({
        userId: userId,
        item: [
          {
            product: productId,
            price: product.price,
            quantity: 1,
          },
        ],
        totalPrice: product.price
      });
    }
    res.redirect('/cart');
  } catch (error) {
    console.log(error);
  }
};

const removeCartItem = async (req, res) => {
  const cartId = req.body.cartId;
  const itemId = req.body.itemId;
  const userId = req.session.user;

  const cartDoc = await Cart.findOne({ _id: cartId });
  const item = cartDoc.item.find((i) => i._id.toString() === itemId);
  const product = await Product.findOne({ _id: item.product });
  let DecPrice = -1 * (item.quantity) * product.price.toFixed(2)
  const updates = [
    {
      updateOne: {
        filter: { userId: new Object(userId) },
        update: { $pull: { item: { _id: itemId } } }
      }
    },
    {
      updateOne: {
        filter: { _id: cartId },
        update: { $inc: { "totalPrice": DecPrice } }
      }
    }
  ];
  await Cart.bulkWrite(updates)

  res.json({ success: true })
}


const decrementOrIncrementCart = async (req, res) => {
  try {
    const cartId = req.body.cartId;
    const itemId = req.body.itemId;
    const value = req.body.value;
    const cartDoc = await Cart.findOne({ _id: cartId });
    const item = cartDoc.item.find((i) => i._id.toString() === itemId);
    const product = await Product.findOne({ _id: item.product });
    let updatedPrice = (item.quantity + value) * product.price.toFixed(2)
    incPrice = value * product.price.toFixed(2)
    if (item) {
      if (item.quantity + value >= product.stock) {
        res.status(400).json({ error: "oooops out of stock" });
      } else {
        if (item.quantity + value == 0) {
          await Cart.updateOne(
            { _id: cartId },
            {
              $pull: {
                item: { "_id": new ObjectId(item._id) }
              }
            }
          )
        }
        const updates = [
          {
            updateOne: {
              filter: { _id: cartId, "item._id": itemId },
              update: { $inc: { "item.$.quantity": value } }
            }
          },
          {
            updateOne: {
              filter: { _id: cartId },
              update: { $inc: { "totalPrice": incPrice } }
            }
          }
        ];
        await Cart.bulkWrite(updates)
        res.json({ success: true });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const applyCoupon = async (req, res) => {
  const userId = req.session.user;
  const couponId = req.body.couponId;
  const couponDoc = await Coupon.findById({ _id: couponId })
  await Coupon.findByIdAndUpdate(couponId, { $push: { usedBy: userId } })
  const percentage = couponDoc.percentage;
  const userCart = await Cart.find({ userId: userId })
  const totalPrice = userCart[0].totalPrice;
  const updatedTotalPrice = Math.round(totalPrice - (totalPrice * percentage / 100))
  await Cart.findOneAndUpdate({ userId: userId }, { $set: { totalPrice: updatedTotalPrice } })
  res.json(updatedTotalPrice)
}

const cancelSelection = async (req, res) => {
  const userId = req.session.user;
  const selectedCouponId = req.body.selectedCouponId;
  const couponDoc = await Coupon.findById({ _id: selectedCouponId })
  await Coupon.findByIdAndUpdate(selectedCouponId, { $pull: { usedBy: userId } })
  const percentage = couponDoc.percentage;
  const userCart = await Cart.find({ userId: userId })
  const totalPrice = userCart[0].totalPrice;
  const updatedTotalPrice = Math.round(totalPrice / (1 - (percentage / 100)))
  await Cart.findOneAndUpdate({ userId: userId }, { $set: { totalPrice: updatedTotalPrice } })
  res.json(updatedTotalPrice)
}

const loadWishlist = async (req, res) => {
  try {
    let userId = req.session.user;
    const userData = await User.findOne({ _id: userId })
    const wishlistData = await Wishlist.findOne({ userId: userId })

    if (!wishlistData) {
      res.render("wishlist", { userData: userData, items: [] });
    } else {
      const wishlistData = await Wishlist.aggregate([
        {
          $match: {
            userId: new ObjectId(userId)
          }
        },
        {
          $unwind: "$item",
        },
        {
          $lookup: {
            from: "products",
            localField: "item.product",
            foreignField: "_id",
            as: "item.product",
          },
        },
        {
          $unwind: "$item.product",
        },
        {
          $lookup: {
            from: "categories",
            localField: "item.product.category",
            foreignField: "_id",
            as: "item.product.category",
          },
        },
        {
          $unwind: "$item.product.category",
        },
      ]);
      res.render("wishlist", { userData: userData, items: wishlistData, });
    }

  } catch (err) {
    console.error(err);
  }
};

const addToWishlist = async (req, res) => {
  try {
    const userId = req.session.user;
    const productId = req.params.id;
    const productObj = await Product.aggregate([
      {
        $match: {
          _id: new ObjectId(productId)
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails",
      },
    ]);
    const userWishlist = await Wishlist.findOne({ userId: userId });
    if (userWishlist) {
      const itemIndex = userWishlist.item.find(
        (item) => item.product.toString() === productId);
      if (itemIndex) {
        res.render("product", { userData: userData, data: productObj, text: "Item already in the wishlist" });
      } else {
        await Wishlist.updateOne({ userId: new ObjectId(userId) }, { $push: { item: { product: productId, } } });
      }
    } else {
      const createNew = await Wishlist.create({
        userId: userId,
        item: [
          {
            product: productId,
          },
        ],
      });
    }
    res.redirect('/wishlist');
  } catch (error) {
    console.log(error);
  }
};

const removeWishlistItem = async (req, res) => {
  const itemId = req.body.itemId;
  const userId = req.session.user;
  await Wishlist.updateOne({ userId: new Object(userId) }, { $pull: { item: { product: { _id: itemId } } } })
  res.json({ success: true })
}

const addToCartFromWishlist = async (req, res) => {
  try {
    const userId = req.session.user;
    const productId = req.params.id;
    const product = await Product.findOne({ _id: productId });
    const userCart = await Cart.findOne({ userId: userId });
    if (userCart) {
      const itemIndex = userCart.item.findIndex(
        (item) => item.product.toString() == productId
      );
      if (itemIndex >= 0) {
        const updates = [
          {
            updateOne: {
              filter: { userId: userId, "item.product": productId },
              update: { $inc: { "item.$.quantity": 1 } }
            }
          },
          {
            updateOne: {
              filter: { userId: userId },
              update: { $inc: { "totalPrice": Number(product.price) } }
            }
          },

        ];
        await Cart.bulkWrite(updates)
        await Wishlist.updateOne({ userId: new Object(userId) }, { $pull: { item: { product: { _id: productId } } } })
      } else {
        const updates = [
          {
            updateOne: {
              filter: { userId: userId },
              update: {
                $push: {
                  item: {
                    product: productId,
                    price: product.price,
                    quantity: 1,
                  },
                }
              }
            }
          },
          {
            updateOne: {
              filter: { userId: userId },
              update: { $inc: { "totalPrice": Number(product.price) } }
            }
          }
        ];
        await Cart.bulkWrite(updates)
        await Wishlist.updateOne({ userId: new Object(userId) }, { $pull: { item: { product: { _id: productId } } } })
      }
    } else {
      const createNew = await Cart.create({
        userId: userId,
        item: [
          {
            product: productId,
            price: product.price,
            quantity: 1,
          },
        ],
        totalPrice: product.price
      });
      await Wishlist.updateOne({ userId: new Object(userId) }, { $pull: { item: { product: { _id: productId } } } })
    }
    res.redirect('/cart');
  } catch (error) {
    console.log(error);
  }
};

const loadCheckOut = async (req, res) => {
  let totalPrice=0
  let userId = new ObjectId(req.session.user)
  const user = await User.findOne({ _id: userId })
  const cartData = await Cart.aggregate([
    {
      $match: {
        "userId": new ObjectId(user)
      }
    },
    {
      $unwind: "$item",
    },
    {
      $lookup: {
        from: "products",
        localField: "item.product",
        foreignField: "_id",
        as: "item.product",
      },
    },
    {
      $unwind: "$item.product",
    },
    {
      $lookup: {
        from: "categories",
        localField: "item.product.category",
        foreignField: "_id",
        as: "item.product.category",
      },
    },
    {
      $unwind: "$item.product.category",
    },
  ]);
  if (cartData.length > 0) {
        for(let i=0;i<cartData.length;i++)
        {totalPrice = totalPrice+(cartData[i].item.product.price*cartData[i].item.quantity)}
    res.render("checkout", { userData: user, items: cartData, totalPrice });
  } else {
    totalPrice = 0
    res.redirect("/cart")
  }
};

const addAddress = async (req, res) => {
  try {
    const data = req.body;
    const userId = new ObjectId(req.session.user);
    const userData = await User.find({ _id: userId });
    if (!userData || userData.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userData[0];
    user.address.push(data);
    await user.save();
    res.redirect("/checkout");
  }
  catch (error) {
    console.log(error);
  }
};

const addAddressFromProfile = async (req, res) => {
  try {
    const data = req.body;
    const userId = new ObjectId(req.session.user);
    const userData = await User.find({ _id: userId });
    if (!userData || userData.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = userData[0];
    user.address.push(data);
    await user.save();
    res.redirect("/myAccount");
  }
  catch (error) {
    console.log(error);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const addressIndex = req.params.index;
    let userId = req.session.user;
    const userDoc = await User.findOne({ _id: userId });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }
    userDoc.address.splice(addressIndex, 1);
    await userDoc.save();
    const userData = await User.findOne({ _id: userId });
    res.redirect("/myAccount");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const editName = async (req, res) => {
  try {
    const newName = req.body.newName;
    let userId = req.session.user;
    await User.findByIdAndUpdate({ _id: userId }, { name: newName });
    const userData = await User.findOne({ _id: userId });
    res.render("myAccount", { userData: userData, message: "" });
  } catch (error) {
    console.log(error);
  }
};

const editEmail = async (req, res) => {
  try {
    const newEmail = req.body.newEmail;
    let userId = req.session.user;
    const emailExist = await User.find({ email: newEmail });
    if (emailExist.length === 0) {
      await User.findByIdAndUpdate({ _id: userId }, { email: newEmail });
      const userData = await User.findOne({ _id: userId });
      res.render("myAccount", { userData: userData, message: "" });
    } else {
      const userData = await User.findOne({ _id: userId });
      res.render("myAccount", { userData: userData, message: "Email already exists" });
    }
  } catch (error) {
    console.log(error);
  }
};

const editNumber = async (req, res) => {
  try {
    const newNumber = req.body.newNumber;
    let userId = req.session.user;
    const numberExist = await User.find({ number: newNumber });
    if (numberExist.length === 0) {
      await User.findByIdAndUpdate({ _id: userId }, { number: newNumber });
      const userData = await User.findOne({ _id: userId });
      res.render("myAccount", { userData: userData, message: "" });
    } else {
      const userData = await User.findOne({ _id: userId });
      res.render("myAccount", { userData: userData, message: "Number already exists" });
    }
  } catch (error) {
    console.log(error);
  }
};


const placeOrder = async (req, res) => {
  try {
    let totalPrice=0
    const paymentArray = ["COD", "UPI", "Credit/Debit Card"]
    const addressId = req.query.addressId;
    const paymentMethod = req.query.payment;
    const wallet = parseInt(req.query.wallet, 10);
    const userId = new ObjectId(req.session.user);
    const userData = await User.findOne({ _id: userId });
    const update = await User.findByIdAndUpdate(userId, { $set: { wallet: userData.wallet - wallet } })
    const cartData = await Cart.aggregate([
      {
        $match: {
          "userId": userId
        }
      },
      {
        $unwind: "$item",
      },
      {
        $lookup: {
          from: "products",
          localField: "item.product",
          foreignField: "_id",
          as: "item.product",
        },
      },
      {
        $unwind: "$item.product",
      },
      {
        $lookup: {
          from: "categories",
          localField: "item.product.category",
          foreignField: "_id",
          as: "item.product.category",
        },
      },
      {
        $unwind: "$item.product.category",
      },
    ]);
    let orderData = {}
    orderData.userId = userId;
    orderData.item = []
    for (let i = 0; i < cartData.length; i++) {
      cartData[i].item.price=cartData[i].item.product.price
      orderData.item.push(cartData[i].item)
    }
    for(let i=0;i<cartData.length;i++)
    {
      totalPrice = totalPrice+(cartData[i].item.product.price*cartData[i].item.quantity)
    }
    orderData.totalPrice = totalPrice;
    orderData.address = userData.address[addressId];
    orderData.paymentType = paymentArray[paymentMethod];
    if (true) {

      const createNew = await Order.create(orderData);
      const deletCart = await Cart.deleteOne({ userId: userId })
      const updates = []
      for (let i = 0; i < cartData.length; i++) {
        if(cartData[i].item.product.stock<cartData[i].item.quantity){
          res.render("orderFailure")
        }
        let update = {
          updateOne: {
            filter: { _id: cartData[i].item.product },
            update: { $inc: { "stock": -1 * cartData[i].item.quantity } }
          }
        }
        updates.push(update)
      }

      await Product.bulkWrite(updates)

      res.render("orderSuccess")
    }


  } catch (error) {
    console.log(error);
  }
};
const checkOrder = async (req, res) => {
  const userId = req.body.userId
  res.json({status:true})
  const cartData = await Cart.aggregate([
    {
      $match: {
        "userId": new ObjectId(userId)
      }
    },
    {
      $unwind: "$item",
    },
    {
      $lookup: {
        from: "products",
        localField: "item.product",
        foreignField: "_id",
        as: "item.product",
      },
    },
    {
      $unwind: "$item.product",
    },
    {
      $lookup: {
        from: "categories",
        localField: "item.product.category",
        foreignField: "_id",
        as: "item.product.category",
      },
    },
    {
      $unwind: "$item.product.category",
    },
  ]);

  for(i=0;i<cartData.length;i++)
  {
    if(cartData[i].item.product.stock<cartData[i].item.quantity)
    {
      res.json({status:false})
    }
  }
  res.json({status:true})
}

const orderData = async (req, res) => {
  try {
    let userId = new ObjectId(req.session.user);
    const user = await User.findOne({ _id: userId });
    const orderDetails = await Order.aggregate([
      {
        $match: { userId: userId }
      },
      {
        $lookup: {
          from: "products",
          localField: "item.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },{
        $sort:{_id:-1}
      }
    ]);
    orderDetails.forEach((order) => {
      order.orderDate = order.orderDate.toISOString().split("T")[0];
      order.deliveryDate = order.deliveryDate.toISOString().split("T")[0];
    });
    res.render("orders", { userData: user, orderData: orderDetails });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    let userId = new ObjectId(req.session.user);
    const user = await User.findOne({ _id: userId });
    const orderDetails = await Order.findById({ _id: orderId })
    const updates = []
    for (let i = 0; i < orderDetails.item.length; i++) {
      let update = {
        updateOne: {
          filter: { _id: orderDetails.item[i].product },
          update: { $inc: { "stock": orderDetails.item[i].quantity } }
        }
      }
      updates.push(update)
    }
    await Product.bulkWrite(updates)
    await Order.updateOne({ _id: orderId }, { $set: { status: "Cancelled" } })
    res.redirect("/orders");
  } catch (error) {
    console.log(error.message);
  }
};

const handleLogout = async (req, res) => {
  try {
    req.session.user = false;
    res.render("login", { footer: "Logged Out Successfully" });
  } catch (error) {
    console.log(error.message);
  }
};

const createRP = async (req, res) => {
  const userId = req.body.userId.replace(/\s/g, "")
  const wallet = req.body.wallet
  const cartData = Cart.findOne({ userId: new ObjectId(userId) })
  const userData = await User.findById(userId)
  let instance = new Razorpay({ key_id: 'rzp_test_Z6ogCp3lsMS6mX', key_secret: "GfeGBYD3Jojxqd7vdqZoRzzP" })
  if (wallet) {
    var amount = cartData.totalPrice - userData.wallet
  } else {
    var amount = cartData.totalPrice
  }
  var amount = 100
  let options = {
    amount: amount,
    currency: "INR",
    receipt: "order_rcptid_11"
  };
  instance.orders.create(options, function (err, order) {
    res.json({ rpOrderId: order.id });

  });
}

module.exports = {
  loginload,
  homeload,
  signupload,
  forgot_pass,
  sendOtp,
  verifyOtp,
  verifyLogin,
  categoryDetail,
  loadMyAccount,
  prodDetails,
  handleLogout,
  forgotPasswordOtp,
  sendForgotPasswordOtpMail,
  verifyForgotPasswordOtp,
  resettingPassword,
  loadCart,
  addToCart,
  decrementOrIncrementCart,
  removeCartItem,
  applyCoupon,
  cancelSelection,
  loadCheckOut,
  addAddress,
  addAddressFromProfile,
  deleteAddress,
  editName,
  editEmail,
  editNumber,
  placeOrder,
  checkOrder,
  orderData,
  cancelOrder,
  loadWishlist,
  addToWishlist,
  removeWishlistItem,
  addToCartFromWishlist,
  sortedProductList,
  createRP

};