
var ScreamProcess = function(command){
    var self = this;

    this.execute = function  (parms, done) {
        try{
            this.ls = this.spawn(command, parms); 
            this.ls.on("close", function(code) {
                if (done) done(command, code);
            });
            this.ls.stderr.on("data", function(data) {
                console.error("Command not foundasassasXXX", command);
                if (done) done(command, 1);
            });
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