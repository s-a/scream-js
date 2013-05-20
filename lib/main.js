/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  

require('./object_extensions');
var fs = require('fs');
var path = require('path');
var winston = require('winston'); 
var http = require('http'); 
 
var ScreamImageController = require('./scream-image-controller');
var cssBuilder = require('./css-builder').builder;

winston.cli(); 
var logger = new (winston.Logger)({
    transports: [
        new winston.transports.File({ filename: __dirname + '/all-logs.log' }),
        new winston.transports.Console({
            handleExceptions: true,
            json: true,
            colorize: true
        })
    ],
    exceptionHandlers: [
      new winston.transports.File({ filename: __dirname + '/exceptions.log' })
    ],
    exitOnError: false
  });
logger.cli();


var onFileChanged = function function_name (curr, prev) {
    console.log("xxx", config.filename);
    console.log("current mtime: " +curr.mtime);
    console.log("previous mtime: "+prev.mtime);
    if (curr.mtime == prev.mtime) {
        console.log("mtime equal");
    } else {
        console.log("mtime not equal");
    }   
}; 
var scream = function(config, testMode){ 
     
    config.testMode = testMode;
     
    this.build = function(callback) {
        var imageController = new ScreamImageController(config, winston);
        imageController.renderAll(function() {
            var css = new cssBuilder({pixelRatio: null, screamSettings: config, testMode: testMode}, winston); 
            css.save();
            for (var i = 0; i < config.supportedPixelRatios.length; i++) {
                var pixelRatio = config.supportedPixelRatios[i];
                css = new cssBuilder({pixelRatio: pixelRatio, screamSettings: config, testMode: testMode}, winston); 
                css.save();
            } 
            callback();
        });
    };

    this.run = function(port, callback) {
        winston.info("Starting scream image service...");
        this.build(function(){
            winston.info("Scream image service ready");    
            //console.log(util.inspect(config, false, 2, true));
            config.filename = path.resolve(config.filename);
            callback();
        });

        http.createServer(function (req, res) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Hello Scream.js\n');
        }).listen(port, '127.0.0.1');

        console.log("xxx", path.resolve(config.filename));
        fs.watchFile (path.resolve(config.filename), { interval: 1 }, onFileChanged);

    };

    this.log = winston;
    return this; 
};

module.exports = scream; 