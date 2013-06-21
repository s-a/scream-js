/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  

var path = require('path');
var fs = require('fs');

function ScreamIODirectory() {

    

    this.create = function(dir) {
        var result = true;
        try {
            fs.mkdirSync(path.resolve(dir));
        } catch (e) {
            result = false; 
        }
        return result; 
    };

    var createDirectoryAtttempts = 0;
    this.createIfNotExists = function(dir, emptyIfExists) {

        var result = false;        
        if(!!emptyIfExists){
            this.empty(dir); 
        }

        dir = path.resolve(dir);
        try {
            stats = fs.lstatSync(dir);
            if (stats.isDirectory()) {
                result = true;
            }
        } catch (e) {
             result = this.create(dir);
        }

        if (!result && createDirectoryAtttempts++ < 20) { 
            result = this.createIfNotExists( path.join(dir, ".."));
        }

        return result; 
    };

    this.empty = function(dir, winston) {
        var files;
        try { 
            files = fs.readdirSync(dir); 
        } catch(e) { 
            return false; 
        }
        if (files.length > 0){
            for (var i = 0; i < files.length; i++) {
                var p = dir + '/' + files[i];
                if (fs.statSync(p).isFile()) fs.unlinkSync(p);
                        //else
                          //  rmDir(p);
            }
        }
        try { 
            fs.rmdirSync(dir);
        } catch(e) { 
            if (winston) winston.error(e);
        }
        
        return true;
    };

    return this;
}

var file = {
    extractFilename : function(filename){
        var i = filename.lastIndexOf('.');
        var result = (i < 0) ? '' : filename.substr(0,i).toLowerCase();
        return result;
    },
    extractFileExtension : function(filename){
        var i = filename.lastIndexOf('.');
        return (i < 0) ? '' : filename.substr(i).toLowerCase();
    },
    getFilenameByPixelRatio : function(filename, pixelRatio) {
        var result = this.extractFilename(filename);
        if (pixelRatio !== 1 && pixelRatio !== null) result += "@" + pixelRatio.toString().replace(".", "-") + "x"; 
        result += this.extractFileExtension(filename);
        return result;
    },
    getImageExportDirectory : function(config) {
        var dir = path.resolve(config.settings.images.targetCacheDirectory);
        return path.join(dir, "scream");
    },
    getImageExportFilename : function(config, filename, pixelRatio) {
        var fn = this.getFilenameByPixelRatio(filename, pixelRatio);
        var dir = this.getImageExportDirectory(config);
        var result = path.join(dir, fn);
        return result;
    },
    getImageUrl : function(config, filename, pixelRatio) {
        var route = config.settings.css.imageUrl; 
        var fn = this.getImageExportFilename(config, filename, pixelRatio);
        var result = route + "scream/" + path.basename(this.extractFilename(fn)) + this.extractFileExtension(fn);
        return result;
    },
    exists : function (filename) {
      try {
          stats = fs.lstatSync(filename);
          return true;
      } catch (e) {
          return false;
      }
    }  
};

module.exports.directory = new ScreamIODirectory(); 
module.exports.file = file; 
module.exports.getCommandLineFileOrDirectory = function (commandLineIndex) {
    var currentDir = process.cwd();
    var file = process.argv[commandLineIndex]; // via node command line

    if (commandLineIndex >= 0 && file.substr(0,2) === "--"){
        file = this.getCommandLineFileOrDirectory(commandLineIndex-1);
    } else {    
        if (file === undefined) return currentDir;

        if (!fs.existsSync(file)){
            file = path.join(currentDir, file);
        }
        
        if (!fs.existsSync(file)){
            file = currentDir;
        }
    }
    return path.resolve(file);
};