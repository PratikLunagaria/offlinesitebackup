const express = require('express');
const router = express.Router();
const path = require('path');
const del = require('del')

// type: GET
// path: '/'
router.get('/:id', function(req,res,next){
    var dlFile = req._parsedUrl._raw;
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

    console.log(fullUrl);
    console.log(dlFile);
    // res.json({'sitepath' : `zipped${dlFile}`})
    res.download(`zipped/${dlFile}`,dlFile).catch((err)=> console.log(err));;
    console.log(dlFile);
    var delfolder = dlFile.toString().replace('.zip','')
    setTimeout(
        ()=>{
            del.sync([`zipped/${dlFile}`]).catch((err)=> console.log(err));;
            del.sync([`downloads/${delfolder}`]).catch((err)=> console.log(err));;
        }
    ,600000);
});

module.exports = router;