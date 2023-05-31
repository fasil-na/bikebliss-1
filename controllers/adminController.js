const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const { ObjectId } = require("mongodb");
// const { orderData } = require("./userController");
// const pdf = require("html-pdf");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
// const { response } = require("../app");
// const jsPdf = require("jspdf")
// const PDFDocument = require('pdfkit');
const puppeteer = require('puppeteer');
const { fail } = require("assert");

const loginload = async (req, res) => {
    try {
        res.render("adminlogin", { title: "Admin Login", footer: "" });
    } catch (error) {
        console.log(error.message);
    }
};

const homeload = async (req, res) => {
    try {
        const credential = {
            email: "admin@gmail.com",
            password: "123",
        };
        if (req.body.email == credential.email && req.body.password == credential.password) {
            req.session.admin = req.body.email;
            const userdata = await User.find();

            const orderNumber = await Order.find();

            const sumResult = await Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalPriceSum: { $sum: { $toInt: "$totalPrice" } }
                    }
                }
            ]);

            let currentDate = new Date();
            let dateBefore7Days = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
            const weeklyEarnings = await Order.aggregate([
                {
                    $match: {
                        orderDate: {
                            $gte: dateBefore7Days,
                            $lt: currentDate
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPriceSum: { $sum: { $toInt: "$totalPrice" } }
                    }
                }
            ])

            res.render("adminHome", { data: userdata, totalPriceSum: sumResult, weeklyEarnings: weeklyEarnings, orderNumber: orderNumber });
        }
        else {
            res.render("adminLogin", { title: "Admin Login Page", footer: "Invalid username or password" });
        }

    } catch (error) {
        console.log(error.message);
    }
};

const dashboardload = async (req, res) => {
    try {

        const userdata = await User.find();

        const orderNumber = await Order.find();

        const sumResult = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalPriceSum: { $sum: { $toInt: "$totalPrice" } }
                }
            }
        ]);
        let currentDate = new Date();
        let dateBefore7Days = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
        const weeklyEarnings = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: dateBefore7Days,
                        $lt: currentDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPriceSum: { $sum: { $toInt: "$totalPrice" } }
                }
            }
        ])
        res.render("adminHome", { data: userdata, totalPriceSum: sumResult, weeklyEarnings: weeklyEarnings, orderNumber: orderNumber });
    } catch (error) {
        console.log(error.message);
    }
};

const fetchlineChartData = async (req, res) => {
    try {
        const processedData = await Order.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$orderDate" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: -1
                }
            },
            {
                $limit: 6
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        res.json({ result: processedData });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
};


const fetchbarChartData = async (req, res) => {
    try {

        const processedData = await Order.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$orderDate" }
                    },
                    totalPrice: { $sum: { $toInt: "$totalPrice" } }
                }
            }, {
                $sort: {
                    _id: -1
                }
            },
            {
                $limit: 6
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        res.json({ result: processedData });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
};

const fetchpieChartData = async (req, res) => {
    try {


        const processedData = await Order.aggregate([
            {
                $group: {
                    _id: "$paymentType",
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json({ result: processedData });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
};

const exportPdfDailySales = async (req, res) => {
    try {

        const today = new Date().toISOString().split('T')[0];

        const todaysOrders = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(today),
                        $lt: new Date(today + 'T23:59:59.999Z')
                    }
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            }, {
                $unwind: '$user'
            }, {
                $lookup: {
                    from: "products",
                    localField: "item.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
        ]);

        const orderData = {
            todaysOrders: todaysOrders
        }

        const filePathName = path.resolve(__dirname, "../views/admin/htmlToPdf.ejs")
        const htmlString = fs.readFileSync(filePathName).toString();
        const ejsData = ejs.render(htmlString, orderData)

        await createDailySalesPdf(ejsData);

        const pdfFilePath = 'DailySalesReport.pdf';
        const pdfData = fs.readFileSync(pdfFilePath);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="DailySalesReport.pdf"');

        res.send(pdfData);

    } catch (error) {
        console.log(error.message);
    }
};


const createDailySalesPdf = async (html) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path: 'DailySalesReport.pdf' });
    await browser.close();
};

