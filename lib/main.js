/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  

require('./object_extensions');
var extend = require('util')._extend;

var fs = require('fs');
var path = require('path');
var winston = require('winston'); 
var http = require('http'); 
var diff = require('deep-diff').diff;
var ScreamImageController = require('./scream-image-controller');
var cssBuilder = require('./css-builder').builder;

function clone (obj) {
    return extend({}, obj); 
}

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



var scream = function(testMode){ 

    this.getConfigFilename = function() {
        var parm = (process.argv[2] === undefined ? __dirname + "/www-root-images/scream-config.js" : process.argv[2]);
        var p = path.dirname(process.mainModule.filename);
        p = path.join(p, parm);
        p = path.resolve(p);
        winston.error(p);
        return p;
    };

    var configFilename = this.getConfigFilename();
    var config = require(configFilename);
    var self = this;
    var setup = clone(config);
    this.config = clone(config);
    var delta = null;

    this.onFileChanged = function(curr, prev) {

        console.log("current mtime: " +curr.mtime);
        console.log("previous mtime: "+prev.mtime);
        if (curr.mtime == prev.mtime) {
            console.log("mtime equal");
        } else {
            winston.warn("Rebuilding components with", configFilename);
            delete require.cache[configFilename]; 
            setup = require(configFilename);  
            delta = diff(self.config, setup);
            console.log("this.config a", self.config);
            console.log("setup b", setup);
            console.log("delta c", delta);
            this.config = clone(setup);
            self.build(function(){
                winston.warn("Rebuilding done...");
            });
        }   
    }; 
     
    this.build = function(callback) {
        var settings = clone(setup);
        settings.testMode = testMode;
        var imageController = new ScreamImageController(settings, winston);
        imageController.renderAll(function() {
            var css = new cssBuilder({pixelRatio: null, screamSettings: settings, testMode: testMode}, winston); 
            css.save();
            for (var i = 0; i < settings.supportedPixelRatios.length; i++) {
                var pixelRatio = settings.supportedPixelRatios[i];
                css = new cssBuilder({pixelRatio: pixelRatio, screamSettings: settings, testMode: testMode}, winston); 
                css.save();
            } 
            callback();
        });
    };

    this.run = function(port, callback) {
        winston.info("Starting scream image service using configuration file", configFilename);
        this.build(function(){
            winston.info("Scream image service ready");    
            fs.watchFile (configFilename, self.onFileChanged);
            http.createServer(function (req, res) {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('Hello Scream.js\n');
            }).listen(port, '127.0.0.1');
            callback(); 
        });
    };

    this.log = winston;
    return this; 
};


module.exports = scream; 