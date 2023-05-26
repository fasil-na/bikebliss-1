const Banner = require('../models/bannerModel');

const bannerlistload = async (req, res) => {
  try {
    const bannerData = await Banner.find();
    if(bannerData.length>0){
      res.render("adminBannerList", { data:bannerData,text:"" });
    }else{
      res.render("adminBannerList", { data:bannerData,text:"No banners have been added!!!" });
    } 
  } catch (error) {
    console.log(error);
  }
}

const createBanner = async (req, res) => {
  try {
    res.render('adminBannerCreate')
  } catch (error) {
    console.log(error);
  }
}

const addNewBanner = async (req, res) => {

  const bannerTitle = req.body.title;
  const bannerDescription = req.body.description;
  const image = req.file;
  const lowerbannerTitle = bannerTitle.toLowerCase();
  try {
      const bannerExist = await Banner.findOne({ mainHeading: lowerbannerTitle });
      if (!bannerExist) {
          const newBanner = new Banner({
              mainHeading: lowerbannerTitle,
              description: bannerDescription,
              bannerImage: image.filename,
          });
          await newBanner.save().then((response) => {
              res.redirect("/admin/bannerlist");
          })
      } else {
          res.redirect("/admin/bannerCreate");
      }
  } catch (error) {
    console.log(error);
  }
};

const deleteBanner = async (req, res) => {
  try {
      await Banner.deleteOne({ _id: req.params.id });
      const bannerData = await Banner.find();
      if(bannerData.length>0){
          res.render("adminBannerList", { data: bannerData,text: ""  });
      }else{
          res.render("adminBannerList", { data: bannerData,text: "All banners have been deleted!!!"  });
      }
      
  } catch (error) {
      console.log(error.message);
  }
};

module.exports = {
  bannerlistload,
  createBanner,
  addNewBanner,
  deleteBanner,
};



