/*! sa main app script */
define('app',[ "order!app_loader" ],  
function(loader){

	var $ = loader.$; 
	function initializeApp(){
		var $window = $(window);

		
		//loader.test.init();
		//var runner = mocha.run(); 
		document.title="done"; 
	}

	return {initialize : initializeApp};
});