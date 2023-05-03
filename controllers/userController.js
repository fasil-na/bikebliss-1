const User = require("../models/userModel");
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const { ObjectId } = require("mongodb");

const homeload = async (req, res) => {
  try {
    const CategoryList = await Category.find({});
    res.render("home", { data: CategoryList, sessionCheck: false, Email: "" });
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
let name;
let email;
let number;
let password;
let otpExpirationTime;
const sendOtp = async (req, res) => {
  try {
    const emailExist = await User.findOne({ email: req.body.email?req.body.email:email });
    if (!emailExist) {
      if(!saveOtp){
        let generatedOtp = generateOTP();
      saveOtp = generatedOtp;
      name = req.body.name?req.body.name:name;
      email = req.body.email?req.body.email:email;
      number = req.body.number?req.body.number:number;
      password = req.body.password?req.body.password:password;
      sendOtpMail(email, generatedOtp);
      res.render("otpEnter", { footer: "" })
      setTimeout(() => {
        saveOtp=null;
      }, 60 * 1000);
      }else{
        res.render("otpEnter", { footer: "", })
      }
    } else {
      res.render("signup", { footer: "Userdata already exists" })
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
    // Create a Nodemailer transport object
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'fazilfaizy4@gmail.com',
        pass: 'hedhxgkqhzgvhzmj'
      }
    });

    // Define email options
    const mailOptions = {
      from: 'fazilfaizy4@gmail.com',
      to: email,
      subject: 'Your OTP for user verification',
      text: `Your OTP is ${otp}. Please enter this code to verify your account.`
    };

    // Send the email
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
  const EnteredOtp = req.body.otp;
  if (EnteredOtp === saveOtp) {
    const securedPassword = await securePassword(password);
    const newUser = new User({
      name: name,
      email: email,
      number: number,
      password: securedPassword,
      blockStatus: false,
    });
    await newUser.save();
    res.render("login", { footer: "Account Created Successfully, Please Login" });
  } else {
    res.render("otpEnter", { footer: "Incorrect OTP" })
  }
}

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        if (user.blockStatus) {
          res.render("login", { footer: "User Is Blocked" });
        } else {
          req.session.user = req.body.email;
          const CategoryList = await Category.find({});
          res.render("home", { data: CategoryList, sessionCheck: req.session.user ? true : false, Email: req.body.email ? req.body.email : "" });
        }

      } else {
        res.render("login", { footer: "Email and  Password is  Invalid" });
      }
    } else {
      res.render("login", { footer: "Email and  Password is  Invalid" });
    }
  }
  catch (error) {
    console.log(error.message);
  }
};

const categoryDetail = async (req, res) => {
  console.log('requestParam>>>', req.params.id);
  if (req.params.id) {
    try {
      req.session.user = req.session.body;
      console.log(req.session.user, "SessionCheck>>>>");
      const categoryId = new ObjectId(req.params.id);
      const productList = await Product.find({ category: categoryId, isDeleted: false });
      res.render('productList', { data: productList, sessionCheck: req.session.user ? true : false, Email: req.body.email ? req.body.email : "" })
    } catch (error) {
      console.log(error.message);
    }
  }
};

const prodDetails = async (req, res) => {
  if (req.params.id) {
    try {
      const productId = req.params.id;
      const productObj = await Product.findById({ _id: new ObjectId(productId) });
      res.render('product', { data: productObj, sessionCheck: req.session.user ? true : false, Email: req.body.email ? req.body.email : "" })
    } catch (error) {
      console.log(error.message);
    }
  }
};

const logoutload = async (req, res) => {
  try {
    req.session.user = false;
    res.render("login", { footer: "Logged Out Successfully" });
  } catch (error) {
    console.log(error.message);
  }
};



module.exports = {
  loginload,
  homeload,
  signupload,
  forgot_pass,
  sendOtp,
  verifyOtp,
  verifyLogin,
  categoryDetail,
  prodDetails,
  logoutload,
};