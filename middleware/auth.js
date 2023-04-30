
const userLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

const userLogout = (req, res, next) => {
  if (req.session.user) {
    req.session.user = false;
    res.redirect("/");
  } else {
    next();
  }
};

const adminLogin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin");
  }
};

const adminLogout = (req, res, next) => {
  if (req.session.admin) {
    next();
  }
};
module.exports = { userLogin, userLogout, adminLogin, adminLogout };