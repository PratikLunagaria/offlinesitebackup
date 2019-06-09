var express = require('express');
var router = express.Router();

// type: GET
// path: '/'
router.get('/', function(req,res,next){
    res.render('home');
});

// type: POST
// path: '/site_req'
router.post('/site_req', function(req,res,next){
    console.log(req.body)
});



module.exports = router;