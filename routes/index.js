const express = require('express');
const router = express.Router();
const scrape = require('website-scraper');
const PuppeteerPlugin = require('website-scraper-puppeteer');
const uuidv4 = require('uuid/v4');
const { zip } = require('zip-a-folder');

// type: GET
// path: '/'
router.get('/', function(req,res,next){
    res.render('home');
});

// type: GET
// path: '/about'
router.get('/about', function(req,res,next){
    res.render('about');
});

// type: GET
// path: '/how-to'
router.get('/how-to', function(req,res,next){
    res.render('how-to');
});

// type: GET
// path: '/privacy'
router.get('/privacy', function(req,res,next){
    res.render('privacy');
});


// type: POST
// path: '/site_req'
router.post('/site_req',async function(req,res,next){
    var qurl= await req.body['siteurl'];
    var siteUUID = await uuidv4();
    var dlfolder =  await `downloads/${siteUUID}`;
    var zipfolder =  await `zipped/${siteUUID}.zip`;
   
    var result = await scrape({
      urls: [qurl],
      directory: dlfolder,
      plugins: [ new PuppeteerPlugin() ]
    }).catch((err)=> console.log(err));

    async function main() {
        await zip(dlfolder, zipfolder);
        return true;
    }

    if(result.length >= 1){
        var isZipped = await main();
        if(isZipped == true){
            var fullUrl = req.protocol + '://' + req.get('host') + `/dl/${siteUUID}.zip`;
            res.json(fullUrl);
        }else{
            res.send('<h1>Error occured</h1>');
        }
        console.log(isZipped);
    }else{
        res.json({'error': 'error occured'});
    }
});

module.exports = router;