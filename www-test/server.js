/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  

var scream = require('../lib/main.js'); 
var testMode = (process.argv[3] === "test" || process.argv[3] === undefined);
var build = (process.argv[3] === "build");
var port = (process.argv[4] || 8080);
var modeString = (testMode ? " [in testMode]" : " [in normalMode]");

var imageServer = new scream(testMode);


if (build){
	imageServer.log.info("scream.js image service build started.");    
    imageServer.build(function(){
        imageServer.log.info("scream.js image service build done.");    
    });
} else { 
	imageServer.run(port, function() { 
		imageServer.log.info("scream.js image service listening in" + modeString);    
	});
}
 