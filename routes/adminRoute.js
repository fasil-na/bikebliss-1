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

adminRoute.get('/dashboard', auth.adminLogin, adminController.dashboardload);

// ================ user management ================//
adminRoute.get('/userlist', auth.adminLogin, adminController.userlistload);
adminRoute.post("/blockUnblockUser", auth.adminLogin, adminController.userBlockUnblock);
//======================================================//

// ================ product management ================//
adminRoute.get('/productlist', auth.adminLogin, adminController.prodlistload);
adminRoute.get('/prodCreate', auth.adminLogin, adminController.createProduct);
adminRoute.post('/addProduct', auth.adminLogin, store.array('image', 3), adminController.addNewProduct);
adminRoute.get('/productDelete/:id', auth.adminLogin, adminController.deleteProduct);
adminRoute.post('/updateProduct', auth.adminLogin, store.array('image', 3), adminController.updateProduct);
//======================================================//

//============== category management ==================//
adminRoute.get('/categorylist', auth.adminLogin, adminController.catlistload);
adminRoute.get('/catCreate', auth.adminLogin, adminController.createCategory);
adminRoute.post('/addCategory', auth.adminLogin, store.single('image'), adminController.addNewCategory);
adminRoute.get('/categoryDelete/:id', auth.adminLogin, adminController.deleteCategory);
adminRoute.post('/updateCategory', auth.adminLogin, store.single('image'), adminController.updateCategory);
//======================================================//



adminRoute.get('/adminLogout', adminController.logoutload);






module.exports = adminRoute;
