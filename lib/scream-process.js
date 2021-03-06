/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  
var ScreamProcess = function(command){
    var self = this;

    this.execute = function  (parms, done) {
        try{
            this.ls = this.spawn(command, parms); 
            this.ls.on("close", function(code) {
                if (done) done(command, code);
            });
            this.ls.stderr.on("data", function(){
                console.error("Command not found", command);
                if (done) done(command, 1);
            });
            if (this.stdout) this.ls.stdout.on("data", this.stdout);
        } catch(err) {
            if (done) done(command, 1);
        }
    }; 

    this.initialize = function(){
        this.spawn = require('child_process').spawn;
    };
    
    this.initialize();

    return this;
};


module.exports = ScreamProcess;