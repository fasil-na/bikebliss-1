const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const { ObjectId } = require("mongodb");

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
            res.render("adminHome");
        }
        else {
            res.render("adminLogin", { title: "Admin Login Page", footer: "Invalid username or password" });
        }

    } catch (error) {
        console.log(error.message);
    }
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
        res.render("adminHome");
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
          await res.render("adminProdList", { data: productData });
      
        //   res.render("admin/products", { productData });
        // const productData = await Product.find({});
        // const categoryData = await Category.find({});
        // if (productData && categoryData) {
        //     const productWithCatName = productData.map((product) => {
        //         let prevObj = {}
        //         prevObj = product;
        //         const categories = categoryData.find((c) => c._id.toString() === product.category.toString());
        //         console.log("catCheck>>>>>>",categories);
        //         const categoryName = categories ? categories.category : null;
        //         prevObj.categoryName = categoryName
        //         return prevObj;
        //     });
            // const products =  productWithCatName.find({isDeleted: false});

            // await res.render("adminProdList", { data: productWithCatName });
        }
    // } 
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

const blockUser = async (req, res) => {
    try {
        const id = req.params.id;
        await User.updateOne({ _id: new ObjectId(id) }, { $set: { is_blocked: 1 } });
        res.redirect("/admin/dashboard");
    } catch (error) {
        console.log(error);
    }
};

const unblockUser = async (req, res) => {
    try {
        const id = req.params.id;
        await User.updateOne({ _id: new ObjectId(id) }, { $set: { is_blocked: 0 } });
        res.redirect("/admin/dashboard");
    } catch (error) {
        console.log(error);
    }
};

const logoutload = async (req, res) => {
    try {
        req.session.admin = false;
        res.render("adminlogin", { title: "Admin Login", footer: "Logged out successfully" });
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
        res.render("adminCatList", { data: categoryData });
    } catch (error) {
        console.log(error.message);
    }
};

const addNewProduct = async (req, res) => {
    const images = req.files.map((file) => {
        return file.filename;
    });
    if (
        req.body.name != "" &&
        req.body.price != "" &&
        req.body.description != "" &&
        req.body.category != "" &&
        req.body.image != "" &&
        req.body.brand != ""
    ) {

        const productData = new Product({
            productName: req.body.name,
            price: req.body.price,
            description: req.body.description,
            category: req.body.category,
            imageUrl: images,
            brand: req.body.brand,
            size: req.body.size,
            color: req.body.color,
            isDeleted: false,
        });
        await productData.save()
            .then((response) => {
                res.redirect("/admin/productlist");
            })
    } else {
        //   res.redirect(`/admin/addProduct?message=${message}`);
    }
};

const deleteCategory = async (req, res) => {
    try {

        const idVal = req.params.id;
        const userId = new ObjectId(idVal);
       
        await Category.deleteOne({_id:userId});
        const categoryData = await Category.find();
        res.render("adminCatList", { data: categoryData });
    } catch (error) {
        console.log(error.message);
    }
};

const updateCategory = async (req, res) => {

    if (req.body.id && req.body.card_title) {
        var myId = req.body.id.replace(/\s+$/, '');
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
}

const deleteProduct = async (req, res) => {
    try {

        const idVal = req.params.id;
        const userId = new ObjectId(idVal);
       
        await Product.updateOne({_id:userId}, {$set: {isDeleted: true}});

        const productData = await Product.find({isDeleted: false});
        res.render("adminProdList", { data: productData });
    } catch (error) {
        console.log(error.message);
    }
};

const updateProduct = async (req, res) => {

    // if (req.body.id && req.body.card_title) {
        var myId = req.body.id.replace(/\s+$/, '');
        const objectId = new ObjectId(myId);
        
        const name = req.body.card_title;
        const image = req.files.map((file) => {
            return file.filename;
          });
        const description = req.body.card_Description;
        const price = req.body.card_Price;
        const color = req.body.card_Color;
    
        try {
            await Product.findByIdAndUpdate(
                { _id: objectId },
                { $set: { productName: name, imageUrl: image.filename ,description: description,price:price, color:color} }
            ).then((response) => {
                res.redirect("/admin/productlist");
            });
        } catch (error) {
            console.log(error.message);
        }

    // }
}





module.exports = {
    loginload,
    homeload,
    userlistload,
    dashboardload,
    catlistload,
    prodlistload,
    createCategory,
    createProduct,
    blockUser,
    unblockUser,
    logoutload,
    userBlockUnblock,
    addNewCategory,
    addNewProduct,
    deleteCategory,
    updateCategory,
    deleteProduct,
    updateProduct,
};