var express = require('express');
var app = express();
var helpers = require('./lib/helpers');
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');

// Router
var indexRouter = require('./routes/index');
var backupsRouter = require('./routes/backups');

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Create `ExpressHandlebars` instance with a default layout.
var hbs = exphbs.create({
    helpers      : helpers,

    // Uses multiple partials dirs, templates in "shared/templates/" are shared
    // with the client-side of the app (see below).
    partialsDir: [
        'shared/templates/',
        'views/partials/'
    ]
});
// views
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Routing setup
app.use('/', indexRouter);
app.use('/backups', backupsRouter);

// Catching errors
app.use(function(req,res,next){
    next(createError(404));
});

// error handler
// app.use(function(err,req,res,next){
//     // errors in Development mode
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};

//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
// });

module.exports = app;