var pg = require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
     async = require("../node_modules/async"),
    client = new pg.Client(conString);
 
var tableName = "error_114";
exports.tableName = tableName;
var errorDesc = "Generalmente es para parkings privados. No hemos encontrado parkings públicos con este tag";
exports.errorDesc = errorDesc;
var numError = 114;
exports.numError = numError;
var title = "Parking privado";
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


exports.test=function test(token, callback){    
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
	    clientOne.query("SELECT tags, osm_id, way FROM " + token + "_point WHERE ((tags->'FIXME') is not null) AND ((tags-> 'building') = 'garaje') OR ((tags->'landuse') = 'garages') ;", function(err, result) {
		if(err) {
		  return console.error('parking privado  SELECT  error running query', err);
		}
		else{
		  var type = new Array("node");
		  var ids = new Array();
		   async.each(result.rows, function( row, callbackEach) {
		      ids[0] = row.osm_id;
		      var tags = row.tags;
		      clientOne.query("INSERT INTO error_114 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}',ARRAY['"+type[0]+"'] );", function(err, result) {
			if(err) {
			  console.log("INSERT INTO error_114 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}',ARRAY['"+type[0]+"'] );");
			  console.log('parking privado  INSERT  error running query', err);
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
	      client.query("SELECT tags, osm_id, way FROM " + token + "_polygon WHERE ((tags->'FIXME') is not null) AND ((tags-> 'building') = 'garaje') OR ((tags->'landuse') = 'garages') ;", function(err, result) {
		  if(err) {
		    callback();
		    return console.error('parking privado  SELECT2  error running query', err);
		  }
		  else{
		    var type = new Array("way");
		    var ids = new Array();
		    async.each(result.rows, function( row, callbackEach) {
		      ids[0] = row.osm_id;
		      var tags = row.tags;
		      client.query("INSERT INTO error_114 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore],'{"+ids[0]+"}',ARRAY['"+type[0]+"']);", function(err, result) {
			if(err) {
			  console.log("INSERT INTO error_114 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore],'{"+ids[0]+"}',ARRAY['"+type[0]+"']);");
			  console.log('parking privado  INSERT2  error running query', err);
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
    console.log("15 - Ejecutando parking privado");
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
	  client.query("SELECT tags, osm_id, way FROM " + token + "_point WHERE ((tags->'FIXME') is not null) AND ((tags-> 'building') = 'garaje') OR ((tags->'landuse') = 'garages') ;", function(err, result) {
	   // console.log("Select 15 ejecutada");
	    if(err) {
	      return console.error('parking privado  SELECT  error running query', err);
	    }
	    insertNumer = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("node");
	      var ids = new Array();
	      var resultado = result.rows;
	      for(var i = 0; i < ressultCount; i++){
		ids[0] = resultado[i].osm_id;
		  var tags = resultado[i].tags;
		  client.query("INSERT INTO error_114 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}',ARRAY['"+type[0]+"'] );", function(err, result) {
		    if(err) {
		      console.log("INSERT INTO error_114 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}',ARRAY['"+type[0]+"'] );");
		      insertNumer--;
		      return console.error('parking privado  INSERT  error running query', err);
		    }  
		    else{
		      insertNumer--;
		    }
		    if((insertNumer == 0) && (insertNumer2 == 0)){
		      console.log("15 - Ejecutando parking privado");
		      callback();
		      client.end();
		    }
		  });
	      }
	      if((insertNumer == 0) && (insertNumer2 == 0)){
		      console.log("15 - Ejecutando parking privado");
		      callback();
		      client.end();
		    }
	  });
	  client.query("SELECT tags, osm_id, way FROM " + token + "_polygon WHERE ((tags->'FIXME') is not null) AND ((tags-> 'building') = 'garaje') OR ((tags->'landuse') = 'garages') ;", function(err, result) {
	   // console.log("Select 15 ejecutada");
	    if(err) {
	      callback();
	      return console.error('parking privado  SELECT2  error running query', err);
	    }
	    insertNumer2 = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("way");
	      var ids = new Array();
	      var resultado = result.rows;
	      for(var i = 0; i< ressultCount; i++){
		  ids[0] = resultado[i].osm_id;
		  var tags = resultado[i].tags;
		  client.query("INSERT INTO error_114 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore],'{"+ids[0]+"}',ARRAY['"+type[0]+"']);", function(err, result) {
		    if(err) {
		      console.log("INSERT INTO error_114 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore],'{"+ids[0]+"}',ARRAY['"+type[0]+"']);");
		      insertNumer2--;
		      return console.error('parking privado  INSERT2  error running query', err);
		    }  
		    else{
		      insertNumer2--;
		    }
		    if((insertNumer == 0) && (insertNumer2 == 0)){
		      console.log("15 - Ejecutando parking privado");
		      callback();
		      client.end();
		    }
		  });
	      }
	      if((insertNumer == 0) && (insertNumer2 == 0)){
		      console.log("15 - Ejecutando parking privado");
		      callback();
		      client.end();
		    }
	  });
	}); */
}



exports.getSolution = function getSolution(idError, callback){
  client.connect(function(err) {
	if(err) {
	  return console.error('could not connect to postgres', err);
	}
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE error_type = 114 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error114 "+err);
	    client.end();
	  }
	  else{
	    var problem = result.rows[0].problem;
	    if ( problem == "" ){
		client.query( "SELECT count(tags->'amenity') AS amenity, count(tags->'site') AS site, count(tags->'access') AS access, count(tags->'service') AS service, count(tags->'building') AS building, count(tags->'landuse') AS landuse FROM validations WHERE error_type = 114 AND error_id = " + idError + "; ", function (err, result){ 
		    if(err){
		      console.log("error getting solution of error114 "+err);
		      client.end();
		    }
		    else{
		      var number = Math.max(result.rows[0].amenity, result.rows[0].site,result.rows[0].access , result.rows[0].service,result.rows[0].building,result.rows[0].landuse);
		      var name;
		      if( number = result.rows[0].amenity) name = "amenity";
		      else if ( number = result.rows[0].site) name = "site";
		      else if ( number = result.rows[0].access) name = "access";
		      else if ( number = result.rows[0].service) name = "service";
		      else if ( number = result.rows[0].building) name = "building";
		      else if ( number = result.rows[0].landuse) name = "landuse";
		      client.query( "SELECT (tags->'"+name+"') AS name, count(tags->'"+name+"') AS count FROM validations WHERE error_type = 114 AND error_id = " + idError + " AND (tags->'"+name+"') is not null GROUP BY (tags->'"+name+"') ORDER BY count", function (err, result){
			  if(err){
			    console.log("error getting solution of error114 "+err);
			    client.end();
			  }
			  else{
			  var name = result.rows[0].name;
			  console.log("solución error 114, id = " + idError + ", " + name);
			}
		      });
		    }
		  });
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, * FROM error_114 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error114 "+err);
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
			console.log("error getting solution of error114 "+err);
			client.end();
		      }
		      else {
			client.query("DELETE FROM error_114 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error114 "+err);
			      client.end();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 114;", function(err, result){
				  if(err){
				    console.log("error getting solution of error114 "+err);
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
	      client.query( "DELETE FROM error_114 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error114 "+err);
		    client.end();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 114  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error114 "+err);
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


