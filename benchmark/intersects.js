 var async = require("async"),
     pg = require("/usr/lib/node_modules/pg"),
     conString = "tcp://postgres:4321@localhost/validator",
     init = new Date().getTime(),
     token = "t1401196527692",
     end,
     limit = 500;

var client = new pg.Client(conString); 
client.connect(function(err) {
  async.forever(
      function (next) {
	  if(limit-- > 0 ){
	    next();
	    var init2 = new Date().getTime();
	    client.query("SELECT ST_AsText(ST_Intersection(p1.way, p2.way)) AS way FROM  " + token + "_line p1, " + token + "_line p2 WHERE ST_Intersects(p1.way,p2.way );", function(error, result) {
	      if (error) console.log("error "+error);  
	      else  {
		end = new Date().getTime()
		var time = end - init2;
		console.log( "tiempo "+time);
	      }
	    }); 
	  }
	  else{
	    client.end();
	  }
      },
      function (err) {
	console.log ("error " + err);
      }
  );
}); 
 
