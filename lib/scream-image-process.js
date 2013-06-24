/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  

 
var path = require('path');
var ScreamIO = require('./scream-io');
 

if (!Array.prototype.clone) Array.prototype.clone = function() { return this.slice(0); };

var ScreamImageProcess = function(sourceFilename, winston){
    var self = this;

    this.compress = function  (filename, compressionRate, callback) {
        var parms = [];
        parms.push("-o"+compressionRate);
        parms.push(filename);
        var lastMessage = "";

        this.ls = this.spawn("optipng", parms); 
        this.ls.stdout.on("data", function(data) {
            lastMessage = data.toString();
        });
        this.ls.stderr.on("data", function(data) {
            lastMessage = data.toString();
        });
        this.ls.on("close", function(code) {
            lastMessage = lastMessage; 
            if (callback) callback(filename, lastMessage);
        });
    };

    this.createSprite = function(files /* Array */, targetFilename, callback){
        var parms = files.clone();
        parms.unshift("transparent");
        parms.unshift("-background");
         
        parms.unshift("+0+0");
        parms.unshift("-geometry");

        parms.unshift("1x");
        parms.unshift("-tile");

        parms.unshift('scream.js'); 
        parms.unshift('software');
        parms.unshift('-set');
        
        parms.push(targetFilename);
        this.ls = this.spawn("montage", parms); 
        this.ls.stdout.on("data", function(data) {
        });
        this.ls.stderr.on("data", function(data) {
            console.log("error", data.toString());
        });
        this.ls.on("close", function(code) {
            if (code === 0 && callback) callback(targetFilename);
        });
    };

    this.identify = function(filename, callback, onerror) {
        var result = null;

        this.ls = this.spawn("identify", ["-verbose", "-format", "%[height]x%[width]",  filename]); 
        this.ls.stdout.on("data", function(data) {
            data = data.toString().split("x");
            result = {
                height : parseInt( data[0], 10 ),
                width : parseInt( data[1], 10 )
            };
        });
        this.ls.stderr.on("data", function(data) {
            if (onerror) onerror(data);
        });
        this.ls.on("close", function(code) {
            if (code === 0 && callback) callback(result);
        });
    };

    this.convert = function(config){
        self.context = config.context;

        self.prepareParms(config, function(parms) {
            self.ls = self.spawn("convert", parms);
            self.ls.stdout.on("data", function(data) {
                if(config.stdout) config.stdout(data);
            });
            self.ls.stderr.on("data", function(data) {
                if(config.stderr) config.stderr(data);
            });
            self.ls.on("close", function(code) {
                if(config.close) config.close(code, self.exportFilename, self.context);
            });        
        });
    };

    this.adjustImageSizeByPixelratio = function(config, batchParms, callback) {
        self.identify(sourceFilename, function (orignialImageSize) {

            var foundSizeSettings = false;
            var validateNewImageSize = function(width, height) {
                if (winston){
                    if (width > orignialImageSize.width || height > orignialImageSize.height){
                        winston.error("Image is too small and lose quality at " + config.targetPixelRatio + " pixel ratio");
                        winston.error("Filename " + sourceFilename + " is " + orignialImageSize.width + "x" + orignialImageSize.height);
                        winston.error("it needs at least " + width + "x" +  height);
                    }
                }
            };

            for (var i = 0; i < config.commandLineParms.length; i++) {
                var parm = batchParms[i];
                if (parm === "-resize" || parm === "-size" || parm === "-scale"){ // parseImageSize
                    parm = batchParms[i+1];
                    if (!!parm && parm.indexOf('%') === -1){
                        var values = parm.toLowerCase().split("x");
                        for (var a = 0; a < values.length; a++) {
                            var value = parseInt(values[a], 10) * config.targetPixelRatio;
                            if (value+"" === "NaN") value = "";
                            values[a] = value;
                        }
                        batchParms[i+1] = values.join("x");
                        validateNewImageSize(values[0], values[1]);
                        foundSizeSettings = true;
                    }
                    break;
                }
            } 

            if (!foundSizeSettings) {
                batchParms.push("-resize");
                var newWidth = config.targetPixelRatio * orignialImageSize.width;
                var newHeight = config.targetPixelRatio * orignialImageSize.height;
                batchParms.push( newWidth + "x" + newHeight);
                validateNewImageSize(newWidth, newHeight);
                foundSizeSettings = true;
            }
            callback( !foundSizeSettings );    

        }, function () {
            throw ("error");
        });

    };
 
    this.prepareParms = function(config, callback) {
        if (config.commandLineParms === undefined) config.commandLineParms = [];
        var batchParms = config.commandLineParms.clone();  
        var parmsPrepared = function() {
            batchParms.push('-set');
            batchParms.push('software');
            batchParms.push('scream.js'); 
            batchParms.unshift(path.resolve(sourceFilename));
            batchParms.push(path.resolve(config.targetFilename));
            self.exportFilename = config.targetFilename;
            callback(batchParms);
        };

        if (!!config.targetPixelRatio){
            this.adjustImageSizeByPixelratio(config, batchParms, function(err /* bool */) {
                if (err) throw "Could not prepare image size settings by pixel ratio";
                ScreamIO.directory.createIfNotExists(path.dirname(config.targetFilename));
                parmsPrepared();
            });  
        } else {
            parmsPrepared();
        }
 
    };

    this.initialize = function(){
        this.spawn = require('child_process').spawn;
    };
    
    this.initialize();

    return this;
};

module.exports = ScreamImageProcess;