
var ScreamProcess = require('./../lib/scream-process');
var ScreamIO = require('./../lib/scream-io');
var path = require('path');
require('should');


describe('Build process',function(){

  it('should build test config', function(done){
    this.timeout(1000*20);
    var cmd = path.join(__dirname, "/../start-build.sh"); 
    var proc = new ScreamProcess("sh");
    proc.execute([cmd], function(cmd, exitCode) {
      exitCode.should.equal(0);
      done();
    });
  });

  it('should have created CSS files', function(done){
      var css = path.join(__dirname, "/../www-root/assets/css/scream/");
      ScreamIO.file.exists(path.join(css, "scream.css")).should.be.true;
      ScreamIO.file.exists(path.join(css, "scream-js.css")).should.be.true;
      done();
  });

  var imageFolder = path.join(__dirname, "/../www-root/assets/images/scream/"); 
  var configFilename = path.join(__dirname, "/../original-image-pool/scream-config.js");
  var setup = require(configFilename); 
  delete require.cache[configFilename]; 

  it('should have created sprite image files', function(done){
      ScreamIO.file.exists(path.join(imageFolder, "sprite__gui-background.png")).should.be.true;
      ScreamIO.file.exists(path.join(imageFolder, "sprite__page-background.png")).should.be.true;
      done();
  });

  it('should have created non sprite image files', function(done){
      for (var key in setup.images) {
        var img = setup.images[key];
        if (img.sprite === undefined){
          ScreamIO.file.exists(path.join(imageFolder, key)).should.be.true;          
        }
      } 
      done();
  });

  it('should have removed sprite bundled image files', function(done){
      for (var key in setup.images) {
        var img = setup.images[key];
        if (img.sprite !== undefined){
          ScreamIO.file.exists(path.join(imageFolder, key)).should.be.false;
        }
      } 
      done();
  });
  

});