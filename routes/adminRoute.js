const express = require('express');
const adminRoute = express();

const adminController = require("../controllers/adminController")
const bannerController = require("../controllers/bannerController");
const offerController = require("../controllers/offerController");
const couponController = require("../controllers/couponController");
const auth = require("../middleware/auth");
const store = require('../helpers/multer')

adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');

adminRoute.get('/', adminController.loginload);
adminRoute.post('/adminLogin', adminController.homeload);
adminRoute.post('/lineChart', adminController.fetchlineChartData);
adminRoute.post('/barChart', adminController.fetchbarChartData);
adminRoute.post('/pieChart', adminController.fetchpieChartData);

adminRoute.get('/exportPdfDailySales', adminController.exportPdfDailySales);
adminRoute.get('/exportPdfWeeklySales', adminController.exportPdfWeeklySales);
adminRoute.get('/exportPdfYearlySales', adminController.exportPdfYearlySales);

adminRoute.get('/dashboard', auth.adminLogin, adminController.dashboardload);

// ================ user management ================//
adminRoute.get('/userlist', auth.adminLogin, adminController.userlistload);
adminRoute.post("/blockUnblockUser", auth.adminLogin, adminController.userBlockUnblock);
adminRoute.post("/orderList", auth.adminLogin, adminController.orderList);
adminRoute.post("/updateStatus", auth.adminLogin, adminController.updateStatus);
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
adminRoute.get('/categoryEdit/:id', auth.adminLogin, adminController.editCategoryPageLoad);
adminRoute.post('/editCategory', auth.adminLogin,  store.single('image'),adminController.editCategory);
adminRoute.get('/categoryDelete/:id', auth.adminLogin, adminController.deleteCategory);
adminRoute.post('/updateCategory', auth.adminLogin, store.single('image'), adminController.updateCategory);
//======================================================//

//============== banner management ==================//
adminRoute.get("/bannerlist", auth.adminLogin, bannerController.bannerlistload);
adminRoute.get("/bannerCreate", auth.adminLogin, bannerController.createBanner);
adminRoute.post("/addBanner", auth.adminLogin, store.single('image'), bannerController.addNewBanner);
adminRoute.get("/bannerDelete/:id", auth.adminLogin, bannerController.deleteBanner);
//======================================================//

//============== offer management ==================//
adminRoute.get("/offerlist", auth.adminLogin, offerController.offerlistload);
adminRoute.get("/productOfferCreate", auth.adminLogin, offerController.productOfferCreate);
adminRoute.post("/productOfferCreate", auth.adminLogin, offerController.addProductOffer);
adminRoute.get("/productOfferDelete/:id", auth.adminLogin, offerController.deleteProductOffer);
adminRoute.get("/categoryOfferCreate", auth.adminLogin, offerController.categoryOfferCreate);
adminRoute.post("/categoryOfferCreate", auth.adminLogin, offerController.addCategoryOffer);
adminRoute.get("/categoryOfferDelete/:id", auth.adminLogin, offerController.deleteCategoryOffer);

//======================================================//

//============== coupon management ==================//
adminRoute.get("/couponlist", auth.adminLogin, couponController.couponlistload);
adminRoute.get("/couponCreate", auth.adminLogin, couponController.couponCreate);
adminRoute.post("/couponCreate", auth.adminLogin, couponController.addCoupon);
adminRoute.get("/couponDelete/:id", auth.adminLogin, couponController.deleteCoupon);


//======================================================//




adminRoute.get('/adminLogout', adminController.handleLogout);






module.exports = adminRoute;
