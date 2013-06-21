
var ScreamProcess = require('./../lib/scream-process');
var ScreamIO = require('./../lib/scream-io');
var path = require('path');
require('should');


describe('Create virtual image directory',function(){

  it('should run with --init option', function(done){
    this.timeout(1000*20);
    var cmd = path.join(__dirname, "/../start-init.sh"); 
    var proc = new ScreamProcess("sh");
    proc.execute([cmd], function(cmd, exitCode) {
      exitCode.should.equal(0);
      done();
    });
  });

  it('should have created VID file', function(done){
      var p = path.join(__dirname, "/../original-image-pool/");
      ScreamIO.file.exists(path.join(p, ".scream.js")).should.be.true;
      done();
  });


});