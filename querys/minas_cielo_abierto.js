var pg = require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
    async = require("../node_modules/async"),
    client = new pg.Client(conString);
 
var tableName = "error_108";
exports.tableName = tableName;
var errorDesc = "Especificar que son unas minas a cielo abierto.\
<p>Formas de solucionarlo: <br/><br/> <ul> \
<li type=\"circle\">Si es una mina a cielo abierto, añadir el tag landuse = quarry a la geometría.</li>\
<li type=\"circle\">Si la mina no existe, eliminar la geometría</li>\
<li type=\"circle\">Si no es ninguna de las anteriores, seleccionar el problema que se presenta</li>\
</ul></p>";
exports.errorDesc = errorDesc;
var numError = 108;
exports.numError = numError;
var title = "Minas a cielo abierto";
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
   var clientOne, clientTwo ;
    async.parallel([
      function(callbackParallel){
	  clientOne = new pg.Client(conString);
	  clientOne.connect(function(err) {
	    if(err) {
	      callbackParallel();
	      console.log('could not connect to postgres', err);
	    }
	    else{
	      clientOne.query("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags -> 'landuse') = ' surface_mining') AND ((tags-> 'mining_resource') IS NULL OR (tags-> 'mining_resource') = 'FIXME');", function(err, result) {
		if(err) {
		  callbackParallel();
		  console.log('minas a cielo abierto  SELECT  error running query', err);
		}
		else{
		  var type = new Array("way");
		  var ids = new Array();
		  async.each(result.rows, function( row, callbackEach) {
		    ids[0] = row.id1;
		    var tags =row.tags;
		    clientOne.query("INSERT INTO error_108 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
			if(err) {
			  console.log("INSERT INTO error_108 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
			  console.log('minas a cielo abierto  INSERT  error running query', err);
			}  
			callbackEach();
		    });
		  }, function(err){
		      callbackParallel();
		  });
		}
	      });
	    }
	  });
      },
      function(callbackParallel){
	  clientTwo = new pg.Client(conString);
	  clientTwo.connect(function(err) {
	    if(err) {
	      callbackParallel();
	      return console.error('could not connect to postgres', err);
	    }
	    else{
	      clientTwo.query("SELECT osm_id, way, tags FROM " + token + "_polygon WHERE ((tags -> 'landuse') = ' surface_mining') AND ((tags-> 'mining_resource') = 'FIXME');", function(err, result) {
		if(err) {
		  callbackParallel();
		  console.log('minas a cielo abierto  SELECT2  error running query', err);
		}
		else{
		  var type = new Array("way");
		  var ids = new Array();
		  async.each(result.rows, function( row, callbackEach) {
		    ids[0] = row.id1;
		    var tags =row.tags;
		    clientTwo.query("INSERT INTO error_108 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		      if(err) {
			console.log("INSERT INTO error_108 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
			console.log('minas a cielo abierto  INSERT2  error running query', err);
		      } 
		       callbackEach();
		    });
		  }, function(err){
		      callbackParallel();
		  });
		}
	      });
	    }
	  });
      }
  ],

  function(err, results){
    console.log("9 - Ejecutando minas a cielo abierto");
    clientTwo.end();
    clientOne.end();
    callback();
  });
  
  
  
  
  
  
  
  client.connect(function(err) {
	  var insertNumer;
	  var insertNumer2;
	  if(err) {
	    callback();
	    return console.error('could not connect to postgres', err);
	  }
	  client.query("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags -> 'landuse') = ' surface_mining') AND ((tags-> 'mining_resource') IS NULL OR (tags-> 'mining_resource') = 'FIXME');", function(err, result) {
	    //console.log("Select 9 ejecutada");
	    if(err) {
	      callback();
	      return console.error('minas a cielo abierto  SELECT  error running query', err);
	    }
	    insertNumer = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("way");
	      var ids = new Array();
	      var resultado = result.rows;
	      for(var i = 0; i < ressultCount; i++){
		  ids[0] = resultado[i].id1;
		  var tags =resultado[i].tags;
		  client.query("INSERT INTO error_108 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		    if(err) {
		      console.log("INSERT INTO error_108 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		      insertNumer--;
		      return console.error('minas a cielo abierto  INSERT  error running query', err);
		    }  
		    else{
		      insertNumer--;
		    }
		    if((insertNumer == 0) && (insertNumer2 == 0)){
		      console.log("9 - Ejecutando minas a cielo abierto");
		      callback();
		      client.end();
		    }
		 });
	      }
	       if((insertNumer == 0) && (insertNumer2 == 0)){
		      console.log("9 - Ejecutando minas a cielo abierto");
		      callback();
		      client.end();
		    }
	  });
	  client.query("SELECT osm_id, way, tags FROM " + token + "_polygon WHERE ((tags -> 'landuse') = ' surface_mining') AND ((tags-> 'mining_resource') = 'FIXME');", function(err, result) {
	    //console.log("Select 9 ejecutada");
	    if(err) {
	      callback();
	      return console.error('minas a cielo abierto  SELECT2  error running query', err);
	    }
	    insertNumer2 = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("way");
	      var ids = new Array();
	      var resultado = result.rows;
	      for(var i = 0; i < ressultCount; i++){
		ids[0] = resultado[i].id1;
		var tags =resultado[i].tags;
		client.query("INSERT INTO error_108 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_108 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		    insertNumer2--;
		    return console.error('minas a cielo abierto  INSERT2  error running query', err);
		  }  
		  else{
		    insertNumer2--;
		  }
		  if((insertNumer == 0) && (insertNumer2 == 0)){
		    console.log("9 - Ejecutando minas a cielo abierto");
		    callback();
		    client.end();
		  }
		});
	      }
	       if((insertNumer == 0) && (insertNumer2 == 0)){
		    console.log("9 - Ejecutando minas a cielo abierto");
		    callback();
		    client.end();
		  }
	  });
	}); 
}


exports.getSolution = function getSolution(idError, callback){
  client.connect(function(err) {
	if(err) {
	  return console.error('could not connect to postgres', err);
	}
      client.query( "SELECT problem, COUNT(*)  FROM validations WHERE error_type = 108 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error108 "+err);
	    client.end();
	  }
	  else{
	    var problem = result.rows[0].problem;
	    if ( problem == "" ){
		client.query( "SELECT count(tags[1]-> 'landuse') AS count, (tags[1]-> 'landuse' AS mining FROM validations WHERE error_type = 108 error_id = " + idError + " GROUP BY mining ORDER BY count desc, mining desc", function (err, result){ 
		  if(err){
		    console.log("error getting solution of error112 "+err);
		    client.end();
		  }
		  else{
		    var name = result.rows[0].mining;
		    console.log("Resultado de la geometria error_type=108, error_id = "+idError+", "+name);
		    client.end();
		  }
		});
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, * FROM error_108 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error108 "+err);
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
			console.log("error getting solution of error108 "+err);
			client.end();
		      }
		      else {
			client.query("DELETE FROM error_108 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error108 "+err);
			      client.end();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 108;", function(err, result){
				  if(err){
				    console.log("error getting solution of error108 "+err);
				    client.end();
				  }
				  else {
				    console.log("Borrando geometria error_type=108, error_id = "+idError);
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
	      client.query( "DELETE FROM error_108 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error108 "+err);
		    client.end();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 108  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error108 "+err);
			  client.end();
			}
			else{
			  console.log("geometria error_type=108, error_id = "+idError+" is ok");
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