const exportPdfWeeklySales = async (req, res) => {
    try {

        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() - today.getDay() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const todaysOrders = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: startOfWeek,
                        $lt: endOfWeek
                    }
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            }, {
                $unwind: '$user'
            }, {
                $lookup: {
                    from: "products",
                    localField: "item.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
        ]);

        const orderData = {
            todaysOrders: todaysOrders
        }

        const filePathName = path.resolve(__dirname, "../views/admin/htmlToPdf.ejs")
        const htmlString = fs.readFileSync(filePathName).toString();

        const ejsData = ejs.render(htmlString, orderData)

        await createWeeklySalesPdf(ejsData);

        const pdfFilePath = 'WeeklySalesReport.pdf';
        const pdfData = fs.readFileSync(pdfFilePath);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="WeeklySalesReport.pdf"');

        res.send(pdfData);

    } catch (error) {
        console.log(error.message);
    }
};


const createWeeklySalesPdf = async (html) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path: 'WeeklySalesReport.pdf' });
    await browser.close();
};

const exportPdfYearlySales = async (req, res) => {
    try {

        const today = new Date();
        const year = today.getFullYear();

        const startOfYear = new Date(year, 0, 1);
        startOfYear.setHours(0, 0, 0, 0);

        const endOfYear = new Date(year, 11, 31);
        endOfYear.setHours(23, 59, 59, 999);

        const todaysOrders = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: startOfYear,
                        $lt: endOfYear
                    }
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            }, {
                $unwind: '$user'
            }, {
                $lookup: {
                    from: "products",
                    localField: "item.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
        ]);

        const orderData = {
            todaysOrders: todaysOrders
        }


        const filePathName = path.resolve(__dirname, "../views/admin/htmlToPdf.ejs")
        const htmlString = fs.readFileSync(filePathName).toString();

        const ejsData = ejs.render(htmlString, orderData)

        await createYearlySalesPdf(ejsData);

        const pdfFilePath = 'YearlySalesReport.pdf';
        const pdfData = fs.readFileSync(pdfFilePath);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="YearlySalesReport.pdf"');

        res.send(pdfData);

    } catch (error) {
        console.log(error.message);
    }
};


const createYearlySalesPdf = async (html) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path: 'YearlySalesReport.pdf' });
    await browser.close();
};


const userlistload = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Get the current page from the query parameters
        const limit = 2; // Set the number of users per page

        const totalCount = await User.countDocuments(); // Get the total count of users
        const totalPages = Math.ceil(totalCount / limit); // Calculate the total number of pages

        const skip = (page - 1) * limit; // Calculate the number of users to skip

        const userdata = await User.find().sort({ _id: -1 }).skip(skip).limit(limit); // Fetch the users for the current page

        res.render("adminUserList", { data: userdata, totalPages, currentPage: page });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const userBlockUnblock = (req, res) => {
    const id = req.body.id;
    const type = req.body.type;
    User.findByIdAndUpdate({ _id: id }, { $set: { blockStatus: type === 'block' ? true : false } })
        .then((response) => {
            if (type === "block") {
                req.session.user = false;
            }
            res.json(response);
            res.redirect("/admin/userlist");
        })
        .catch((err) => {
            console.log(err.message);
        });
};

