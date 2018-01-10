var fs = require('fs');  
var path = require('path');  

var srcFilePath = path.resolve('./dist');
var filename = 'index.html';
var filedir = path.join(srcFilePath,filename); 

if(fs.existsSync(filedir)){
    var data = fs.readFileSync(filedir).toString();
    var newData = data.replace(/index\.js/g,'index.js?ver=' + new Date().getTime());
    newData = newData.replace(/var S_VERSION =\s*\d+;/,'var S_VERSION = ' + new Date().getTime() + ";")
    fs.writeFileSync(filedir, newData);
}