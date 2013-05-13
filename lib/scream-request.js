/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  

 
var url = require('url');

function ScreamRequest(req) {
    this.getFileExtension = function(filename){
            var i = filename.lastIndexOf('.');
            return (i < 0) ? '' : filename.substr(i).toLowerCase();
    };
  
    this.getFilename = function () {
        return this.urlParts.split("/").last();
    };

    this.getUrlPartsRaw = function() {
        var urlParts = url.parse(req.url, true);
        return urlParts.path;
    };

    this.getCommand = function() {
        var result = this.urlParts.split('/');
        return result[result.length-2]; 
    };

    this.urlParts = this.getUrlPartsRaw();
    this.filename = this.getFilename();
    this.command = this.getCommand();
    return this;
}

module.exports = ScreamRequest; 