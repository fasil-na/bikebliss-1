const userLogin = (req, res, next) => {
  try{
    if (!req.session.user) {
    res.redirect("/");
  } else {
    next(); 
  }
  }
  catch (error) {
    console.log(error.message);
} 
};

// const userLogout = (req, res, next) => {
//   try{
//     if (req.session.user) {
//     res.redirect("/");
//   } else {
//     next();
//   }
//   }catch (error) {
//     console.log(error.message); 
// };
// }

const adminLogin = (req, res, next) => {
  try{
    if (!req.session.admin) {
      res.redirect("/admin");
    } else {
      next(); 
    }
  }catch (error) {
    console.log(error.message); 
}; 
  
};

// const adminLogout = (req, res, next) => {
//   try{
//     if (req.session.admin) {
//       res.redirect("/admin");
//     } else {
//       next(); 
//     }
//   }catch (error) {
//     console.log(error.message); 
// }; 
// };

module.exports = { userLogin,  adminLogin };
