var config = {
	supportedPixelRatios : [1, 1.3, 1.5, 2, 2.1, 3],
	spriteSheetPrefix : "sprite__",							// prefix of spritesheet filenames and classnames
	settings : {
		images : {
			route : "/assets/images/",
			targetCacheDirectory : __dirname + "/../assets/images"
		},
		css: {
			route : "/assets/css/",
			imageUrl : "../../images/",						// points to the target url of image directory. In this case relative to "/assets/css/{pixelResolution}"
			targetCacheDirectory : __dirname + "/../assets/css"
		}
	},
	images : {	
		"test.png" : {										// alias
			filename : __dirname + "/architecture-139533.png",		// original filename
			sprite: "test",										// determines if the image should be included within specified sprite sheet
			batch : [											// image processing shell scripts with paramters
				"-resize", "x150"								// -size width[xheight][+offset]
			]
		} 
	}
};

module.exports = config;