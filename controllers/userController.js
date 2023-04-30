const User = require("../models/userModel");
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const homeload = async (req, res) => {
    try {
        res.render("home");
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
const sendOtp = async (req, res) => {
    try {
        const emailExist = await User.findOne({ email: req.body.email });
        if (!emailExist) {
            const generatedOtp = generateOTP();
            saveOtp=generatedOtp;
            name = req.body.name;
            email = req.body.email;
            number = req.body.number;
            password = req.body.password;
            sendOtpMail(email, generatedOtp);
            res.render("otpEnter")
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
      to:email,
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
          res.redirect("/login");
        } else {
            res.render("signup", { footer: "Email already exists" })
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
          req.session.user = req.body.email;
            res.render("home");
        } else {
          res.render("login", { footer: "Email and  Password is  Invalid" });
        }
      } else {
        res.render("login", { footer: "Email and  Password is  Invalid" });
            }}
       catch (error) {
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
    verifyLogin
};