
var ScreamProcess = require('./../lib/scream-process');
require('should');

describe('Environment',function(){

  it('should find convert command', function(done){
    var proc = new ScreamProcess("convert");
    proc.execute(null, function(cmd, exitCode) {
      exitCode.should.equal(0);
      done();
    });
  });

  it('should find identify command', function(done){
    var proc = new ScreamProcess("identify");
    proc.execute(null, function(cmd, exitCode) {
      exitCode.should.equal(0);
      done();
    });
  });

  it('should find optipng command', function(done){
    var proc = new ScreamProcess("optipng");
    proc.execute(null, function(cmd, exitCode) {
      exitCode.should.equal(0);
      done();
    });
  });

});