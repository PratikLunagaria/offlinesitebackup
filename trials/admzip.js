var file_url = 'https://raw.githubusercontent.com/GoogleChrome/puppeteer/master/docs/api.md';

var AdmZip = require('adm-zip');
var request = require('request');

request.get({url: file_url, encoding: null}, (err, res, body) => {
    var zip = new AdmZip();
    zip.addLocalFile(file_url);

  zip.writeZip(/*target file name*/"/files.zip");

});