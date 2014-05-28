var pg = require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
     async = require("../node_modules/async"),
    client = new pg.Client(conString);
  
var tableName = "error_113";
exports.tableName = tableName;
var errorDesc = "Comprobar si es un parking público o particular, y especificarlo con la etiqueta correspondiente";
exports.errorDesc = errorDesc;
var numError = 113;
exports.numError = numError;
var title = "Parking público o privado";
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
	    clientOne.query("SELECT osm_id, way FROM " + token + "_point WHERE ((tags->'fixme') like 'Comprobar si es %parking %');", function(err, result) {
	    if(err) {
	      callbackParallel("SELECT osm_id, way FROM " + token + "_point WHERE ((tags->'fixme') like 'Comprobar si es %parking %');");
	      console.log()
	      console.log('parking  SELECT  error running query', err);
	    }
	    else{
	      var type = new Array("node");
	      var ids = new Array();
	       async.each(result.rows, function( row, callbackEach) {
		  ids[0] = row.osm_id;
		  var tags = row.tags;
		  clientOne.query("INSERT INTO error_113 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		      if(err) {
			console.log("INSERT INTO error_113 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
			console.log('parking  INSERT  error running query', err);
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
	    clientTwo.query("SELECT osm_id, way FROM " + token + "_polygon WHERE ((tags->'fixme') like 'Comprobar si es %parking %');", function(err, result) {
		if(err) {
		  callback();
		  console.log("SELECT osm_id, way FROM " + token + "_polygon WHERE ((tags->'fixme') like 'Comprobar si es %parking %');");
		  console.log('parking  SELECT2  error running query', err);
		}
		else{
		  var type = new Array("way");
		  var ids = new Array();
		  async.each(result.rows, function( row, callbackEach) {
		    ids[0] = row.osm_id;
		    var tags = row.tags;
		    clientTwo.query("INSERT INTO error_113 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		      if(err) {
			console.log("INSERT INTO error_113 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
			console.log('parking  INSERT2  error running query', err);
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
     console.log("14 - Ejecutando parking");
    clientTwo.end();
    clientOne.end();
    callback();
  });
  /*
  
    client.connect(function(err) {
	  var insertNumer;
	  var insertNumer2;
	  if(err) {
	    callback();
	    return console.error('could not connect to postgres', err);
	  }
	  client.query("SELECT osm_id, way FROM " + token + "_point WHERE ((tags->'fixme') like 'Comprobar si es %parking %');", function(err, result) {
	    //console.log("Select 14 ejecutada");
	    if(err) {
	      callback();
	      return console.error('parking  SELECT  error running query', err);
	    }
	    insertNumer = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("node");
	      var ids = new Array();
	      var resultado = result.rows;
	      for(var i = 0; i < ressultCount ; i++){
		ids[0] = resultado[i].osm_id;
		var tags = resultado[i].tags;
		client.query("INSERT INTO error_113 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_113 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		    insertNumer--;
		    return console.error('parking  INSERT  error running query', err);
		  }  
		  else{
		    insertNumer--;
		  }
		  if((insertNumer == 0) && (insertNumer2 == 0)){
		    console.log("14 - Ejecutando parking");
		    callback();
		    client.end();
		  }
		});
	      }
	      if((insertNumer == 0) && (insertNumer2 == 0)){
		    console.log("14 - Ejecutando parking");
		    callback();
		    client.end();
		  }
	  });
	  client.query("SELECT osm_id, way FROM " + token + "_polygon WHERE ((tags->'fixme') like 'Comprobar si es %parking %');", function(err, result) {
	    //console.log("Select 14 ejecutada");
	    if(err) {
	      callback();
	      return console.error('parking  SELECT2  error running query', err);
	    }
	    insertNumer2 = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("way");
	      var ids = new Array();
	      var resultado = result.rows;
	      for(var i = 0; i < ressultCount ; i++){
		ids[0] = resultado[i].osm_id;
		var tags = resultado[i].tags;
		client.query("INSERT INTO error_113 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_113 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		    insertNumer2--;
		    return console.error('parking  INSERT2  error running query', err);
		  }  
		  else{
		    insertNumer2--;
		  }
		  if((insertNumer == 0) && (insertNumer2 == 0)){
		    console.log("14 - Ejecutando parking");
		    callback();
		    client.end();
		  }
		});
	      }
	      if((insertNumer == 0) && (insertNumer2 == 0)){
		    console.log("14 - Ejecutando parking");
		    callback();
		    client.end();
		  }
	  });
	  
	}); 
  */

}


exports.getSolution = function getSolution(idError, callback){
  client.connect(function(err) {
	if(err) {
	  return console.error('could not connect to postgres', err);
	}
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE Error_type = 131 group by problem", function(err, result){
	  if(err){
	    console.log("error getting solution of error113 "+err);
	    client.end();
	  }
	  else{
	    var problem;
	    var ant = -1;
	    for( var i = 0; i < result.rows.length; i++){
	      if(result.rows[i].count > ant){
		ant = result.rows[i].count ;
		problem = result.rows[i].problem;
	      }
	    }
	    if ( problem == "" ){
		client.query( "SELECT count(tags->'amenity') AS amenity, count(tags->'site') AS site, count(tags->'access') AS access, count(tags->'service') AS service, count(tags->'building') AS building, count(tags->'landuse') AS landuse FROM validations WHERE error_type = 113 ", function (err, result){ 
		    if(err){
		      console.log("error getting solution of error114 "+err);
		      client.end();
		    }
		    else{
		      var number = Math.max(result.rows[0].amenity, result.rows[0].site, result.rows[0].access, result.rows[0].service, result.rows[0].building, result.rows[0].landuse);
		      var name;
		      if( number = result.rows[0].amenity) name = "amenity";
		      else if ( number = result.rows[0].site) name = "site";
		      else if ( number = result.rows[0].access) name = "access";
		      else if ( number = result.rows[0].service) name = "service";
		      else if ( number = result.rows[0].building) name = "building";
		      else if ( number = result.rows[0].landuse) name = "landuse";
		      client.query( "SELECT (tags->'"+name+"') AS name, count(tags->'"+name+"') AS count FROM validations WHERE error_type = 113 and (tags->'"+name+"') is not null GROUP BY (tags->'"+name+"')", function (err, result){
			  if(err){
			    console.log("error getting solution of error114 "+err);
			    client.end();
			  }
			  else{
			  
			  var ant = -1;
			  var name = "";
			  for( var j = 0; j < result.rows.length; j++){
			    if(result.rows[i].count > ant){
			      ant = result.rows[i].count ;
			      name = result.rows[i].name;
			    }
			  }
			}
		      });
		    }
		  });
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom) as type, * FROM error_113 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error113 "+err);
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
			console.log("error getting solution of error113 "+err);
			client.end();
		      }
		      else {
			client.query("DELETE FROM error_113 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error113 "+err);
			      client.end();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 113;", function(err, result){
				  if(err){
				    console.log("error getting solution of error113 "+err);
				    client.end();
				  }
				  else {
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
	      client.query( "DELETE FROM error_113 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error113 "+err);
		    client.end();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 113  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error113 "+err);
			  client.end();
			}
			else client.end();
		    });
		  }
	      });
	    }
	  }
	});
  });
}


