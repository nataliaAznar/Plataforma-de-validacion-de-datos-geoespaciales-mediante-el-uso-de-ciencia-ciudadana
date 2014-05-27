var tests = require('/var/www/localhost/htdocs/validator/tests/tests'),
    fs = require('fs');
exports.importFile = function importFile(extension, fileToChange, token){
  
  fs.readdir('/var/www/localhost/htdocs/validator/importers', function(err, files){
  if (err) console.log(err);
  else {
    var f = extension+'.js';
    f = f.substr(1); // the first '.' must be deleted 
    var a = files.indexOf(f);
    if ( a==-1){
	console.log("Error, that file doesn't exists");
    }
    else{
      f = '/var/www/localhost/htdocs/validator/importers/' + f;
      var imp = require(f);
      
      imp.preanalyzeFile(token, fileToChange, function(filename){
	imp.prepareDB(token, filename, function(){
	  imp.createTempTables( function(){
	    imp.importData( token, filename, function(){
	      tests.runTests(token, function(){
		imp.deleteTempTables(token, function(){
		});
	      });
	    });
	  });
	});
      });
      
      
      
    }
    
  }
  
});
  
}
