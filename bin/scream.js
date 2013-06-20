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
var fs = require('fs');
var path = require('path');
var ScreamIO = require('./../lib/scream-io');
var ScreamProcess = require('./../lib/scream-process');

program
  .version(require("../package.json").version)
  .usage('sream <virutal image directory [file] ...> [options]')
  .option('-b, --build', 'Build virtual image directory')
  .option('-i, --init [dir]', 'Initialize from current or given directory')
  .option('-s, --sprite [value]', 'used with ---init')
  .option('-z, --size [value]', 'used with ---init ; [height]x[width]')
  .option('-v, --validate', 'Validate system requirements')
  .parse(process.argv);




if (program.validate){
	var cmd = "\"npm test " + path.join(__dirname,  "../") + "\"";
	console.log("Execute", cmd, "to run all test suites");
} else if (program.init){

	if (typeof program.size !== "string"){
		console.error("Need initial --size parm");
		process.exit(1);
	}


	var foundFiles = [];
	var p = ScreamIO.getCommandLineFileOrDirectory(3);
	var getConfigImageItem = function (filename) {
		result = 
		'	"' + filename + '" : {							// alias\n' + 
		'		filename : __dirname + "/' + filename + '",				// original filename\n';
		if (typeof program.sprite === "string") result += 
		'		sprite: "' + program.sprite + '",										// determines if the image should be included within specified sprite sheet\n';
		result += 
		'		batch : [											// image processing shell scripts with paramters\n' + 
		'			"-resize", "' + program.size + '"								// -size width[xheight][+offset]\n' + 
		'		]\n';

		result += 
		'	}';
		return result;
	};

	if (!p) p = process.cwd();



	fs.readdirSync(p).forEach(function(file) {
		var ext =  ScreamIO.file.extractFileExtension(file).toLowerCase();
		if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
			foundFiles.push(file);
		}
	});

	if (foundFiles.length === 0){
		console.log("no files found in ", p);
		process.exit(1);
	}  else {
		var images = [];
		for (var i = 0; i < foundFiles.length; i++) {
			images.push( getConfigImageItem(foundFiles[i]) );
		};
		var data = 'var config = {\n' + 
		'	supportedPixelRatios : [1 /*, 1.3, 1.5, 2, 2.1, 3*/],\n' + 
		'	spriteSheetPrefix : "sprite__",							// prefix of spritesheet filenames and classnames\n' + 
		'	settings : {\n' + 
		'		images : {\n' + 
		'			route : "/assets/images/",\n' + 
		'			targetCacheDirectory : __dirname + "/../www-root/assets/images"\n' + 
		'		},\n' + 
		'		css: {\n' + 
		'			route : "/assets/css/",\n' + 
		'			imageUrl : "../../images/",						// points to the target url of image directory. In this case relative to "/assets/css/{pixelResolution}"\n' + 
		'			targetCacheDirectory : __dirname + "/../www-root/assets/css"\n' + 
		'		}\n' + 
		'	},\n' + 
		'	images : {'+images.join(",\n")+'}\n' + 
		'};\n\n' + 
		'module.exports = config;'

		var file = path.join(p, ".scream.js");
		fs.writeFileSync(file, data);
		console.log("init to ", file);
		console.log("Try: \"scream " + file + "\"");
	}

	//if (process.argv[2].toLowerca)
	//var currentDir = ;
} else {
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
			imageServer.log.info("scream.js image service development build started.");    
			imageServer.run(port, function() { 
				imageServer.log.info("scream.js image service listening in" + modeString);    
			});
		}
	}

}