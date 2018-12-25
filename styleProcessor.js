const fs = require('fs');  
const path = require('path');  
const program = require('commander');
var exec = require('child_process').exec;
 
program
  .version('0.0.1')
  .option('-p, --path', 'generate folder')
  .parse(process.argv);

let folderName = 'lib';
if(program.args.length>0){
    folderName = program.args[0];
}

let srcFilePath = path.resolve('./src');  
let libFilePath = path.resolve(`./${folderName}`); 
//调用文件遍历方法  
fileDisplay(srcFilePath);  
  
/** 
 * 文件遍历方法 
 * @param srcFilePath 需要遍历的文件路径 
 */  
function fileDisplay(srcFilePath){  
    //根据文件路径读取文件，返回文件列表  
    
    fs.readdir(srcFilePath,function(err,files){  
        if(err){  
            console.warn(err)  
        }else{  
            //遍历读取到的文件列表  
            files.forEach(function(filename){  
                //获取当前文件的绝对路径  
                var filedir = path.join(srcFilePath,filename);  
                //根据文件路径获取文件信息，返回一个fs.Stats对象  
                fs.stat(filedir,function(eror,stats){  
                    if(eror){  
                        console.warn('获取文件stats失败');  
                    }else{  
                        var isFile = stats.isFile();//是文件  
                        var isDir = stats.isDirectory();//是文件夹  
                        if(isFile){  
                            // console.log(filedir); 
                            if(/\.(less|css)$/.test(filename)){
                                var _src = filedir;
                                var _dst = filedir.replace('\\src\\',`\\${folderName}\\`);
                                readable=fs.createReadStream(_src);//创建读取流
                                writable=fs.createWriteStream(_dst);//创建写入流
                                readable.pipe(writable);
                            }
                            if(/\.less$/.test(filename)){
                                exec(`lessc ${_src} > ${_dst.replace('.less','.css')}`);
                            }                 
                        }  
                        if(isDir){  
                            fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件  
                        }  
                    }  
                })  
            });  
        }  
    });  
}  