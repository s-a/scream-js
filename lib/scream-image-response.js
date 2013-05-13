/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  

var fs = require('fs');
var path = require('path');
var ScreamRequest = require('./scream-request');
var ScreamImageProcess = require('./scream-image-process');

var screamImageResponse = function (config, req,res) {
    var request = new ScreamRequest(req);
    var state = 200;
    var pixelRatio = 1;
    
    if (parseFloat(request.command)+"" !== "NaN") pixelRatio = parseFloat(request.command);
         
    switch(request.filename){
    default:
        var image = config.images[request.filename];
        var sendImage = function(filename, res, statusCode) { 
            var contentType = request.getFileExtension(filename).toLowerCase();
            contentType = contentType.split(".")[1]; 
            img = fs.readFileSync(filename);
            res.writeHead(statusCode, {'Content-Type': 'image/' + contentType,'Retry-After' : ""+statusCode });
            res.end(img, 'binary');
        };
        
        if (!!image){
           
            fs.exists(image.filename, function(exists) {  

                if (exists) {

                    var statusCode=200;
                    var targetFilename = config.settings.images.targetCacheDirectory + '/' + request.filename;
                    var imageMagick = new ScreamImageProcess(image.filename); 

                    imageMagick.convert({
                        targetPixelRatio: pixelRatio,
                        commandLineParms: image.batch,
                        targetFilename: targetFilename,
                        stdout: function(data){
                            statusCode = 200;
                            //winston.info('stdout: ' + data);
                        },
                        stderr: function(data){
                            statusCode = 500;
                            winston.error(data);
                        },
                        close: function(code){
                            //winston.warn('child process exited with code ' + code);
                            if (code!==0){ 
                                targetFilename = path.join(__dirname, "500.png") ;
                                statusCode = 500; 
                            }
                            sendImage(imageMagick.exportFilename, res, statusCode);
                        }
                    });
                } else {
                    sendImage(path.join(__dirname, "404.jpg"), res, 404);
                }
            });                
        } else {
            sendImage(path.join(__dirname, "404.jpg"), res, 404);
        }
        break;
    case "+": 
        res.writeHead(state, {'Content-Type': 'application/json','Retry-After' : "404" });
        res.end(JSON.stringify(config));            
        break;
    } 
};

module.exports = screamImageResponse; 