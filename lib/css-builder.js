/*
 * Copyright (c) 2013 Stephan Ahlf
 *
 */  

var testModeColors = ["#0072BC","#CD4900","#008641","#01a31c", "#CCFF33", "#B88A00"];
var fs = require("fs");
var path = require("path"); 
var ScreamIO = require('./scream-io');

var cssBuilder = function(config, winston){
	var supportedPixelRatios = config.screamSettings.supportedPixelRatios;


	function decimalValueToFraction(value){

		var highestCommonFactor = function (a, b) { 
			var A = a, B = b;
			while (true) {
				if (!(A%=B)) return B;
				if (!(B%=A)) return A;
			} 
		};


		var valueString = String(value);
		if (valueString.indexOf(".") === -1) return value + "/1";
		whole = valueString.split('.')[0];
		value = parseFloat("."+valueString.split('.')[1]);
		num = "1";
		for(z=0; z<valueString.length-2; z++){
			num += "0";
		}
		value = value*num;
		num = parseInt(num, 10);
		for(z = 2; z < value + 1; z++){
			if(value % z === 0 && num % z === 0){
				value = value / z;
				num = num / z;
				z = 2;
			}
		}

		if (value.toString().length == 2 && num.toString().length == 3) {
			value = Math.round(Math.round(value) / 10);
			num = Math.round(Math.round(num) / 10);
		} else if (value.toString().length == 2 && num.toString().length == 2) {
			value = Math.round(value/10);
			num = Math.round(num/10);
		}

		var t = highestCommonFactor(value, num);
		if (value+"" === "NaN") value = parseInt(valueString, 10);
		return ((whole===0)?"" : whole+" ")+value/t+"/"+num/t;
	}
	
	var getMetaDataByPixelRatio = function(pixelRatio, metaDataBlock) {
		var result = null;
		for (var i = 0; i < metaDataBlock.length; i++) {
			var meta = metaDataBlock[i];
			if (meta.pixelRatio === pixelRatio) {
				result = meta;
				break;
			}
		}
		return result;
	};

	var calculateTopMetaValue = function(sprites) {
		// iterate over sprites
		for(var spriteKey in sprites){
			var images = sprites[spriteKey];
			// iterate over images in sprite 
			for (var i = 0; i < images.length; i++) {
				var image = images[i]; 

				// iterate over meta data per pixelratio
				for (var r = 0; r < image.image.meta.length; r++) {
					var meta = image.image.meta[r];
					var top = 0;
					var space = 0;
					// iterate back over images in sprite 
					for (var i2 = i-1 ; i2 >=0; i2--) {
						var image2 = images[i2]; 
						var meta2 = getMetaDataByPixelRatio(/*meta.pixelRatio*/1, image2.image.meta);
						top += meta2.height;
						space += 0;   
					}

					meta.top = top;
				}
			}			
		}
	};

	var getLongestImage = function(spriteName) {
		// iterate over sprites
		var result = -1;
		for ( var alias in config.screamSettings.images ) {
			var img = config.screamSettings.images[alias];
			if (spriteName === img.sprite){
				var meta = getMetaDataByPixelRatio(/*config.pixelRatio*/1, img.meta);
				if (meta.width > result) result = meta.width;
			}
		}
		return result;
	};

	var buildCssItems = function () {
		 
		var result = [];
		
		for ( var alias in config.screamSettings.images ) {
			var img = config.screamSettings.images[alias];
			img.createCssRule = (img.createCssRule === undefined ? true : !!img.createCssRule); 
			var originalMeta = getMetaDataByPixelRatio(1, img.meta);
			var meta = getMetaDataByPixelRatio(config.pixelRatio, img.meta);

             
			var className = ScreamIO.file.extractFilename( alias.toLowerCase() );

			// ignore sprite bundled images in css
			if (img.sprite !== undefined) img.createCssRule = false;

			if (img.createCssRule){
				result.push('.' + className + '{'); 
				var url = ScreamIO.file.getImageUrl(config.screamSettings, alias, config.pixelRatio);
				result.push('\tdisplay: inline-block;');
				result.push('\tbackground-repeat: no-repeat;');
				result.push('\tbackground-image: url("'+ url + '");');
				if (config.pixelRatio === 1){
					result.push('\tbackground-size: ' + originalMeta.width + 'px ' + originalMeta.height + 'px;');
					result.push('\twidth: ' + originalMeta.width + 'px;');
					result.push('\theight: ' + originalMeta.height + 'px;');
				}
				result.push("}\n");
			}

			if (img.sprite){  
				var x = getLongestImage(img.sprite);
				result.push('.' + img.sprite + '-' + className + '{'); 
				result.push('\twidth: ' + originalMeta.width + 'px;');
				result.push('\theight: ' + originalMeta.height + 'px;'); 
				result.push('\tbackground-size: ' + originalMeta.width*(x/originalMeta.width) + 'px;');					
				result.push('\tbackground-position:0 -' + (meta.top) + 'px;');  
				result.push("}\n");
			}  
		}

		return result;
	};

	var renderMediaQuery = function(pixelRatio){
		var result = [];
		var dpi = 96;

		result.push("only screen and (-webkit-min-device-pixel-ratio: " + pixelRatio + "),");
		result.push("only screen and (min--moz-device-pixel-ratio: " + pixelRatio + "),");
		result.push("only screen and (-o-min-device-pixel-ratio: " + decimalValueToFraction(pixelRatio) + "),");
		result.push("only screen and (min-device-pixel-ratio: " + pixelRatio + "),");
		result.push("only screen and (min-resolution: " + (pixelRatio * dpi) + "dpi),");
		result.push("only screen and (min-resolution: " + pixelRatio + "dppx);\n");
 
		return result;
	};

	this.prepareCssCode = function() {
		var result = ["/* Generator: Scream.js <http://goo.gl/K4tmr> Copyright 2013 AHLF|IT */"];
		var i;
		var pixelRatio;
		var testColor ;
		if(!!config.pixelRatio){
			for (i = 0; i < supportedPixelRatios.length; i++) {
				if (config.pixelRatio === supportedPixelRatios[i]) {
					pixelRatio = supportedPixelRatios[i];	
					testColor = testModeColors[i];
					break;					
				}
			}

			if (!!pixelRatio && config.testMode){
				result.push('body{ background-color:#ccc; color:'+testColor+';}\n');
			} else {
			} 

			result.push.apply(result, buildCssItems());
			result.push.apply(result, this.renderSpriteCssCode(config.pixelRatio));
		} else {
			// create main imports css file 
			for (i = 0; i < supportedPixelRatios.length; i++){
				pixelRatio = supportedPixelRatios[i];
				var maxWidth = 300 * pixelRatio;
				var f = "scream-js.css";
				var fn =  ScreamIO.file.getFilenameByPixelRatio(f, (pixelRatio === null ? 1 : pixelRatio));  
				if (pixelRatio === 1){ // default fallback
					result.push('@import url("scream-js.css");');
				} else {
					if (config.testMode){
							result.push('@import url("' + fn + '") only screen and (min-width: ' + maxWidth + 'px);');
					} else {
						var query = renderMediaQuery(pixelRatio);
						result.push('@import url("' + fn + '") ');
						result.push.apply(result, query); 
					} 
				}
			}
		}
		return result;
	};

	this.renderSpriteCssCodeClasses = function(prefix, images) {
		var result = [];
		var classes = [];
		var currentSprite = "";
		for (var i = 0; i < images.length; i++) {
			var image = images[i];
			if (image.image.sprite){
				classes.push("." + image.image.sprite + "-" + ScreamIO.file.extractFilename(image.alias.toLowerCase())); 
				currentSprite = image.image.sprite;
			}
		}
		var fn = prefix + currentSprite + '.png';
		var url = ScreamIO.file.getImageUrl(config.screamSettings, fn, config.pixelRatio);
		result.push(classes.join(", ")+"{");
		result.push('\tbackground-image: url("'+ url + '");');
		result.push('\tbackground-repeat: no-repeat;');
		result.push('\tdisplay: inline-block;');
		result.push("}\n");
		return result;
	};

	this.renderSpriteCssCode = function(pixelRatio){
		if (config.screamSettings.spriteSheetPrefix) spriteSheetPrefix = config.screamSettings.spriteSheetPrefix;
		var result = [];
		for (var spriteAlias in config.screamSettings.sprites) {
			var spriteImages = config.screamSettings.sprites[spriteAlias];
			if (typeof spriteImages !== "function"){
				var cssCode = this.renderSpriteCssCodeClasses(spriteSheetPrefix, spriteImages);
				result.push.apply(result, cssCode);
			}
		}

		return result;
	};

	this.render = function(){
		calculateTopMetaValue(config.screamSettings.sprites);

		var cssCode = this.prepareCssCode() ;
		return cssCode.join("\n");
	};

	this.save = function() { 
		var dir = path.resolve(config.screamSettings.settings.css.targetCacheDirectory);
		dir = path.join(dir, "scream");
		var emptyDirectory = false;
		if (!config.testMode && config.pixelRatio === null){ 
			if (winston) winston.warn("deleting all files in " + dir);
			emptyDirectory = true;
		}
		ScreamIO.directory.createIfNotExists(dir, emptyDirectory);

		var cssCode = this.render();
		var cssFilename = "scream-js.css";
		if (config.pixelRatio === null) cssFilename = "scream.css";
		 
		var f =  ScreamIO.file.getFilenameByPixelRatio(cssFilename, config.pixelRatio); 
		var fn = path.join(dir, f);
		if (winston) winston.info("Writing " + fn);
		fs.writeFileSync( fn, cssCode );


		
	};
};

module.exports.builder = cssBuilder;