
var ScreamProcess = require('./../lib/scream-process');

before(function(){
  //TODO seed the database
});


describe('Environment',function(){

  beforeEach(function(){
    //todo log in test user
  });
  
  it('scream --validate', function(done){
  	 
	var proc = new ScreamProcess("node");

	proc.execute(["./../bin/scream.js","--validate"], function(cmd, exitCode) {
		exitCode.should.equal(0);
	  	done();
	});

  });

});