/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  

require('./object_extensions');
var util = require('util');
var winston = require('winston'); 
 
var screamCssResponse = require('./scream-css-response');
var screamImageResponse = require('./scream-image-response');
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

    this.run = function(expressApp, callback) {
        winston.info("Starting scream image server...");
        /*expressApp.get(config.settings.images.route+'*', function(req, res){
            screamImageResponse(config, req, res);
        });
        expressApp.get(config.settings.css.route+'*', function(req, res){
            screamCssResponse(config, req, res, testMode);
        });*/
        this.build(function(){
            winston.info("Scream image server ready");    
            //console.log(util.inspect(config, false, 2, true));
            callback();
        });
    };

    this.log = winston;
    return this; 
};

module.exports = scream; 