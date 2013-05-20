 var config = {
	supportedPixelRatios : [1, 1.3, 1.5, 2, 2.1, 3],
	spriteSheetPrefix : "sprite__",							// prefix of spritesheet filenames and classnames
	settings : {
		images : {
			route : "/assets/images/",
			targetCacheDirectory : __dirname + "/../www-root-dev/assets/images"
		},
		css: {
			route : "/assets/css/",
			imageUrl : "../../images/",						// points to the target url of image directory. In this case relative to "/assets/css/{pixelResolution}"
			targetCacheDirectory : __dirname + "/../www-root-dev/assets/css"
		}
	},
	images : {
		"brand-nodejs-64.png" : {							// alias
			filename : __dirname + "/brand-nodejs.png",		// original filename
			batch : [										// image processing shell scripts with paramters
				'-resize', 'x64'							// -size width[xheight][+offset]
				],
			sprite: "gui-background"						// determines if the image should be included within specified sprite sheet
		},
		"brand-grayscale-nodejs-32.png" : {					// alias
			filename : __dirname + "/brand-nodejs.png",		// original filename
			batch : [										// image processing shell scripts with paramters
				'-resize', 'x32',							// -size width[xheight][+offset]
				'-colorspace', 'Gray'
				],
			sprite: "gui-background",						// determines if the image should be included within specified sprite sheet
			createCssRule: false							// default: true. Determines if scream-js should create a css rule for background-image
		},
		"brand-inverted-nodejs-64.png" : {					// alias
			filename : __dirname + "/brand-nodejs.png",		// original filename
			batch : [										// image processing shell scripts with paramters
				'-resize', 'x64',							// -size width[xheight][+offset]
				'-negate'
				],
			sprite: "page-background"						// determines if the image should be included within specified sprite sheet
		},
		"brand-inverted-watermarked-nodejs-32.png" : {		// alias
			filename : __dirname + "/brand-nodejs.png",		// original filename
			batch : [										// image processing shell scripts with paramters
			'-negate',
			'-colorspace', 'Gray',
			'-resize', 'x32'							// -size width[xheight][+offset] 
			]
			},
		"brand-nodejs-sketch-64.png" : {					// alias
			filename : __dirname + "/brand-nodejs.png",		// original filename
			batch : [										// image processing shell scripts with paramters
			'-charcoal', '5',
				'-resize', 'x64'							// -size width[xheight][+offset] 
				],
				sprite: "gui-background"
			}

		}
	};

	module.exports = config;
