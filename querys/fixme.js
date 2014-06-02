var pg=require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
    async = require("../node_modules/async"),
    client = new pg.Client(conString);
    
var tableName = "error_123";
exports.tableName = tableName;
var errorDesc = '<p>Elemento con tag <i>fixme</i>. En función del tipo de elemento y tags, comprobar si es posible arreglar el "fixme".</p>';
exports.errorDesc = errorDesc;
var numError = 123;
exports.numError = numError;
var title = "Elementos con fixme";
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
  client.connect(function(err) {
	  var insertNumer;
	  var insertNumer2;
	  var insertNumer3;
	  if(err) {
	    callback();
	    return console.error('could not connect to postgres', err);
	  }
	  client.query("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags->'FIXME') IS NOT NULL) OR ((tags->'fixme') IS NOT NULL) OR avals(tags) @> '{fixme}' OR avals(tags) @> '{FIXME}'", function(err, result) {
	    if(err) {
	      callback();
	      return console.error('FIXME  SELECT  error running query', err);
	    }
	    insertNumer = result.rows.length;
	    var ressultCount = result.rows.length;
	    var type = new Array("way");
	    var ids = new Array(); 
	    var resultado = result.rows;
	      for(var i = 0; i < ressultCount; i++){
		  ids[0] = resultado[i].osm_id;
		  var tags = resultado[i].tags;
		  client.query("INSERT INTO error_123 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		    if(err) {
		      console.log("INSERT INTO error_123 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);");
		      insertNumer--;
		      return console.error('FIXME  INSERT  error running query', err);
		    }  
		    else{
		      insertNumer--;
		    }
		     if((insertNumer == 0) && (insertNumer2 == 0)&& (insertNumer3 == 0)){
			console.log("25 - ejecutando fixme ");
			callback();
			client.end();
		    }
		});
	    }
	     if((insertNumer == 0) && (insertNumer2 == 0)&& (insertNumer3 == 0)){
			console.log("25 - ejecutando fixme ");
			callback();
			client.end();
		    }
	}); 
	client.query("SELECT osm_id, way, tags FROM " + token + "_point WHERE ((tags->'FIXME') IS NOT NULL) OR ((tags->'fixme') IS NOT NULL) OR avals(tags) @> '{fixme}' OR avals(tags) @> '{FIXME}'", function(err, result) {
	    if(err) {
	      callback();
	      return console.error('FIXME  SELECT  error running query', err);
	    }
	    insertNumer2 = result.rows.length;
	    var ressultCount = result.rows.length;
	    var type = new Array("node");
	    var ids = new Array(); 
	    var resultado = result.rows;
	      for(var i = 0; i < ressultCount; i++){
		ids[0] = resultado[i].osm_id;
		  var tags = resultado[i].tags;
		  client.query("INSERT INTO error_123 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		    if(err) {
		      console.log("INSERT INTO error_123 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);");
		      insertNumer2--;
		      return console.error('FIXME  INSERT  error running query', err);
		    }  
		    else{
		      insertNumer2--;
		    }
		     if((insertNumer == 0) && (insertNumer2 == 0)&& (insertNumer3 == 0)){
			console.log("25 - ejecutando fixme ");
			callback();
			client.end();
		    }
		  });
	    }
	     if((insertNumer == 0) && (insertNumer2 == 0)&& (insertNumer3 == 0)){
			console.log("25 - ejecutando fixme ");
			callback();
			client.end();
		    }
	}); 
	
	
	client.query("SELECT osm_id, way, tags FROM " + token + "_polygon WHERE ((tags->'FIXME') IS NOT NULL) OR ((tags->'fixme') IS NOT NULL) OR avals(tags) @> '{fixme}' OR avals(tags) @> '{FIXME}'", function(err, result) {
	    if(err) {
	      callback();
	      return console.error('FIXME  SELECT  error running query', err);
	    }
	    insertNumer3 = result.rows.length;
	    var ressultCount = result.rows.length;
	    var type = new Array("way");
	    var ids = new Array(); 
	    var resultado = result.rows;
	      for(var i = 0; i < ressultCount; i++){
		ids[0] = resultado[i].osm_id;
		  var tags = resultado[i].tags;
		  client.query("INSERT INTO error_123 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		    if(err) {
		      console.log("INSERT INTO error_123 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], sARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);");
		      insertNumer3--;
		      return console.error('FIXME  INSERT  error running query', err);
		    }  
		    else{
		      insertNumer3--;
		    }
		     if((insertNumer == 0) && (insertNumer2 == 0) && (insertNumer3 == 0)){
			console.log("25 - ejecutando fixme ");
			callback();
			client.end();
		    }
		  });
	    }
	     if((insertNumer == 0) && (insertNumer2 == 0)&& (insertNumer3 == 0)){
			console.log("25 - ejecutando fixme ");
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
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE error_type = 121 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error121 "+err);
	    client.end();
	  }
	  else{
	    var problem = result.rows[0].problem;
	    if ( problem == "" ){
		
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, * FROM error_121 WHERE \"idError\" = "+idError+";", function (err, result){
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
	      client.query( "DELETE FROM error_121 WHERE \"idError\" = "+idError+";", function (err, result){
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
			else client.end();
		    });
		  }
	      });
	    }
	  }
	});
  });
} 
