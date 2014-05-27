var fs = require('fs');
    
    
exports.runTests = function runTests( token, callback ){
  fs.readdir('/var/www/localhost/htdocs/validator/querys', function(err, files){
      var nFiles = files.length;
      var nReads = 0;
      var i;
      for ( i = 0; i < nFiles; i++) {
	var t = require('../querys/'+files[i]);
	t.test( token, function(){ 
	  nReads++; 
	  if(nReads == nFiles){
	    console.log("run test acaba");
	    callback();
	  }
	});
      }      
  });
}