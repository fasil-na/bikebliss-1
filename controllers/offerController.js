const Offer = require('../models/offerModel');
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");

const offerlistload = async (req, res) => {
  try {
    const offerdata = await Offer.find();
    res.render("adminOfferList", { data: offerdata });
  } catch (error) {
    console.log(error.message);
  }
};

const productOfferCreate = async (req, res) => {
  try {
    const productData = await Product.find({});
    res.render("adminProductOfferCreate", {
      data: productData,
    });
  } catch (error) {
    console.log(error.message);
  }
};


const addProductOffer = async (req, res) => {
  try {
    const offerName = req.body.name;
    const offerPercentage = parseInt(req.body.percentage,10);
    const product = req.body.product;
    if (!offerName || !offerPercentage || !product) {
      return res.status(400).send("Missing required fields");
    }
    const lowerOfferName = offerName.toLowerCase();
    const offerExist = await Offer.findOne({ name: lowerOfferName });
    if (!offerExist) {
      const existingProduct = await Product.findById({ _id: product });
      const originalProductPrice = existingProduct.offerPrice
      const newPrice = Math.round(originalProductPrice * ((100 - (existingProduct.offerPercentage+offerPercentage)) / 100))
      await Product.findByIdAndUpdate({ _id: product }, { $set: { price: newPrice } });
      await Product.findByIdAndUpdate({ _id: product }, { $set: { offerPercentage: existingProduct.offerPercentage+offerPercentage } });
      const newOffer = new Offer({
        name: offerName,
        percentage: offerPercentage,
        product: product,
      });
      await newOffer.save();
      res.redirect("/admin/offerlist");
    } else {
      res.redirect("/admin/productOfferCreate");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteProductOffer = async (req, res) => {
  try {
    const offerDoc = await Offer.findById(req.params.id);
    const offerValidProductId = offerDoc.product;
    const productData = await Product.findById({ _id: offerValidProductId });
    const newOffer=productData.offerPercentage-offerDoc.percentage
    const newPrice=(100-newOffer)*productData.offerPrice/100
    const previousProductPrice = productData.offerPrice
    await Product.findByIdAndUpdate({ _id: offerValidProductId }, { $set: { price: newPrice } });
    await Product.findByIdAndUpdate({ _id: offerValidProductId }, { $set: { offerPercentage: newOffer } });
    await Offer.deleteOne({ _id: req.params.id });
    const offerData = await Offer.find();
    res.render("adminOfferList", { data: offerData });
  } catch (error) {
    console.log(error.message);
  }
};

const categoryOfferCreate = async (req, res) => {
  try {
    const categoryData = await Category.find({});
    res.render("adminCategoryOfferCreate", {
      data: categoryData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const addCategoryOffer = async (req, res) => {
  try {
    const offerName = req.body.name;
    const offerPercentage =parseInt(req.body.percentage,10);
    const category = req.body.category;
    if (!offerName || !offerPercentage || !category) {
      return res.status(400).send("Missing required fields");
    }
    const lowerOfferName = offerName.toLowerCase();
    const offerExist = await Offer.findOne({ name: lowerOfferName });
    if (!offerExist) {
      await Product.find({ category: category })
        .then((products) => {
          products.forEach((product) => {
            product.offerPercentage =product.offerPercentage+ offerPercentage;
            product.price = Math.round(product.offerPrice - product.offerPrice * ((product.offerPercentage+ offerPercentage)) / 100),
            product.save();
          });
        });
      const newOffer = new Offer({
        name: offerName,
        percentage: offerPercentage,
        category: category,
      });
      await newOffer.save();
      res.redirect("/admin/offerlist");
    } else {
      res.redirect("/admin/categoryOfferCreate");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteCategoryOffer = async (req, res) => {
  try {
    const offerDoc = await Offer.findById(req.params.id);
    
    await Product.find({ category: offerDoc.category })

      .then((products) => {
        products.forEach((product) => {
          const newOffer=product.offerPercentage-offerDoc.percentage
          const newPrice=(100-newOffer)*product.offerPrice/100
          product.price = newPrice;
          product.offerPercentage = newOffer;
          product.save();
        });
      })
    await Offer.deleteOne({ _id: req.params.id });
    const offerData = await Offer.find();
    res.render("adminOfferList", { data: offerData });
  } catch (error) {
    console.log(error.message);
  }
};


module.exports = {
  offerlistload,
  productOfferCreate,
  addProductOffer,
  deleteProductOffer,
  categoryOfferCreate,
  addCategoryOffer,
  deleteCategoryOffer,
};



