var pg = require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
    client = new pg.Client(conString),
    async = require("../node_modules/async");
 
var tableName = "error_107";
exports.tableName = tableName;
var errorDesc = "<p>Un río interseca con una vía</p>\
<p>Formas de solucionarlo: <br/><br/> <ul> \
<li type=\"circle\">Si la carretera es un puente, debe contener el tag \"bridge = yes\"</li>\
<li type=\"circle\">Si la carretera no es un puente y el río pasa por debajo de esta, el río debe contener el tag \"layer = -1\"</li>\
</ul></p>";
exports.errorDesc = errorDesc;
var numError = 107;
exports.numError = numError;
var title = "Río que interseca con una vía";
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
			  client.query( "INSERT INTO error VALUES("+numError+", '"+errorDesc+"', '"+title+"', '"+tableName+"', 'interseccion_rio_via.js');" , function(err, result){
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
	     clientOne.query("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2,ST_AsText(ST_Intersection(p1.way, p2.way)) AS way,  ST_AsText(p1.way) AS way1, ST_AsText( p2.way) AS way2 FROM  " + token + "_line p1, " + token + "_line p2 WHERE ST_Intersects(p1.way,p2.way ) AND ((p1.tags->'bridge') IS NULL AND (p2.tags->'bridge') IS NULL) AND (((p1.layer) IS NULL AND (p2.layer) IS NULL) OR (p1.layer <> p2.layer)) AND ((p1.waterway='river' AND p2.highway is not null) OR (p2.waterway='river' AND p1.highway is not null));", function(err, result) {
		if(err) {
		  callbackParallel();
		  console.log("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2,ST_AsText(ST_Intersection(p1.way, p2.way)) AS way,  ST_AsText(p1.way) AS way1, ST_AsText( p2.way) AS way2 FROM  " + token + "_line p1, " + token + "_line p2 WHERE ST_Intersects(p1.way,p2.way ) AND ((p1.tags->'bridge') IS NULL AND (p2.tags->'bridge') IS NULL) AND (((p1.layer) IS NULL AND (p2.layer) IS NULL) OR (p1.layer <> p2.layer)) AND ((p1.waterway='river' AND p2.highway is not null) OR (p2.waterway='river' AND p1.highway is not null));");
		  console.log('interseccion rio via  SELECT  error running query', err);
		}
		else{
		  var type = new Array("way", "way");
		  var ids = new Array();
		  var geom = new Array();
		  var tags = new Array();
		  async.each(result.rows, function( row, callbackEach) {
		    ids[0] = row.id1;
		    ids[1] = row.id2;
		    geom[0] = row.way1;
		    geom[1] = row.way2;
		    geom[2] = row.way;
		    tags[0] = row.tags1.replace(/'/g, "''");
		    tags[1] = row.tags2.replace(/'/g, "''");
		    clientOne.query("INSERT INTO error_107 (geom, tags, id_osm, type_osm, focus) VALUES (ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore,'"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', ' "+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[2]+"'),900913), 4326));", function(err, result) {
		      if(err) {
			console.log("INSERT INTO error_107 (geom, tags, id_osm, type_osm, focus) VALUES (ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore,'"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', ' "+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[2]+"'),900913), 4326));");
			console.log('interseccion rio via  INSERT  error running query', err);
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
	     clientTwo.query("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2,ST_AsText(ST_Intersection(p1.way, p2.way)),  ST_AsText(p1.way) AS way1, ST_AsText( p2.way) AS way2  FROM  " + token + "_polygon p1, " + token + "_line p2 WHERE ST_Intersects(p1.way,p2.way )  AND ((p1.tags->'bridge') IS NULL AND (p2.tags->'bridge') IS NULL) AND (((p1.layer) IS NULL AND (p2.layer) IS NULL) OR (p1.layer <> p2.layer)) AND ((p1.waterway='river' AND p2.highway is not null) OR (p2.waterway='river' AND p1.highway is not null));", function(err, result) {
		if(err) {
		  callback();
		  console.log("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2,ST_AsText(ST_Intersection(p1.way, p2.way)),  ST_AsText(p1.way) AS way1, ST_AsText( p2.way) AS way2  FROM  " + token + "_polygon p1, " + token + "_line p2 WHERE ST_Intersects(p1.way,p2.way )  AND ((p1.tags->'bridge') IS NULL AND (p2.tags->'bridge') IS NULL) AND (((p1.layer) IS NULL AND (p2.layer) IS NULL) OR (p1.layer <> p2.layer)) AND ((p1.waterway='river' AND p2.highway is not null) OR (p2.waterway='river' AND p1.highway is not null));");
		  console.log('interseccion rio via  SELECT2  error running query', err);
		}
		else{
		  var type = new Array("way", "way");
		  var ids = new Array();
		  var geom = new Array();
		  var tags = new Array();
		  async.each(result.rows, function( row, callbackEach) {
		    ids[0] = row.id1;
		    ids[1] = row.id2;
		    geom[0] = row.way1;
		    geom[1] = row.way2;
		    geom[2] = row.way;
		    tags[0] = row.tags1.replace(/'/g, "''");
		    tags[1] = row.tags2.replace(/'/g, "''");
		    client.query("INSERT INTO error_107 VALUES (ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore,'"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', ' "+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[2]+"'),900913), 4326));", function(err, result) {
		      if(err) {
			console.log("INSERT INTO error_107 VALUES (ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore,'"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', ' "+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[2]+"'),900913), 4326));");
			console.log('interseccion rio via  INSERT2  error running query', err);
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
    console.log("8 - Ejecutando interseccion rio via");
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
	  client.query("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2,ST_AsText(ST_Intersection(p1.way, p2.way)) AS way,  ST_AsText(p1.way) AS way1, ST_AsText( p2.way) AS way2 FROM  " + token + "_line p1, " + token + "_line p2 WHERE ST_Intersects(p1.way,p2.way ) AND ((p1.tags->'bridge') IS NULL AND (p2.tags->'bridge') IS NULL) AND (((p1.layer) IS NULL AND (p2.layer) IS NULL) OR (p1.layer <> p2.layer)) AND ((p1.waterway='river' AND p2.highway is not null) OR (p2.waterway='river' AND p1.highway is not null));", function(err, result) {
	    //console.log("Select 8 ejecutada");
	    if(err) {
	      callback();
	      return console.error('interseccion rio via  SELECT  error running query', err);
	    }
	    insertNumer = (result.rows.length);
	   var ressultCount = result.rows.length;
	    var type = new Array("way", "way");
	    var ids = new Array();
	    var geom = new Array();
	    var tags = new Array();
	    var resultado = result.rows;
	    for(var i = 0; i < ressultCount; i++){
	      ids[0] = resultado[i].id1;
	      ids[1] = resultado[i].id2;
	      geom[0] = resultado[i].way1;
	      geom[1] = resultado[i].way2;
	      geom[2] = resultado[i].way;
	      tags[0] = resultado[i].tags1.replace(/'/g, "''");
	      tags[1] = resultado[i].tags2.replace(/'/g, "''");
	      client.query("INSERT INTO error_107 (geom, tags, id_osm, type_osm, focus) VALUES (ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore,'"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', ' "+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[2]+"'),900913), 4326));", function(err, result) {
		if(err) {
		  console.log("INSERT INTO error_107 (geom, tags, id_osm, type_osm, focus) VALUES (ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore,'"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', ' "+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[2]+"'),900913), 4326));");
		  insertNumer--;
		  return console.error('interseccion rio via  INSERT  error running query', err);
		}  
		else{
		    insertNumer--;
		  }
		if((insertNumer == 0) && (insertNumer2 == 0)){
		  console.log("8 - Ejecutando interseccion rio via");
		  callback();
		  client.end();
		}
	      });
	    }
	    if((insertNumer == 0) && (insertNumer2 == 0)){
		  console.log("8 - Ejecutando interseccion rio via");
		  callback();
		  client.end();
		}
	  });
	  client.query("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2,ST_AsText(ST_Intersection(p1.way, p2.way)),  ST_AsText(p1.way) AS way1, ST_AsText( p2.way) AS way2  FROM  " + token + "_polygon p1, " + token + "_line p2 WHERE ST_Intersects(p1.way,p2.way )  AND ((p1.tags->'bridge') IS NULL AND (p2.tags->'bridge') IS NULL) AND (((p1.layer) IS NULL AND (p2.layer) IS NULL) OR (p1.layer <> p2.layer)) AND ((p1.waterway='river' AND p2.highway is not null) OR (p2.waterway='river' AND p1.highway is not null));", function(err, result) {
	    //console.log("Select 8 ejecutada");	    
	    if(err) {
	      callback();
	      return console.error('interseccion rio via  SELECT2  error running query', err);
	    }
	    insertNumer2 = (result.rows.length);
	    var ressultCount = result.rows.length;
	    var type = new Array("way", "way");
	    var ids = new Array();
	    var geom = new Array();
	    var tags = new Array();
	    var resultado = result.rows;
	    for(var i = 0; i < ressultCount; i++){
	      ids[0] = resultado[i].id1;
	      ids[1] = resultado[i].id2;
	      geom[0] = resultado[i].way1;
	      geom[1] = resultado[i].way2;
	      geom[2] = resultado[i].way;
	      tags[0] = resultado[i].tags1.replace(/'/g, "''");
	      tags[1] = resultado[i].tags2.replace(/'/g, "''");
	       client.query("INSERT INTO error_107 VALUES (ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore,'"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', ' "+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[2]+"'),900913), 4326));", function(err, result) {
		if(err) {
		  console.log("INSERT INTO error_107 VALUES (ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore,'"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', ' "+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[2]+"'),900913), 4326));");
		  insertNumer2--;
		  return console.error('interseccion rio via  INSERT2  error running query', err);
		}  
		else{
		    insertNumer2--;
		  }
		if((insertNumer == 0) && (insertNumer2 == 0)){
		  console.log("8 - Ejecutando interseccion rio via");
		  callback();
		  client.end();
		}
	      });
	    }
	    if((insertNumer == 0) && (insertNumer2 == 0)){
		  console.log("8 - Ejecutando interseccion rio via");
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
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE error_type = 107 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error107 "+err);
	    client.end();
	    callback();
	  }
	  else{
	    var problem = result.rows[0].problem;
	    if ( problem == "" ){
	      client.query("SELECT array_length(geom,1 ) as size, count(array_length(geom,1 )) as count FROM validations WHERE error_type = 110 AND error_id = " + idError + " GROUP BY array_length(geom,1 ) ORDER BY count desc;", function(err, result){
		if(err){
		  callback();
		  client.end();
		  console.log("error "+err);
		}
	      else{
		if(result.rows[0].size ==1){
		  console.log("Solución error 110, id = " + idError + ", una geometría borrada ");
		  callback();
		  client.end();
		 }
		 else{
		    client.query("SELECT count(tags[1]->'bridge') + count (tags[2]->'bridge') as bridge, count(tags[1]->'layer') + count(tags[2]->'layer') as layer FROM validations WHERE error_type = 107 AND error_id = " + idError , function(err, result){
		      if(err){
			console.log("error " + err);
			client.end();
			callback();
		      }
		      else{
			if (result.rows[0].bridge > result.rows[0].layer) console.log("Solución error 107, id = " + idError + ", la carretera es un puente");
			  else console.log("Solución error 107, id = " + idError + ", el río tiene layer");
		      client.end(); 
		      callback();
		      }
		    });
		 }
	      }
	      });
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, GeometryType(geom[2]) as type2, * FROM error_107 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error107 "+err);
		    client.end();
		    callback();
		  }
		  else {
		    var firstEnd = 0;
		    var secondEnd = 0;
		    var table = "";
		    var id = result.rows[0].id_osm[1];
		    switch(result.rows[0].type){
		      case "LINESTRING":
			table = "lines"; break;
		      case "POINT":
			table = "points"; break;
		      case "POLYGON":
			table = "polygons"; break;
		    }
		    client.query( "DELETE FROM validator_"+table+" WHERE id = "+id+" ;", function(err, result){
		      if(err){
			console.log("error getting solution of error107 "+err);
			client.end();
			callback();
		      }
		      else {
			client.query("DELETE FROM error_107 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error107 "+err);
			      client.end();
			      callback();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 107;", function(err, result){
				  if(err){
				    console.log("error getting solution of error107 "+err);
				    client.end();
				    callback();
				  }
				  else {
				    firstEnd = 1;
				    if( secondEnd == 1){
				      client.end();
				      callback();
				    }
				  }
			      });
			    }
			});
		      }
		    });
		    table = "";
		    id = result.rows[0].id_osm[2];
		    switch(result.rows[0].type2){
		      case "LINESTRING":
			table = "lines"; break;
		      case "POINT":
			table = "points"; break;
		      case "POLYGON":
			table = "polygons"; break;
		    }
		    client.query( "DELETE FROM validator_"+table+" WHERE id = "+id+";", function(err, result){
		      if(err){
			console.log("error getting solution of error107 "+err);
			client.end();
			callback();
		      }
		      else {
			secondEnd = 1;
			if(firstEnd == 1 ){
			  client.end();
			  callback();
			}
		      }
		    });
		  }
	      });
	    }
	    
	    else if ( problem == "Elemento correcto" ){
	      client.query( "DELETE FROM error_107 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error107 "+err);
		    client.end();
		    callback();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 107  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error107 "+err);
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