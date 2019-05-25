var express = require('express');
var app = express();

var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routing setup
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Catching errors
app.use(function(req,res,next){
    next(createError(404));
});

// error handler
app.use(function(err,req,res,next){
    // errors in Development mode
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;