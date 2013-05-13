define(
	function(){
		/*if (!Fenster)
			Fenster = window.open("http://localhost:3000/", "Zweitfenster1", "width=300,height=200");*/
		
		var getFileExtension = function(filename){
			var i = filename.lastIndexOf('.');
			return (i < 0) ? '' : filename.substr(i).toLowerCase();
		};

		var assert = function(expr, msg) {
			if (!expr) throw new Error(msg || 'failed');
		};

		var screamServerSettings={};
		var addTestImage = function (url, pixelRatio, expectedWidth, expectedHeight) {
			var img = new Image();

			var newUrl = screamServerSettings.settings.images.route+pixelRatio+"/"+url;
			it('should load "' + newUrl + '"', function(done){				
				img.onload = function() {
					done();
				};

				img.onerror = function() { 
					assert(false,"error loading " + this.src);
				};	

				img.src = newUrl; 
			});

			if (expectedWidth || expectedHeight){
				it('should be '+expectedWidth+'x'+expectedHeight+'', function(){ 
					if (expectedWidth) assert(img.width===expectedWidth);
					if (expectedHeight) assert(img.height===expectedHeight); 
				});	
			} 
			$('#scream').append(img);
		};

		var loadImageSettings = function(){ 
			url = ("assets/images/+").replace("//", "/");
			it('should load imagelist "' + url + '"', function(){
				jQuery.ajax({
					type: 'GET',
					url: url,
					dataType: 'json',
					success: function(data) {  
						screamServerSettings = data;
					},
					complete:function(jqXHR, textStatus){
						assert(jqXHR.status===200); 
						
					},
					data: {},
					async: true
				}); 
			});
		};

		var init = function  () {

			mocha.setup('bdd');

			describe('#services', function(){
				loadImageSettings(); 
			});


			describe('#prepare-tests', function(){

				before(function( done ){
					var firstTest = this.test.parent.parent.suites[0].tests[0];  
					while( firstTest.pending ) ;
					done();
				});

				it('should load images', function() { 
					describe('#pixel-ratio-images', function(){
						var filename;
						for ( filename in screamServerSettings.images ) {
							addTestImage(filename, 1, null, 32);
						}  
					});
				});

			});
 
			var testCssBackgroundImage = function(testSettings) { 

				var bgImage = $(".scream__test__image:first").css("background-image");
				var expectedBgImage = screamServerSettings.settings.images.route + testSettings.pixelRatio + "/" + "brand-inverted-nodejs-32.png";
				assert(bgImage.indexOf(expectedBgImage) !== -1, "Unexpected Background Image");
				 
			};			 

			var testSettingsArray = [
				{
					windowWidth:340,
					pixelRatio:1
				},
				{
					windowWidth:500,
					pixelRatio:1.5
				},
				{
					windowWidth:640,
					pixelRatio:2
				},
				{
					windowWidth:790,
					pixelRatio:2.1
				},
				{
					windowWidth:1090,
					pixelRatio:3
				}
			];
			 

				describe('#css', function(){  
					 
					for (var i = 0; i < testSettingsArray.length; i++) {
						var testConf = testSettingsArray[i];
						it('should adjust pixel-ratio-images ('+testSettingsArray[i].pixelRatio+')', function( ) {
							window.resizeTo( testConf.windowWidth, 600 ); 
							testCssBackgroundImage(testConf);  
						});
					}
				});
			 
	
	};

	return {init:init};

});