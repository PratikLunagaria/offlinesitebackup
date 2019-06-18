var express = require('express');
var app = express();
var helpers = require('./lib/helpers');
var createError = require('http-errors');
var path = require('path');
var logger = require('morgan');
var exphbs = require('express-handlebars');

// Router
var indexRouter = require('./routes/index');
var dlRouter = require('./routes/dl');

// Middlewares
app.use(logger('combined'));
app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'zipped')));
app.use(express.static('public'));
app.use(express.static('zipped'));

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
app.use('/dl', dlRouter);

// Catching errors
app.use(function(req,res,next){
    next(createError(404));
});

module.exports = app;