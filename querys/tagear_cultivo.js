var pg = require("/usr/lib/node_modules/pg"),
    obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
    client = new pg.Client(conString);

var tableName = "error_117";
exports.tableName = tableName;
var errorDesc = "Hace falta especificar qué tipo de cultivo se encuentra en la ubicación";
exports.errorDesc = errorDesc;
var numError = 117;
exports.numError = numError;
var title = "Tipo de cultivo";
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
    var insertNumer3;
	  if(err) {
	    callback();
	    return console.error('could not connect to postgres', err);
	  }
	  client.query("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags->'fixme') like 'Tagear cultivo %');", function(err, result) {
	    //console.log("Select 18 ejecutada");
	    if(err) {
	      callback();
	      return console.error('tagear cultivo  SELECT  error running query', err);
	    }
	    insertNumer = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("way");
	      var ids = new Array();
	      var resultado = result.rows;
	       for(var i = 0; i< ressultCount; i++){
		ids[0] = resultado[i].osm_id;
		var tags = resultado[i].tags;
		client.query("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		    insertNumer--;
		    return console.error('tagear cultivo  INSERT  error running query', err);
		  }  
		  else{
		    insertNumer--;
		  }
		  if((insertNumer == 0) && (insertNumer2 == 0) && (insertNumer3 == 0)){
		    console.log("18 - Ejecutando tagear cultivo");
		    callback();
		  client.end();
		  }
		});
	      }
	      if((insertNumer == 0) && (insertNumer2 == 0) && (insertNumer3 == 0)){
		    console.log("18 - Ejecutando tagear cultivo");
		    callback();
		  client.end();
		  }
	  });
	  client.query("SELECT osm_id, way, tags FROM " + token + "_point WHERE ((tags->'fixme') like 'Tagear cultivo %');", function(err, result) {
	    //console.log("Select 18 ejecutada");
	    if(err) {
	      callback();
	      return console.error('tagear cultivo  SELECT2  error running query', err);
	    }
	    insertNumer2 = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("node");
	      var ids = new Array();
	      var resultado = result.rows;
	       for(var i = 0; i< ressultCount; i++){
		ids[0] = resultado[i].osm_id;
		var tags = resultado[i].tags;
		client.query("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		    insertNumer2--;
		    return console.error('tagear cultivo  INSERT2  error running query', err);
		  }  
		  else{
		    insertNumer2--;
		  }
		  if((insertNumer == 0) && (insertNumer2 == 0) && (insertNumer3 == 0)){
		  console.log("18 - Ejecutando tagear cultivo");
		  callback();
		  client.end();
		  }
		});
	      }
	      if((insertNumer == 0) && (insertNumer2 == 0) && (insertNumer3 == 0)){
		    console.log("18 - Ejecutando tagear cultivo");
		    callback();
		  client.end();
		  }
	  });
	  client.query("SELECT osm_id, way, tags FROM " + token + "_polygon WHERE ((tags->'fixme') like 'Tagear cultivo %');", function(err, result) {
	    //console.log("Select 18 ejecutada");
	    if(err) {
	      callback();
	      return console.error('tagear cultivo  SELECT3  error running query', err);
	    }
	    insertNumer3 = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("way");
	      var ids = new Array();
	      var resultado = result.rows;
	       for(var i = 0; i< ressultCount; i++){
		var tags = resultado[i].tags;
		client.query("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 900913)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 900913)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		    insertNumer3--;
		    return console.error('tagear cultivo  INSERT3  error running query', err);
		  }  
		  else{
		    insertNumer3--;
		  }
		  if((insertNumer == 0) && (insertNumer2 == 0) && (insertNumer3 == 0)){
		    console.log("18 - Ejecutando tagear cultivo");
		    callback();
		    client.end();
		  }
		});
	      }
	      if((insertNumer == 0) && (insertNumer2 == 0) && (insertNumer3 == 0)){
		    console.log("18 - Ejecutando tagear cultivo");
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

	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE Error_type = 117 group by problem", function(err, result){
	  if(err){
	    console.log("error getting solution of error117 "+err);
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
		client.query( "SELECT count(tags->'landuse') AS landuse, count(tags->'natural') AS natural FROM validations WHERE error_type = 117  ", function (err, result){ 
		    if(err){
		      console.log("error getting solution of error117 "+err);
		      client.end();
		    }
		    else{
		      var number = Math.max(result.rows[0].landuse, result.rows[0].natural);
		      var name;
		      if( number = result.rows[0].landuse) name = "landuse";
		      else if ( number = result.rows[0].natural) name = "natural";
		      client.query( "SELECT (tags->'"+name+"') AS name, count(tags->'"+name+"') AS count FROM validations WHERE error_type = 117 and (tags->'"+name+"') is not null GROUP BY (tags->'"+name+"')", function (err, result){
			  if(err){
			    console.log("error getting solution of error117 "+err);
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
	      client.query( "SELECT GeometryType(geom) as type, * FROM error_117 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error117 "+err);
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
			console.log("error getting solution of error117 "+err);
			client.end();
		      }
		      else {
			client.query("DELETE FROM error_117 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error117 "+err);
			      client.end();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 117;", function(err, result){
				  if(err){
				    console.log("error getting solution of error117 "+err);
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
	      client.query( "DELETE FROM error_117 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error117 "+err);
		    client.end();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 117  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error117 "+err);
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
