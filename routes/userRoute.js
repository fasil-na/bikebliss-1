var express = require('express');
const userRoute=express();
// var userRoute = express.Router();
const auth=require("../middleware/auth");
const userController=require("../controllers/userController")

userRoute.set('view engine','ejs');
userRoute.set('views','./views/user');

userRoute.get('/', userController.homeload);
userRoute.get('/login', userController.loginload);
userRoute.get('/signup', userController.signupload);
userRoute.get('/forgot_pass', userController.forgot_pass);

userRoute.post('/signup',userController.sendOtp);
userRoute.post('/otpEnter',userController.verifyOtp);

userRoute.post('/login', userController.verifyLogin);
userRoute.get('/login/catDetails/:id', userController.categoryDetail);
userRoute.get('/login/prodDetails/:id', userController.prodDetails);
module.exports = userRoute;
