/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  

var path = require('path');
var ScreamImageProcess = require('./scream-image-process');
var ScreamIO = require('./scream-io');
var cssBuilder = require('./css-builder').builder;

var ScreamImageController = function (config, winston) {
    var self = this;
    this.render = function(alias, pixelRatio, callback) {
        var img =  config.images[alias];
        var imageProcess = new ScreamImageProcess(img.filename, winston); 
        var targetFilename = ScreamIO.file.getImageExportFilename(config, alias, pixelRatio);

        imageProcess.convert({
            targetPixelRatio: pixelRatio,
            commandLineParms: img.batch,
            targetFilename: targetFilename,
            context: {
                alias: alias,
                pixelRatio: pixelRatio
            },
            //stdout: function(data){                     },
            stderr: function(data){ 
                winston.error('imagemagick stdout: ' + data);
            },
            close: function(code, exportFilename, context){
                imageProcess.identify(
                    exportFilename, 
                    function(data){ // callback
                        winston.info("  converted alias ", context);
                        winston.info("    to " + path.resolve(exportFilename), data);
                        if (!config.images[context.alias].meta) config.images[context.alias].meta = [];
                        var metaData = config.images[context.alias].meta;
                         
                        metaData.push({
                            pixelRatio:context.pixelRatio,
                            width:data.width,
                            height:data.height
                        });
                        callback(exportFilename, alias);
                    },
                    function(data) { // error handler
                        winston.error(data);
                    }
                );
            }
        }); 
    };

    this.numberOfImagesToProcess = function() {
        var result = 0;
        for (var a in config.images) result++;
        result = result * config.supportedPixelRatios.length;
        return result;
    };

    var collectSpriteSheetInformations = function() {
        var result = [];
        winston.info("Collecting Sprites...");
        for (var alias in config.images) {
            var image = config.images[alias];
 
            if (!!image.sprite){
                if (!result[image.sprite]) result[image.sprite] = [];
                result[image.sprite].push({alias: alias, image: image});
            }    
        } 
        winston.info("Collecting Sprites done...");
        return result;
    };

    var collectImageFilenames = function(config, pixelRatio, images, basePath) {
        var result = [];
        for (var i = 0; i < images.length; i++) {
             var image = images[i] ; 
             var fn = ScreamIO.file.getImageExportFilename(config, image.alias, pixelRatio);
             result.push(path.resolve(fn));
         }
         return result;
    };

    this.optimizeFiles = function(files, callback) {
        if (!!config.testMode){
            callback();
        } else {
            var counter = files.length;
            winston.warn("Optimizing Images");
            for (var i = 0; i < files.length; i++) {
                var filename = files[i];
                var imageProcess = new ScreamImageProcess();
                imageProcess.compress(filename, 7, function(filename, lastStdOut) {
                    winston.info(filename, "optimized");
                    var stdout = lastStdOut.split("\n");
                    //winston.info(stdout[stdout.length-4]);
                    winston.info(stdout[stdout.length-3]);
                     
                    if (counter--===1){
                        callback();    
                    } 
                });
            }
        }
    };

    this.renderSpriteSheets = function(callback) {
        var counter = config.supportedPixelRatios.length; 
        var spriteSheetFiles = []; 
        config.sprites = collectSpriteSheetInformations();


        for (var i = 0; i < config.supportedPixelRatios.length; i++) {
            var pixelRatio = config.supportedPixelRatios[i];
            var targetDirectory = ScreamIO.file.getImageExportDirectory(config);
            var spriteCount = 0;
            for (var key in config.sprites) {
                if (typeof(config.sprites[key]) !== "function") spriteCount++;
            }
            if (spriteCount === 0){
                callback();
            } else {
                // render sprite images
                for (var spriteName in config.sprites) {
                    var images = config.sprites[spriteName];
                    if (typeof images !== "function"){
                        var imageFilenameArray = collectImageFilenames(config, pixelRatio, images, targetDirectory);
                        var spriteSheetPrefix = "sprite__";
                        if (config.spriteSheetPrefix) spriteSheetPrefix = config.spriteSheetPrefix;

                        var fn = spriteSheetPrefix + spriteName + ".png";
                        var targetSpriteSheetFilename = ScreamIO.file.getImageExportFilename(config, fn, pixelRatio);
     
                        var imageProcess = new ScreamImageProcess();
                        imageProcess.createSprite(imageFilenameArray, targetSpriteSheetFilename, function(spriteSheetFilename){
                            counter--;
                            spriteSheetFiles.push(spriteSheetFilename);
                            if (counter===0){
                                winston.info("All sprite sheet images written");
                                self.optimizeFiles(spriteSheetFiles, callback);
                            } 
                        });
                    }
                }
            }
        } 
    };

    this.renderAll = function(callback) {
        if (!config.testMode){ 
            var dir = path.resolve(config.settings.images.targetCacheDirectory);
            dir = path.join(dir, "scream"); 
            if (winston) winston.warn("deleting all files in " + dir);
            ScreamIO.directory.empty(dir, winston);
        }
        var counter = this.numberOfImagesToProcess();
        var imageFiles = [];
        for (var i = 0; i < config.supportedPixelRatios.length; i++) {
            var pixelRatio = config.supportedPixelRatios[i];
            for (var alias in config.images) {
                this.render(alias, pixelRatio, function(exportFilename, alias) {

                    // ignore sprite bundled images for optimise process
                    var image = config.images[alias];
                    if (image.sprite === undefined) {
                        imageFiles.push(exportFilename);
                    } else {
                        winston.info("ignore sprite bundled image", exportFilename);
                    }

                    counter--;
                    if ( counter === 0){ 
                        self.renderSpriteSheets(function() {
                            self.optimizeFiles(imageFiles, callback);
                        });
                    }
                }); 
            } 
        }   
    };

    return this;
};

module.exports = ScreamImageController; 