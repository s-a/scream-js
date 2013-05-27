/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  

var scream = require('../lib/main.js'); 
var testMode = (process.argv[3] === "test" || process.argv[3] === undefined);
var build = (process.argv[3] === "build");
var port = (process.argv[4] || 8080);
var modeString = (testMode ? " [in testMode]" : " [in normalMode]");
var program = require('commander');
//console.log('Current directory: ' + process.cwd(),"XXXXXXXXXXX",process.execPath);

function list(val) {
  return val.split(',').map(Number);
}

function range(val) {
  return val.split('..').map(Number);
}

function list(val) {
  return val.split(',');
}

program
  .version('0.0.1')
  .usage('[options] <file ...>')/*
  .option('-i, --integer <n>', 'An integer argument', parseInt)
  .option('-f, --float <n>', 'A float argument', parseFloat)
  .option('-r, --range <a>..<b>', 'A range', range)
  .option('-l, --list <items>', 'A list', list)
  .option('-o, --optional [value]', 'An optional value')*/
  .parse(process.argv);
/*
console.log(' int: %j', program.integer);
console.log(' float: %j', program.float);
console.log(' optional: %j', program.optional);
program.range = program.range || [];
console.log(' range: %j..%j', program.range[0], program.range[1]);
console.log(' list: %j', program.list);*/
console.log(' args: %j', program.args);
 
program.parse(process.argv);

if (program.args.length === 0){
	console.log('no parms passed');
} else {
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
}	 