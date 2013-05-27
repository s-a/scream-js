#!/usr/bin/env node

/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  
 
var scream = require('../lib/main.js'); 
var testMode = (process.argv[3] === "test" || process.argv[3] === undefined);
var port = (process.argv[4] || 8080);
var modeString = " [in development mode]";
var program = require('commander');
 

program
  .version(require("../package.json").version)
  .usage('<virutal image directory file ...> [options]')
  .option('-b, --build', 'Build virtual image directory')
  .parse(process.argv);


 
if (!process.argv[2]) {
	program.help();	
} else {
	var imageServer = new scream(testMode);
	if (program.build){
		imageServer.log.info("scream.js image service build started.");    
		imageServer.build(function(){
			imageServer.log.info("scream.js image service build done.");    
		});
	} else { 
		imageServer.run(port, function() { 
			imageServer.log.info("scream.js image service listening in" + modeString);    
		});
	}
}


