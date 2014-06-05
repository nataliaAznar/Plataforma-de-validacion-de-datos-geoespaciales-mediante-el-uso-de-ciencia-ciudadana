var pg = require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
     async = require("../node_modules/async"),
    client = new pg.Client(conString);

var tableName = "error_124";
exports.tableName = tableName;
var errorDesc = "<p>No se han encontrado carreteras ni accesos a este edificio. Si es posible añadir carreteras o caminos colindantes.</p>.\
<p>Formas de solucionarlo: <br/><br/> <ul> \
<li type=\"circle\"></li>\
</ul></p>";
exports.errorDesc = errorDesc;
var numError = 124;
exports.numError = numError;
var title = "Edificio sin carreteras";
exports.title = title;
    
exports.createTable = function createTable(callback){
  var client = new pg.Client(conString);
      client.connect(function(err) {
	if ( err ) console.log("error "+err);
	client.query("SELECT EXISTS( SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '"+ tableName+"')"+
		     "AS exists", function(err, result){
	  if (err){
	    console.log("error preparing db "+err);
	  } 
	  else{
	    if(!result.rows[0].exists){
	      client.query( ' CREATE TABLE '+tableName+'(\
		  geom geometry(Geometry,4326)[],\
		  "idError" bigserial,\
		  tags hstore[],\
		  id_osm bigint[],\
		  type_osm text[],\
		  focus geometry(Geometry, 4326),\
		  CONSTRAINT '+ tableName+'pkey PRIMARY KEY ("idError"))\
		  WITH (\
		    OIDS=FALSE\
		  );', function(err, result){
			if ( err ) {
			  console.log( "Error creating "+tableName+ " "+err);
			  client.end();
			}
			else{
			  client.query( "INSERT INTO error VALUES("+numError+", '"+errorDesc+"', '"+title+"', '"+tableName+"', 'casas_sin_carretera.js');" , function(err, result){
			    if(err) console.log("error insert "+tableName+", erro: "+err);
			    callback();
			    client.end();
			  });
			}
		      });
	    }
	    else{
	     callback();
	     client.end();
	    }
	  }
	});
      });
}


