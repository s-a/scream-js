// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
  paths: {
    loader: 'assets/js/app_loader'
  }
});

require([
  'app'
], function(App){  

  jQuery(function() {
  	App.initialize(); 
  });
  
});