const scrape = require('website-scraper');
const PuppeteerPlugin = require('website-scraper-puppeteer');
const uuidv5 = require('uuid/v5');
const fs = require('fs');
const del = require('del');

uuidv5('http://example.com/hello', uuidv5.URL);

scrape({
    urls: ['http://bartleybluebird.cloudwatch.net/'],
    directory: __dirname+'/backupdump',
    plugins: [ new PuppeteerPlugin() ]
})

// var deleteFolderRecursive = function(path) {
//     if( fs.existsSync(path) ) {
//       fs.readdirSync(path).forEach(function(file,index){
//         var curPath = path + "/" + file;
//         if(fs.lstatSync(curPath).isDirectory()) { // recurse
//           deleteFolderRecursive(curPath);
//         } else { // delete file
//           fs.unlinkSync(curPath);
//         }
//       });
//       fs.rmdirSync(path);
//     }
//   };

// deleteFolderRecursive('/backupdump');

// del.sync(['backupdump/**']);