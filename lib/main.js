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



var scream = function(config, testMode, configFilename){ 
    var self = this;
    var setup = config;
    

    this.onFileChanged = function(curr, prev) {

        console.log("current mtime: " +curr.mtime);
        console.log("previous mtime: "+prev.mtime);
        if (curr.mtime == prev.mtime) {
            console.log("mtime equal");
        } else {
            winston.warn("Rebuilding components with", configFilename);
            delete require.cache[configFilename];
            setup = require(configFilename); 
            self.build(function(){
                winston.warn("Rebuilding done...");
            });
        }   
    }; 
     
    this.build = function(callback) {
        setup.testMode = testMode;
        var imageController = new ScreamImageController(setup, winston);
        imageController.renderAll(function() {
            var css = new cssBuilder({pixelRatio: null, screamSettings: setup, testMode: testMode}, winston); 
            css.save();
            for (var i = 0; i < setup.supportedPixelRatios.length; i++) {
                var pixelRatio = setup.supportedPixelRatios[i];
                css = new cssBuilder({pixelRatio: pixelRatio, screamSettings: setup, testMode: testMode}, winston); 
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
            setup.filename = path.resolve(setup.filename);
            callback();
            var fn = setup.filename.replace(/[/\\*]/g, "\\\\");
            fs.watchFile (fn, self.onFileChanged);
            http.createServer(function (req, res) {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('Hello Scream.js\n');
            }).listen(port, '127.0.0.1');
        });
    };

    this.log = winston;
    return this; 
};

module.exports = scream; 