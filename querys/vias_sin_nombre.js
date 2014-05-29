 var pg=require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
    async = require("../node_modules/async"),
    client = new pg.Client(conString);
    
var tableName = "error_121";
exports.tableName = tableName;
var errorDesc = "<p>Vías que no tienen el nombre puesto</p><br/>\
<p>Formas de solucionarlo: <br/><br/> <ul> \
<li type=\"circle\">Especificar el nombre con el tag \"name\"</li>\
</ul></p>";
exports.errorDesc = errorDesc;
var numError = 121;
exports.numError = numError;
var title = "Vías sin nombre";
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
		  CONSTRAINT '+ tableName+'_pkey PRIMARY KEY ("idError"))\
		  WITH (\
		    OIDS=FALSE\
		  );', function(err, result){
			if ( err ) {
			  console.log( "Error creating "+tableName+ " "+err);
			  client.end();
			}
			else{
			  client.query( "INSERT INTO error VALUES("+numError+", '"+errorDesc+"', '"+title+"', '"+tableName+"');" , function(err, result){
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
      clientOne.query("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags->'name') IS NULL) AND highway IS NOT NULL", function(err, result) {
	  if(err) {
	    console.log("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags->'name') IS NULL) AND highway IS NOT NULL");
	    callback();
	    console.log('Vias sin nombre  SELECT  error running query', err);
	  }
	  else{
	    var type = new Array("way");
	    var ids = new Array(); 
	     async.each(result.rows, function( row, callbackEach) {
		  ids[0] = row.osm_id;
		  var tags = row.tags;
		  var query = "INSERT INTO error_121 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)],  ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);"
		  clientOne.query(query, function(err, result) {
		    if(err) {
		      console.log(query);
		      return console.error('Vias sin nombre  INSERT  error running query', err);
		    }  
		    callbackEach()
		  });
	      }, function(err){
		console.log("23 - ejecutando vias sin nombre ");
		clientOne.end();
		callback();
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
// 	  client.query("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags->'name') IS NULL) AND highway IS NOT NULL", function(err, result) {
// 	    //console.log("Select 23 ejecutada");
// 	    if(err) {
// 	      console.log("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags->'name') IS NULL) AND highway IS NOT NULL");
// 	      callback();
// 	      return console.error('Vias sin nombre  SELECT  error running query', err);
// 	    }
// 	    insertNumer = result.rows.length;
// 	    var ressultCount = result.rows.length;
// 	    var type = new Array("way");
// 	    var ids = new Array(); 
// 	    var resultado = result.rows;
// 	      for(var i = 0; i < ressultCount; i++){
// 		  ids[0] = resultado[i].osm_id;
// 		  var tags = resultado[i].tags;
// 		  var query = "INSERT INTO error_121 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)],  ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);"
// 		  client.query(query, function(err, result) {
// 		    if(err) {
// 		      console.log(query);
// 		      insertNumer--;
// 		      return console.error('Vias sin nombre  INSERT  error running query', err);
// 		    }  
// 		    else{
// 		      insertNumer--;
// 		    }
// 		    if( insertNumer == 0){
// 			console.log("23 - ejecutando vias sin nombre ");
// 			callback();
// 			client.end();
// 		    }
// 		  });
// 	    }
// 	    if( insertNumer == 0){
// 			console.log("23 - ejecutando vias sin nombre ");
// 			callback();
// 			client.end();
// 		    }
// 	}); 
//     }); 
}

exports.getSolution = function getSolution(idError, callback){
  client.connect(function(err) {
	if(err) {
	  return console.error('could not connect to postgres', err);
	}
	client.query( "SELECT problem, COUNT(*) AS count FROM validations WHERE error_type = 121 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error121 "+err);
	    client.end();
	  }
	  else{
	    var problem = result.rows[0].problem;
	    if ( problem == "" ){
		client.query( "SELECT (tags[1]->'name') AS name, count(tags[1]->'name') AS count FROM validations WHERE error_type = 121 AND error_id = " + idError + " AND (tags->'name') is not null GROUP BY name ORDER BY count desc, name desc ;", function (err, result){
		  if(err){
		    console.log("error getting solution of error121 "+err);
		    client.end();
		  }
		  else{
		    var name = result.rows[0].name;
		    console.log("Resultado de la geometria error_type=121, error_id = "+idError+", "+name);
		    client.end();
		  }
		});
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, * FROM error_121 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error121 "+err);
		    client.end();
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
			console.log("error getting solution of error121 "+err);
			client.end();
		      }
		      else {
			client.query("DELETE FROM error_121 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error121 "+err);
			      client.end();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 121;", function(err, result){
				  if(err){
				    console.log("error getting solution of error121 "+err);
				    client.end();
				  }
				  else {
				    console.log("Borrando geometria error_type=121, error_id = "+idError);
				    client.end();
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
	      client.query( "DELETE FROM error_121 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error121 "+err);
		    client.end();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 121  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error121 "+err);
			  client.end();
			}
			else{
			  console.log("geometria error_type=121, error_id = "+idError+" is ok");
			  client.end();
			}
		    });
		  }
	      });
	    }
	  }
	});
  });
}