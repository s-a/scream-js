/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  

var ScreamRequest = require('./scream-request');
var cssBuilder = require('./css-builder').builder;

var screamCssResponse = function (config, req, res, testMode) {
    var request = new ScreamRequest(req);
    var state = 200;
    var cssText = ";";

    switch(request.filename){
    case "scream.css":
        var pixelRatio = null;
        if (parseFloat(request.command)+"" !== "NaN") pixelRatio = parseFloat(request.command);
        var css = new cssBuilder({pixelRatio: pixelRatio, screamSettings: config, testMode: testMode}); 
        cssText = css.render();
        break;
    default:
        state = 404;
    }  
    res.writeHead(state, {'Content-Type': 'text/css'});
    res.end(cssText);
};

module.exports = screamCssResponse; 