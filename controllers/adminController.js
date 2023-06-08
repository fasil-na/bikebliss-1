const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const { ObjectId } = require("mongodb");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');

const loginload = async (req, res) => {
    try {
        res.render("adminLogin", { title: "Admin Login", footer: "" });
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
            const currentDate = new Date();
            const dateBefore7Days = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
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
        const currentDate = new Date();
        const dateBefore7Days = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
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
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox','--disable-setuid-sandbox']
      });
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
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox','--disable-setuid-sandbox']
      });
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
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox','--disable-setuid-sandbox']
      });
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path: 'YearlySalesReport.pdf' });
    await browser.close();
};

const userlistload = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const search = req.query.search
        const limit = 3;
        const skip = (page - 1) * limit;
        const query = {};
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        const totalUsers = await User.countDocuments(query)
        const userdata = await User.find(query).sort({ _id: -1 }).skip(skip).limit(limit);
        const totalPages = Math.ceil(totalUsers / limit);
        if (userdata.length !== 0) {
            res.render("adminUserList", { data: userdata, text: "", totalPages, page, search });
        } else {
            res.render("adminUserList", { data: userdata, text: "No users registered", totalPages, page, search });
        }
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

const userorderList = async (req, res) => {
    try {
        const userID = new ObjectId(req.body.userId);
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
            }
        ]);
        if (orders.length != 0) {
            res.render("adminOrderList", { orderData: orders, text: "" });
        } else {
            res.render("adminOrderList", { orderData: orders, text: "No orders placed" });
        }
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
        await Product.updateMany({ category: idVal }, { isCategoryDeleted: true });
        res.redirect('/admin/categorylist');
    } catch (error) {
        console.log(error.message);
    }
};

const listCategory = async (req, res) => {
    try {
        const idVal = req.params.id;
        await Category.findByIdAndUpdate(idVal, { isDeleted: false });
        await Product.updateMany({ category: idVal }, { isCategoryDeleted: false });
        res.redirect('/admin/categorylist');
    } catch (error) {
        console.log(error.message);
    }
};

const prodlistload = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const search = req.query.search;
        const limit = 3;
        const skip = (page - 1) * limit;
        let query = [
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
                        $limit: limit,
                    },
                ];
        const countquery = {};
        if (search) {
            countquery.productName= { $regex: search, $options: "i" };
            query = [
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
                    $match: {
                      $expr: {
                        $regexMatch: {
                          input: "$productName",
                          regex: search,
                          options: "i",
                        },
                      },
                    },
                  },
                {
                    $sort: { _id: -1 },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
            ];;
        }
        const totalProducts = await Product.countDocuments(countquery);
        const productData = await Product.aggregate(query);
        const totalPages = Math.ceil(totalProducts / limit);
        if (productData.length > 0) {
            res.render("adminProdList", { data: productData, text: "", totalPages, page, search });
        } else {
            res.render("adminProdList", { data: productData, text: "No products found", totalPages, page, search });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
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
        const images = req.files ? req.files.map(({ filename }) => filename) : undefined;
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
            if (images && images.length > 0) {
                await Product.findByIdAndUpdate(id, {
                    productName: lowerProductName,
                    imageUrl: images,
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
                    imageUrl: previousImages,
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
        delete req.session.admin
        res.render("adminLogin", { title: "Admin Login", footer: "Logged out successfully" });
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
    userorderList,
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