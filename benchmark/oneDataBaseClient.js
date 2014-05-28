 var async = require("async"),
     pg = require("/usr/lib/node_modules/pg"),
     conString = "tcp://postgres:4321@localhost/validator",
     init = new Date().getTime(),
     token = "t1401196527692",
     limit = 10,
     end;

var client = new pg.Client(conString); 
client.connect(function(err){
  async.forever(
      function (next) {
	 if(limit-- > 0 )  next();
	  var init2 = new Date().getTime();
	  client.query("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2,ST_AsText(ST_Intersection(p1.way, p2.way)) AS way,  ST_AsText(p1.way) AS way1, ST_AsText( p2.way) AS way2 FROM  " + token + "_line p1, " + token + "_line p2 WHERE ST_Intersects(p1.way,p2.way ) AND ((p1.tags->'bridge') IS NULL AND (p2.tags->'bridge') IS NULL) AND (((p1.layer) IS NULL AND (p2.layer) IS NULL) OR (p1.layer <> p2.layer)) AND ((p1.waterway='river' AND p2.highway is not null) OR (p2.waterway='river' AND p1.highway is not null));", function(error, result) {
	    if (error) console.log("error "+error);  
	    else  {
	      end = new Date().getTime()
	      var time = end - init2;
	      console.log( "tiempo "+time);
	    }
	  }); 
	 
      },
      function (err) {
	client.end();
      }
  );
});