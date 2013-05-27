scream-js Image Service 
======================
 
beta

Overview
========

To get an overview read http://saquery.com/scream-js-image-server-based-on-node-js

Preview
========
 http://youtu.be/PWEl2Onearw


Dependencies
============

#### NodeJs  
from http://nodejs.org/

***Be shure the commands `convert`, `indentify` and `optipng` are in PATH of your machine.***

#### Windows
- ImageMagick: 	<http://www.imagemagick.org/> 
- OptiPNG: 		<http://optipng.sourceforge.net/> 

#### Linux  
- imageMagick: 	`sudo apt-get install imagemagick`
- OptiPNG: 		`sudo apt-get install optipng`

#### Mac OS X
- imageMagick: 	<http://www.imagemagick.org/script/binary-releases.php#macosx>
- OptiPNG: 		`brew install optipng`


Installation
============

`npm install -g scream-js`

or  

`git clone https://github.com/s-a/scream-js.git`  
`cd scream-js`   
`npm install -g`  

Usage
=====

First you need to setup a Virtual Image Directory. VID settings are stored within a simple Node.js module.
[VID module sample](https://github.com/s-a/scream-js/blob/master/oginial-image-pool/scream-config.js)

#### Start a development server  
`scream oginial-image-pool/scream-config.js`

#### Start a build for deployment server  
`scream oginial-image-pool/scream-config.js --build`

Virtual Image Directory setup
=============================
```javascript
var config = {
	supportedPixelRatios : [1, 1.5, 2, 2.1, 3],
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
		"brand-nodejs-32.png" : {							// alias
			filename : __dirname + "/brand-nodejs.png",		// original filename
			batch : [										// image processing shell scripts with paramters
				'-resize', 'x32'							// -size width[xheight][+offset]
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
		"brand-inverted-nodejs-32.png" : {					// alias
			filename : __dirname + "/brand-nodejs.png",		// original filename
			batch : [										// image processing shell scripts with paramters
				'-resize', 'x32',							// -size width[xheight][+offset]
				'-negate'
			],
			sprite: "page-background"						// determines if the image should be included within specified sprite sheet
		},
		"brand-inverted-watermarked-nodejs-32.png" : {		// alias
			filename : __dirname + "/brand-nodejs.png",		// original filename
			batch : [										// image processing shell scripts with paramters
				'-negate',
				'-colorspace', 'Gray',
				'-font', 'Arial', '-pointsize', '41' ,
				'-draw', 'fill #282828  gravity south text 0,11 scream.js',
				'-font', 'Arial', '-pointsize', '40' ,
				'-draw', 'fill red  gravity south text 0,10 scream.js',
				'-resize', 'x32'							// -size width[xheight][+offset] 
			]
		}
	}
};

module.exports = config;
```

Roadmap
=======
- optional usage of imports in CSS files.
- minify CSS output in non test mode.
- partial rebuild.
Currently Scream.js rebuilds all components if the VID module changes. This will change soon.


Licenses
========

***Open Source- GPL***  
Allows the use of scream.js in GPL-ed projects for free. 

***Commercial License***  
Allows you to use scream.js on one workstation. 
This license costs 210€. 

***Enterprise License***  
Allows you to use scream.js on an unlimited number of workstations 
on the condition that all of them are used by one company. 
This license costs 660€.  

How to purchase for your company?
=================================
To purchase Scream-js Image Service send an E-Mail to purchase-scream-js@ahlf-it.de. Specify the ***license type*** and your ***company name*** and ***address*** in topic or mail text.
