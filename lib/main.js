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
var _ = require('underscore');
var ScreamIO = require('./scream-io');

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
        var currentDir = process.cwd();
        var file = process.argv[2]; // via node command line
        

        if (!fs.existsSync(file)){
            file = path.join(currentDir, file);
        }
        
        if (!fs.existsSync(file)){
            winston.error("Could not find ", file);
            process.exit(1);
        }

        return path.resolve(file);
    };


    var configFilename = this.getConfigFilename();

    this.loadSetup = function() {
        delete require.cache[configFilename]; 
        return clone(require(configFilename));    
    };

    var self = this;
    this.config = this.loadSetup();    
    var setup = this.loadSetup();
    var delta = null;

    this.onFileChanged = function(curr, prev) {

        winston.warn("Filechanged! Try to rebuild");
        winston.info("current mtime: " +curr.mtime);
        winston.info("previous mtime: "+prev.mtime);
        if (curr.mtime == prev.mtime) {
            winston.info("Nothing changed.");
        } else {
            var oldSetup = clone(self.config);
            newSetup = self.loadSetup();  
            delta = diff(newSetup,oldSetup); 
            self.config = self.loadSetup(); 

            if ( !!delta && delta.length !== 0 ) {
                setup = newSetup;
                winston.warn("Rebuilding components with", configFilename);
                self.build(function(){
                    console.log ("delta:", delta/*, "O;",oldSetup, "N;",newSetup*/);
                    winston.info("Rebuilding done...");
                    //self.setup = clone(setup);
                }); 
            } else {
                winston.info("Nothing changed.", delta);
            }

            // filter where condition is true
/*delta = _.filter(delta, function(d) { 
    console.log(d);
    // return true where condition is true for any market
    return _.any(d, function(a) { 
        console.log(a);
        // return true where any outcome has a "test" property defined
        return a.path !== "sprites";
    });
});*/
/*            console.log("this.config a", self.config);
            console.log("setup b", setup);
            console.log("delta c", delta);*/
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
            
            // remove sprite bundled images
            for (var key in setup.images) {
                var image = setup.images[key];
                if (image.createCssRule === false){
                    for (i = 0; i < setup.supportedPixelRatios.length; i++) {
                        var pixelRatio2 = setup.supportedPixelRatios[i];
                        var fn = ScreamIO.file.getImageExportFilename(setup, key, pixelRatio2);
                        winston.warn("removing", fn);
                        fs.unlinkSync(fn);
                    }
                }
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

    this.initializeDirectory = function() {
        // body...
    };

    this.log = winston;
    return this; 
};


module.exports = scream; 