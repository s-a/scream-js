/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  

var scream = require('../lib/main.js'); 
var configFilename = (process.argv[2] === undefined ? __dirname + "/www-root-images/scream-config.js" : process.argv[2]);
var screamConfig = require(configFilename);
screamConfig.filename = configFilename; 
var testMode = (process.argv[3] === "test" || process.argv[3] === undefined);
var build = (process.argv[3] === "build");
var port = (process.argv[4] || 8080);
var modeString = (testMode ? " [in testMode]" : " [in normalMode]");
var imageServer = new scream(screamConfig, testMode);

imageServer.log.info("Using configuration file", configFilename);
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
 