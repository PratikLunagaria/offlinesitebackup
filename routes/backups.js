var express = require('express');
var router = express.Router();

// type: GET
// path: '/'
router.get('/', function(req,res,next){
    res.send('respond with resource2');
});

module.exports = router;