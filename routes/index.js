var express = require('express');
var router = express.Router();

// type: GET
// path: '/'
router.get('/', function(req,res,next){
    res.render('home');
});

module.exports = router;