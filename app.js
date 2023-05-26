const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { v4: uuidv4 } = require("uuid");
const bodyParser =require("body-parser")
const mongoose = require('mongoose');
const uri ="mongodb+srv://bikebliss:bikebliss@cluster0.vsu52vv.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(uri)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const adminRoute = require('./routes/adminRoute');
const userRoute = require('./routes/userRoute');
const { request } = require('http');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: uuidv4(),
  resave: false,
  saveUninitialized: true,
  cookie: {
    sameSite: true,
  }
}))

app.use('/', userRoute);
app.use('/admin', adminRoute);

app.use((req, res, next) => {
  res.header("cache-control", "no-cache private,no-store,must-revalidate,max-stale=0,post-check=0,pre--check=0");
  next();
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