exports.test = function test(token, callback){   
  var clientOne = new pg.Client(conString);
  clientOne.connect(function(err) {
    if(err) {
      callback();
      console.log('could not connect to postgres', err);
    }
    else{
      clientOne.query("SELECT p.* from " + token + "_polygon AS p, (SELECT ST_BUFFER( ST_UNION(ST_TRANSFORM(way, 4326 ))::geography, 10 ) AS geom FROM " + token + "_line\
		    WHERE (tags->'highway') IS NOT NULL) AS CARRETERAS WHERE p.tags ? 'building' AND NOT ST_TRANSFORM(p.way, 4326) && CARRETERAS.geom;", function(err, result) {
	  if(err){
	    console.log("SELECT p.* from " + token + "_polygon AS p,\
		(\
		SELECT ST_BUFFER( ST_UNION(ST_TRANSFORM(way, 4326 ))::geography, 10 ) AS geom \
		  FROM " + token + "_line\
		  WHERE (tags->'highway') IS NOT NULL\
		) AS CARRETERAS\
		WHERE p.tags ? 'building' AND NOT ST_TRANSFORM(p.way, 4326) && CARRETERAS.geom;");
	    console.log("error ejecutando casas sin carretera " + err);
	    callback();
	  }
	  else{
	    var type = new Array("way");
	    var ids = new Array();
	    var geom= new Array();
	    var tags = new Array();
	    async.each(result.rows, function( row, callbackEach) {
		ids[0] = row.osm_id;
		geom[0] = row.way;
		tags[0] = row.tags.replace(/'/g, "''");
		clientOne.query("INSERT INTO error_124 (geom, tags, id_osm, type_osm) VALUES (ARRAY[ST_Transform( '"+ geom[0]+"', 4326)], ARRAY['"+tags[0]+"'::hstore], '{"+ids[0]+"}',ARRAY['"+type[0]+"'] );", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_124 (geom, tags, id_osm, type_osm) VALUES (ARRAY[ST_Transform( '"+ geom[0]+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}',ARRAY['"+type[0]+"'] );");
		    console.log('deportes  INSERT  error running query', err);
		  }  
		  callbackEach();
		});
	      
	    }, function(err){
	        console.log("23 - Ejecutando casas sin carreteras");
		callback();
		clientOne.end();
	    });
	  }
	});
    }
  });
  
 
  
//   client.connect(function(err) {
// 	  var insertNumer;
// 	  if(err) {
// 	    callback();
// 	    return console.error('could not connect to postgres', err);
// 	  }
// 	  client.query("SELECT p.* from " + token + "_polygon AS p,\
// 		  (\
// 		  SELECT ST_BUFFER( ST_UNION(ST_TRANSFORM(way, 4326 ))::geography, 10 ) AS geom \
// 		    FROM " + token + "_line\
// 		    WHERE (tags->'highway') IS NOT NULL\
// 		  ) AS CARRETERAS\
// 		  WHERE p.tags ? 'building' AND NOT ST_TRANSFORM(p.way, 4326) && CARRETERAS.geom;", function(err, result) {
// 	    if(err){
// 	      console.log("SELECT p.* from " + token + "_polygon AS p,\
// 		  (\
// 		  SELECT ST_BUFFER( ST_UNION(ST_TRANSFORM(way, 4326 ))::geography, 10 ) AS geom \
// 		    FROM " + token + "_line\
// 		    WHERE (tags->'highway') IS NOT NULL\
// 		  ) AS CARRETERAS\
// 		  WHERE p.tags ? 'building' AND NOT ST_TRANSFORM(p.way, 4326) && CARRETERAS.geom;");
// 	      console.log("error ejecutando casas sin carretera " + err);
// 	      client.end();
// 	    }
// 	   var ressultCount = result.rows.length;
// 	      insertNumer = ((result.rows.length));
// 	      var type = new Array("way");
// 	      var ids = new Array();
// 	      var geom= new Array();
// 	      var tags = new Array();
// 	      var resultado = result.rows;
// 	      for(var i = 0; i < ressultCount; i++){
// 		 ids[0] = resultado[i].osm_id;
// 		  geom[0] = resultado[i].way;
// 		  tags[0] = resultado[i].tags.replace(/'/g, "''");
// 		  client.query("INSERT INTO error_124 (geom, tags, id_osm, type_osm) VALUES (ARRAY[ST_Transform( '"+ geom[0]+"', 4326)], ARRAY['"+tags[0]+"'::hstore], '{"+ids[0]+"}',ARRAY['"+type[0]+"'] );", function(err, result) {
// 		    if(err) {
// 		      console.log("INSERT INTO error_124 (geom, tags, id_osm, type_osm) VALUES (ARRAY[ST_Transform( '"+ geom[0]+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}',ARRAY['"+type[0]+"'] );");
// 		      insertNumer--;
// 		      return console.error('deportes  INSERT  error running query', err);
// 		    }  
// 		    else{
// 		      insertNumer--;
// 		    }
// 		    if(insertNumer == 0){
// 		      console.log("23 - Ejecutando casas sin carreteras");
// 		      callback();
// 		      client.end();
// 		    }
// 		});
// 	      }
// 	      if(insertNumer == 0){
// 		      console.log("23 - Ejecutando casas sin carreteras");
// 		      callback();
// 		      client.end();
// 		    }
// 	  });
// 	  
//   }); 
} 


exports.getSolution = function getSolution(idError, callback){
  client.connect(function(err) {
	if(err) {
	  console.log('could not connect to postgres', err);
	  callback();
	}
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE error_type = 124 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error100 "+err);
	    client.end();
	    callback();
	  }
	  else{
	    var problem = result.rows[0].problem;
	    if ( problem == "" ){
		callback();
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, * FROM error_124 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error100 "+err);
		    client.end();
		    callback();
		  }
		  else {
		    var table = "";
		    var id = [];
		    for ( var i = 0; i<result.rows[0].id_osm.length; i++){
		    id[i] = result.rows[0].id_osm[i];
		    }
		    switch(result.rows[0].type){
		      case "LINESTRING":
			table = "lines"; break;
		      case "POINT":
			table = "points"; break;
		      case "POLYGON":
			table = "polygons"; break;
		    }
		    client.query( "DELETE FROM validator_"+table+" WHERE id = "+id[0]+" or id = "+id[1]+";", function(err, result){
		      if(err){
			console.log("error getting solution of error124 "+err);
			client.end();
			callback();
		      }
		      else {
			client.query("DELETE FROM error_124 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error124 "+err);
			      client.end();
			      callback();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 124;", function(err, result){
				  if(err){
				    console.log("error getting solution of error124 "+err);
				    client.end();
				    callback();
				  }
				  else {
				    client.end();
				    callback();
				  }
			      });
			    }
			});
		      }
		    });
		  }
	      });
	    }
	    
	    else if ( problem == "Elemento correcto" ){
	      client.query( "DELETE FROM error_124 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error124 "+err);
		    client.end();
		    callback();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 124  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error124 "+err);
			  client.end();
			  callback();
			}
			else{
			  client.end();
			  callback();
			}
		    });
		  }
	      });
	    }
	  }
	});
  });
}
 
