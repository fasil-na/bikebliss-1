var express = require('express');
const adminRoute = express();
// var adminRoute = express.Router();

const adminController = require("../controllers/adminController")
const auth = require("../middleware/auth");
const store = require('../helpers/multer')

adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');

adminRoute.get('/', adminController.loginload);
adminRoute.post('/adminLogin', adminController.homeload);

adminRoute.get('/userlist', auth.adminLogin, adminController.userlistload);
adminRoute.get('/dashboard', auth.adminLogin, adminController.dashboardload);
adminRoute.post("/blockUnblockUser", auth.adminLogin, adminController.userBlockUnblock);

// ================ product management ================//
adminRoute.get('/productlist', auth.adminLogin, adminController.prodlistload);
adminRoute.get('/prodCreate', auth.adminLogin, adminController.createProduct);
adminRoute.post('/addProduct', auth.adminLogin, store.single('image'), adminController.addNewProduct);
//======================================================//
//============== category management ==================//
adminRoute.post('/addCategory', auth.adminLogin, store.single('image'), adminController.addNewCategory);
adminRoute.get('/catCreate', auth.adminLogin, adminController.createCategory);
adminRoute.get('/categorylist', auth.adminLogin, adminController.catlistload);
adminRoute.get('/categoryDelete', auth.adminLogout, adminController.deleteCategory);
adminRoute.post('/updateCategory', auth.adminLogin, store.single('image'), adminController.updateCategory);
//======================================================//






module.exports = adminRoute;
