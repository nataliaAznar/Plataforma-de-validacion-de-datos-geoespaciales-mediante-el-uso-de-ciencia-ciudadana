var pg = require("/usr/lib/node_modules/pg"),
    obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
    client = new pg.Client(conString);

var tableName = "error_118";
exports.tableName = tableName;
var errorDesc = "Especificar tipo de agua (natural=water / leisure=swimming_pool / man_made=water_well / amenity=fountain / ...), eliminar landuse=reservoir y/o comprobar que no este duplicado o contenido en otra geometria de agua";
exports.errorDesc = errorDesc;
var numError = 118;
exports.numError = numError;
var title = "Tipo de agua";
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
  client.connect(function(err) {
    var insertNumer;
    var insertNumer2;
	  if(err) {
	    callback();
	    return console.error('could not connect to postgres', err);
	  }
	  client.query("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags->'fixme') like '% tipo de agua %');", function(err, result) {
	    //console.log("Select 19 ejecutada");
	    if(err) {
	      callback();
	      return console.error('tipo de agua  SELECT  error running query', err);
	    }
	    insertNumer = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("way");
	      var ids = new Array();
	      var resultado = result.rows;
	      for(var i = 0; i< ressultCount; i++){
		ids[0] = resultado[i].osm_id;
		var tags = resultado[i].tags;
		client.query("INSERT INTO error_118 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}',ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_118 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}',ARRAY['"+type[0]+"']);");
		    insertNumer--;
		    return console.error('tipo de agua  INSERT  error running query', err);
		  }  
		  else{
		    insertNumer--;
		  }
		  if((insertNumer == 0) && (insertNumer2 == 0)){
		    console.log("19 - Ejecutando tipo de agua");
		    callback();
		    client.end();
		  }
		  });
	      }
	      if((insertNumer == 0) && (insertNumer2 == 0)){
		    console.log("19 - Ejecutando tipo de agua");
		    callback();
		    client.end();
		  }
	  });
	  client.query("SELECT osm_id, way, tags FROM " + token + "_polygon WHERE ((tags->'fixme') like '% tipo de agua %');", function(err, result) {
	    //console.log("Select 19 ejecutada");
	    if(err) {
	      callback();
	      return console.error('tipo de agua  SELECT2  error running query', err);
	    }
	    insertNumer2 = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("way");
	      var ids = new Array();
	      var resultado = result.rows;
	      var resultado = result.rows;
	      for(var i = 0; i< ressultCount; i++){
		ids[0] = resultado[i].osm_id;
		var tags = resultado[i].tags;
		client.query("INSERT INTO error_118 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}',ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_118 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}',ARRAY['"+type[0]+"']);");
		    insertNumer2--;
		    return console.error('tipo de agua  INSERT2  error running query', err);
		  }
		  else{
		    insertNumer2--;
		  }
		  if((insertNumer == 0) && (insertNumer2 == 0)){
		    console.log("19 - Ejecutando tipo de agua");
		    callback();
		    client.end();
		  }
		});
	      }
	      if((insertNumer == 0) && (insertNumer2 == 0)){
		    console.log("19 - Ejecutando tipo de agua");
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
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE Error_type = 118 group by problem", function(err, result){
	  if(err){
	    console.log("error getting solution of error118 "+err);
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
		cclient.query( "SELECT count(tags->'waterway') AS waterway, count(tags->'natural') AS natural, count(tags->'leisure') AS leisure, count(tags->'amenity') AS amenity, count(tags->'emergency') AS emergency, count(tags->'landuse') AS landuse, count(tags->'man_made') AS man_made, count(tags->'mooring') AS mooring  FROM validations WHERE error_type = 118  ", function (err, result){ 
		    if(err){
		      console.log("error getting solution of error118 "+err);
		      client.end();
		    }
		    else{
		      var number = Math.max(result.rows[0].waterway, result.rows[0].natural, result.rows[0].leisure, result.rows[0].amenity, result.rows[0].emergency, result.rows[0].landuse, result.rows[0].man_made, result.rows[0].mooring);
		      var name;
		      if( number = result.rows[0].waterway) name = "waterway";
		      else if ( number = result.rows[0].natural) name = "natural";
		      else if ( number = result.rows[0].leisure) name = "leisure";
		      else if ( number = result.rows[0].amenity) name = "amenity";
		      else if ( number = result.rows[0].emergency) name = "emergency";
		      else if ( number = result.rows[0].landuse) name = "landuse";
		      else if ( number = result.rows[0].man_made) name = "man_made";
		      else if ( number = result.rows[0].mooring) name = "mooring";
		      client.query( "SELECT (tags->'"+name+"') AS name, count(tags->'"+name+"') AS count FROM validations WHERE error_type = 118 and (tags->'"+name+"') is not null GROUP BY (tags->'"+name+"')", function (err, result){
			  if(err){
			    console.log("error getting solution of error118 "+err);
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
	      client.query( "SELECT GeometryType(geom) as type, * FROM error_118 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error118 "+err);
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
			console.log("error getting solution of error118 "+err);
			client.end();
		      }
		      else {
			client.query("DELETE FROM error_118 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error118 "+err);
			      client.end();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 118;", function(err, result){
				  if(err){
				    console.log("error getting solution of error118 "+err);
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
	      client.query( "DELETE FROM error_118 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error118 "+err);
		    client.end();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 118  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error118 "+err);
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