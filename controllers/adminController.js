const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const { ObjectId } = require("mongodb");
const { orderData } = require("./userController");

const pdf = require("html-pdf");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const { response } = require("../app");
const jsPdf = require("jspdf")
const PDFDocument = require('pdfkit');
const puppeteer = require('puppeteer');

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
        let options = {
            format: "A4"
        }
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
        let options = {
            format: "A4"
        }
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
        let options = {
            format: "A4"
        }
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
        const userdata = await User.find();

        res.render("adminUserList", { data: userdata });
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


const prodlistload = async (req, res) => {
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
                    isDeleted: false
                }
            }
        ]);
        if (productData.length > 0) {
            await res.render("adminProdList", { data: productData, text: "" });
        } else {
            await res.render("adminProdList", { data: productData, text: "No products have been added" });
        }

    }
    catch (error) {
        console.log(error.message);
    }
};

const createCategory = async (req, res) => {
    try {
        res.render("adminCatCreate");
    } catch (error) {
        console.log(error.message);
    }
};

const createProduct = async (req, res) => {
    try {
        const categoryData = await Category.find({});
        res.render("adminProdCreate", {
            category: categoryData,
        });
    } catch (error) {
        console.log(error.message);
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
        const orderDetails = await Order.aggregate([
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
            }
        ]);
        res.render("adminOrderList", { orderData: orderDetails });
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

const addNewCategory = async (req, res) => {

    const categoryName = req.body.name;
    const image = req.file;
    const lowerCategoryName = categoryName.toLowerCase();
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
            res.redirect("/admin/catCreate");
        }
    } catch (error) { }
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

const deleteCategory = async (req, res) => {
    try {
        const idVal = req.params.id;
        const userId = new ObjectId(idVal);
        await Category.deleteOne({ _id: userId });
        const categoryData = await Category.find();
        if (categoryData.length > 0) {
            res.render("adminCatList", { data: categoryData, text: "" });
        } else {
            res.render("adminCatList", { data: categoryData, text: "All categories have been deleted!!!" });
        }

    } catch (error) {
        console.log(error.message);
    }
};

const updateCategory = async (req, res) => {
    let myId = req.body.id.replace(/\s+$/, '');
    const objectId = new ObjectId(myId);
    const categoryName = req.body.card_title;
    const image = req.file;
    try {
        await Category.findByIdAndUpdate(
            { _id: objectId },
            { $set: { category: categoryName, imageUrl: image.filename } }
        ).then((response) => {
            res.redirect("/admin/categorylist");
        });
    } catch (error) {
        console.log(error.message);
    }

}

const addNewProduct = async (req, res) => {
    const images = req.files.map((file) => {
        return file.filename;
    });
    const productData = new Product({
        productName: req.body.name,
        price: req.body.price,
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
}


const deleteProduct = async (req, res) => {
    try {
        const idVal = req.params.id;
        const userId = new ObjectId(idVal);
        await Product.updateOne({ _id: userId }, { $set: { isDeleted: true } });
        const productData = await Product.find({ isDeleted: false });
        if (productData.length > 0) {
            res.render("adminProdList", { data: productData, text: "" });
        } else {
            res.render("adminProdList", { data: productData, text: "All products have been deleted" });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const updateProduct = async (req, res) => {
    let myId = req.body.id.replace(/\s+$/, '');
    const objectId = new ObjectId(myId);
    const name = req.body.card_title;
    const imageFiles = req.files;
    // const image = imageFiles.map((file) => file.filename);
    const description = req.body.card_Description;
    const price = req.body.card_Price;
    const color = req.body.card_Color;
    const size = req.body.card_Size;
    const category = req.body.card_Category;
    const brand = req.body.card_Brand;
    const quantity = req.body.card_Quantity;

    try {
        await Product.findByIdAndUpdate(
            { _id: objectId },
            { $set: { productName: name, imageUrl: imageFiles, description: description, price: price, color: color, size: size, brand: brand, quantity: quantity } }
        ).then((response) => {
            res.redirect("/admin/productlist");
        });
    } catch (error) {
        console.log(error.message);
    }
}

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
    userlistload,
    dashboardload,
    catlistload,
    prodlistload,
    createCategory,
    createProduct,
    handleLogout,
    userBlockUnblock,
    addNewCategory,
    addNewProduct,
    deleteCategory,
    updateCategory,
    deleteProduct,
    updateProduct,
    orderList,
    updateStatus,
    fetchlineChartData,
    fetchbarChartData,
    fetchpieChartData,
    exportPdfDailySales,
    exportPdfWeeklySales,
    exportPdfYearlySales,

};