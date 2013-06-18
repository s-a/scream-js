/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  

 
var path = require('path');
var ScreamIO = require('./scream-io');
 

if (!Array.prototype.clone) Array.prototype.clone = function() { return this.slice(0); };

var ScreamImageProcess = function(sourceFilename){
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
        this.ls = this.spawn("convert", this.prepareParms(config));
        this.ls.stdout.on("data", function(data) {
            if(config.stdout) config.stdout(data);
        });
        this.ls.stderr.on("data", function(data) {
            if(config.stderr) config.stderr(data);
        });
        this.ls.on("close", function(code) {
            if(config.close) config.close(code, self.exportFilename, self.context);
        });        
    };
 
    this.prepareParms = function(config) {
        var result = config.commandLineParms.clone();  
         
        // adjust pixelratio
        var foundSizeSettings = false;
        if (!!config.targetPixelRatio){
            for (var i = 0; i < config.commandLineParms.length; i++) {

                var parm = result[i];
                if (parm === "-resize" || parm === "-size" || parm === "-scale"){
                    parm = result[i+1];
                    if (!!parm && parm.indexOf('%') === -1){
                        var values = parm.toLowerCase().split("x");
                        for (var a = 0; a < values.length; a++) {
                            var value = parseInt(values[a], 10) * config.targetPixelRatio;
                            if (value+"" === "NaN") value = "";
                            values[a] = value;
                        }
                        result[i+1] = values.join("x");
                    }
                    foundSizeSettings = true;
                    break;
                }
            } 
            if (!foundSizeSettings) throw "Could not find size settings";
 
            ScreamIO.directory.createIfNotExists(path.dirname(config.targetFilename));
        }

        result.push('-set');
        result.push('software');
        result.push('scream.js'); 
        result.unshift(path.resolve(sourceFilename));
        result.push(path.resolve(config.targetFilename));
        this.exportFilename = config.targetFilename;
        return result;
    };

    this.initialize = function(){
        this.spawn = require('child_process').spawn;
    };
    
    this.initialize();

    return this;
};

module.exports = ScreamImageProcess;