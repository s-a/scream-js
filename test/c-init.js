
var ScreamProcess = require('./../lib/scream-process');
var ScreamIO = require('./../lib/scream-io');
var fs = require('fs');
var path = require('path');
require('should');


describe('Create virtual image directory',function(){

  it('should run with --init option', function(done){
    this.timeout(1000*5);
    var cmd = path.join(__dirname, "/../start-init.sh"); 
    var proc = new ScreamProcess("sh");
    proc.execute([cmd], function(cmd, exitCode) {
      exitCode.should.equal(0);
      done();
    });
  });

  var p = path.join(__dirname, "/../original-image-pool/");
  var configFilename = path.join(p, ".scream.js");
  it('should have created VID file', function(done){
      ScreamIO.file.exists(configFilename).should.be.true;
      done();
  });


  var setup;

  it('should load VID setup', function(done){
    delete require.cache[configFilename]; 
    setup = require(configFilename);
    fs.unlinkSync(configFilename);
    done();
  });

  it('should have written main settings', function(done){
    setup.should.have.property('supportedPixelRatios').with.lengthOf(1);
    setup.supportedPixelRatios.should.include(1);
    setup.should.have.property('settings');
    setup.should.have.property('images').should.be.a('object');
    setup.images.should.have.property("brand-nodejs.png");
    var settings = setup.settings;
    settings.should.have.property("images");
    settings.should.have.property("css");
    done();
  });

  it('should have written image settings', function(done){
    var imageSettings = setup.settings.images;
    imageSettings.should.have.property("route");
    imageSettings.should.have.property("targetCacheDirectory");
    done();
  });

  it('should have written css settings', function(done){
    var cssSettings = setup.settings.css;
    cssSettings.should.have.property("route");
    cssSettings.should.have.property("targetCacheDirectory");
    cssSettings.should.have.property("imageUrl");
    done();
  });

});