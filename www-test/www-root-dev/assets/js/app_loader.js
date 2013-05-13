
define([  
  "order!assets/js/jquery.js", 
  "order!assets/js/scream.js",
  "order!assets/js/mocha.js",
  "order!assets/js/test.js"
], function($, scream, mocha, test){ 
  return {
    $: jQuery,
    test:test
  };
});