const orderList = async (req, res) => {
    try {
      const userID = new ObjectId(req.body.userId);
      const perPage = 5; 
      const page = parseInt(req.query.page) || 1;
      const totalCount = await Order.countDocuments({ userId: userID });
      const totalPages = Math.ceil(totalCount / perPage);
      const orders = await Order.aggregate([
        {
          $match: { userId: userID }
        },
        {
          $lookup: {
            from: "products",
            localField: "item.product",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        {
          $sort: { _id: -1 }
        },
        {
          $skip: (page - 1) * perPage 
        },
        {
          $limit: perPage 
        }
      ]);
      res.render("adminOrderList", { orderData: orders, totalPages: totalPages, currentPage: page });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Error retrieving order details.");
    }
  };
  

const updateStatus = async (req, res) => {

    try {
        const selectedStatus = req.body.statusvalue;
        const orderId = new ObjectId(req.body.id);
        const filter = { _id: orderId };
        const update = { $set: { status: selectedStatus } };
        await Order.updateOne(filter, update)
    } catch (error) {
        console.log(error.message);
    }
};

const catlistload = async (req, res) => {
    try {
        const categoryData = await Category.find();
        if (categoryData.length > 0) {
            res.render("adminCatList", { data: categoryData, text: "" });
        } else {
            res.render("adminCatList", { data: categoryData, text: "No Category has been added!!!" });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const createCategory = async (req, res) => {
    try {
        res.render("adminCatCreate", { message: "" });
    } catch (error) {
        console.log(error.message);
    }
};

const addNewCategory = async (req, res) => {
    const categoryName = req.body.name;
    const image = req.file;
    const lowerCategoryName = categoryName.toUpperCase();
    try {
        const categoryExist = await Category.findOne({ category: lowerCategoryName });
        if (!categoryExist) {
            const newCategory = new Category({
                category: lowerCategoryName,
                imageUrl: image.filename,
            });
            await newCategory.save().then((response) => {
                res.redirect("/admin/categorylist");
            })
        } else {
            res.render("adminCatCreate", { message: "Category with same name already exist" });
        }
    } catch (error) { }
};

const editCategoryPageLoad = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const categoryData = await Category.findById(categoryId)
        res.render("adminCatedit", { categoryData: categoryData, message: "" });
    } catch (error) {
        console.log(error.message);
    }
};

const editCategory = async (req, res) => {
    try {
        const categoryName = req.body.name;
        const image = req.file;
        const categoryId = req.body.id;
        const catDoc = await Category.findById(categoryId);
        const previousImage = catDoc.imageUrl;
        const lowerCategoryName = categoryName.toUpperCase();
        const categoryExist = await Category.findOne({
            $and: [
                { _id: { $ne: categoryId } },
                { category: lowerCategoryName }
            ]
        });
        if (!categoryExist) {
            if (image) {
                await Category.findByIdAndUpdate(categoryId, {
                    category: lowerCategoryName,
                    imageUrl: image.filename,
                });
            } else {
                await Category.findByIdAndUpdate(categoryId, {
                    category: lowerCategoryName,
                    imageUrl: previousImage.filename,
                });
            }
            res.redirect("/admin/categorylist");
        } else {
            res.render("adminCatedit", { categoryData: catDoc, message: "Category with same name already exists" });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const unlistCategory = async (req, res) => {
    try {
        const idVal = req.params.id;
        await Category.findByIdAndUpdate(idVal, { isDeleted: true });
        await Product.updateMany({ category: idVal }, { isDeleted: true });
        res.redirect('/admin/categorylist');
    } catch (error) {
        console.log(error.message);
    }
};

const listCategory = async (req, res) => {
    try {
        const idVal = req.params.id;
        await Category.findByIdAndUpdate(idVal, { isDeleted: false });
        await Product.updateMany({ category: idVal }, { isDeleted: false });
        res.redirect('/admin/categorylist');
    } catch (error) {
        console.log(error.message);
    }
};


const prodlistload = async (req, res) => {
    try {
      const currentPage = parseInt(req.query.page)?parseInt(req.query.page):1; 
      const pageSize = 5; 
  
      const totalProducts = await Product.countDocuments(); 
      const totalPages = Math.ceil(totalProducts / pageSize); 
  
      const skip = (currentPage - 1) * pageSize; 
  
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
        },
        {
          $sort: { _id: -1 },
        },
        {
          $skip: skip, 
        },
        {
          $limit: pageSize, 
        },
      ]);
  
      if (productData.length > 0) {
        res.render("adminProdList", { data: productData, text: "", totalPages, currentPage });
      } else {
        res.render("adminProdList", { data: productData, text: "No products have been added", totalPages, currentPage });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  

const createProduct = async (req, res) => {
    try {
        const categoryData = await Category.find({});
        res.render("adminProdCreate", {
            category: categoryData, text: ""
        });
    } catch (error) {
        console.log(error.message);
    }
};

const addNewProduct = async (req, res) => {
    try {
        const categoryData = await Category.find({});
        const productName = req.body.name
        const upperProductName = productName.toUpperCase();
        const productExist = await Product.findOne({ productName: upperProductName });
        if (!productExist) {
            const images = req.files.map((file) => {
                return file.filename;
            });
            const productData = new Product({
                productName: req.body.name,
                price: req.body.price,
                offerPrice: req.body.price,
                description: req.body.description,
                category: req.body.category,
                imageUrl: images,
                brand: req.body.brand,
                size: req.body.size,
                color: req.body.color,
                stock: req.body.stock,
                isDeleted: false,
            });
            await productData.save()
                .then((response) => {
                    res.redirect("/admin/productlist");
                })
        } else {
            res.render("adminProdCreate", {
                category: categoryData, text: "Product with same name exist already"
            });

        }
    } catch (error) {
        console.log(error.message);
    }

}

const editProductPageload = async (req, res) => {
    try {
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
                    _id: new ObjectId(req.params.id),
                    isDeleted: false
                }
            }
        ]);
        const categoryData = await Category.find()
        res.render("adminProdEdit", { data: productData, text: "", category: categoryData });
    }
    catch (error) {
        console.log(error.message);
    }
};

const editProduct = async (req, res) => {
    try {
        const { id, productName, price, description, category, brand, size, color, stock } = req.body;
        const images = req.files.map(({ filename }) => filename);
        const offerPrice = price;
        const productDoc = await Product.findById(id);
        const previousImages = productDoc.imageUrl;
        const lowerProductName = productName.toUpperCase();
        const productExist = await Product.findOne({
            $and: [
                { _id: { $ne: id } },
                { productName: lowerProductName }
            ]
        });
        if (!productExist) {
            if (images) {
                await Product.findByIdAndUpdate(id, {
                    productName: lowerProductName,
                    imageUrl: images.filename,
                    price,
                    offerPrice,
                    description,
                    category,
                    brand,
                    size,
                    color,
                    stock
                });
            } else {
                await Product.findByIdAndUpdate(id, {
                    productName: lowerProductName,
                    imageUrl: previousImages.filename,
                    price,
                    offerPrice,
                    description,
                    category,
                    brand,
                    size,
                    color,
                    stock
                });
            }
            res.redirect("/admin/productlist");
        } else {
            const productData = await Product.aggregate([
                {
                    $match: {
                        _id: new ObjectId(id),
                    }
                },
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
                }
            ]);
            const categoryData = await Category.find()
            res.render("adminProdEdit", { data: productData, text: "Product with same name already exists", category: categoryData });
        }

    } catch (error) {
        console.log(error.message);
    }
};

const unlistProduct = async (req, res) => {
    try {
        const idVal = req.params.id;
        await Product.findByIdAndUpdate(idVal, { isDeleted: true });
        res.redirect('/admin/productlist');

    } catch (error) {
        console.log(error.message);
    }
};

const listProduct = async (req, res) => {
    try {
        const idVal = req.params.id;
        await Product.findByIdAndUpdate(idVal, { isDeleted: false });
        res.redirect('/admin/productlist');
    } catch (error) {
        console.log(error.message);
    }
};



const handleLogout = async (req, res) => {
    try {
        req.session.admin = false;
        res.render("adminlogin", { title: "Admin Login", footer: "Logged out successfully" });
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loginload,
    homeload,

    dashboardload,
    fetchlineChartData,
    fetchbarChartData,
    fetchpieChartData,
    exportPdfDailySales,
    exportPdfWeeklySales,
    exportPdfYearlySales,

    userlistload,
    userBlockUnblock,
    orderList,
    updateStatus,

    catlistload,
    createCategory,
    addNewCategory,
    editCategoryPageLoad,
    editCategory,
    unlistCategory,
    listCategory,

    prodlistload,
    createProduct,
    addNewProduct,
    editProductPageload,
    editProduct,
    unlistProduct,
    listProduct,

    handleLogout,
};