var pg = require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
     async = require("../node_modules/async"),
    client = new pg.Client(conString);

    
var tableName = "error_104";
exports.tableName = tableName;
var errorDesc = '<p>Edifios que tienen una parte sobre otro edifcio o directamente están uno dentro del otro.</p>\
<p>Formas de solucionarlo: <br/><br/> <ul> \
<li type=\"circle\">Si dos edificios se superponen y no deberían, arreglar las geometrías para que únicamente compartan contorno.</li>\
<li type=\"circle\">Si un edificio está completamente contenido dentro de otro porque es una parte de este, eliminar el tag <i>building = X</i> del edificio intenrior y utilizar en su lugar\
<i>building:part = X</i>. Más información acerca de este tag en : <a href="http://wiki.openstreetmap.org/wiki/Key:building:part" target="blank">http://wiki.openstreetmap.org/wiki/Key:building:part</a></li>\
</ul></p>';
exports.errorDesc = errorDesc;
var numError = 104;
exports.numError = numError;
var title = "Edificios superpuestos";
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
			  client.query( "INSERT INTO error VALUES("+numError+", '"+errorDesc+"', '"+title+"', '"+tableName+"', 'edificios_superpuestos.js');" , function(err, result){
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
  var clientOne = new pg.Client(conString);
  clientOne.connect(function(err) {
    if(err) {
      callback();
      console.log('could not connect to postgres', err);
    }
    else{
       clientOne.query("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2, st_astext(p1.way) AS way1, st_astext(p2.way) AS way2, ST_AsText(ST_Intersection(p1.way, p2.way)) AS way \
	  FROM " + token + "_polygon p1, " + token + "_polygon p2 \
	  WHERE p1.building IS NOT NULL AND p2.building IS NOT NULL AND ST_Intersects(p1.way,p2.way ) AND p1.osm_id != p2.osm_id AND NOT ST_Touches(p1.way, p2.way) AND \
	  (SELECT count(*)=0 FROM (SELECT (ST_DUMPPOINTS(p1.way)).geom ) AS points1, (SELECT (ST_DUMPPOINTS(p2.way)).geom ) AS points2 WHERE points1.geom = points2.geom) \
	  AND (( NOT (p1.tags ? 'layer')  OR NOT (p2.tags ?'layer')) OR ( (p2.tags -> 'layer') = (p1.tags ->'layer') ));", function(err, result) {
	   // console.log("Select 5 ejecutada");
	    if(err) {
	      callback();
	      console.log("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2, st_astext(p1.way) AS way1, st_astext(p2.way) AS way2, ST_AsText(ST_Intersection(p1.way, p2.way)) AS way \
	  FROM " + token + "_polygon p1, " + token + "_polygon p2 \
	  WHERE p1.building IS NOT NULL AND p2.building IS NOT NULL AND ST_Intersects(p1.way,p2.way ) AND p1.osm_id != p2.osm_id AND NOT ST_Touches(p1.way, p2.way) AND \
	  (SELECT count(*)=0 FROM (SELECT (ST_DUMPPOINTS(p1.way)).geom ) AS points1, (SELECT (ST_DUMPPOINTS(p2.way)).geom ) AS points2 WHERE points1.geom = points2.geom) \
	  AND (( NOT (p1.tags ? 'layer')  OR NOT (p2.tags ?'layer')) OR ( (p2.tags -> 'layer') = (p1.tags ->'layer') ));");
	      console.log('edificios superpuestos  SELECT  error running query', err);
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
		    clientOne.query("INSERT INTO error_104 (geom, tags, id_osm, type_osm, focus) VALUES ( ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore,'"+tags[1]+"'::hstore] , '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', '"+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+geom[2]+"'),900913), 4326));", function(err, result) {
		      if(err) {
			console.log("INSERT INTO error_104 (geom, tags, id_osm, type_osm, focus) VALUES ( ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore,'"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', '"+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+geom[2]+"'),900913), 4326));");
			console.log('edificios superpuestos  INSERT  error running query', err);
		      }  
		      callbackEach();
		    });
		}, function(err){
		    console.log("5 - Ejecutando edificios superpuestos");
		    clientOne.end()
		    callback();
		});
	    }
	  });
    }
  });





  
//     client.connect(function(err) {
// 	  var insertNumer;  
// 	  if(err) {
// 	    callback();
// 	    return console.error('could not connect to postgres', err);
// 	  }
// 	  client.query("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2, st_astext(p1.way) AS way1, st_astext(p2.way) AS way2, ST_AsText(ST_Intersection(p1.way, p2.way)) AS way \
// 	  FROM " + token + "_polygon p1, " + token + "_polygon p2 \
// 	  WHERE p1.building IS NOT NULL AND p2.building IS NOT NULL AND ST_Intersects(p1.way,p2.way ) AND p1.osm_id != p2.osm_id AND NOT ST_Touches(p1.way, p2.way) AND \
// 	  (SELECT count(*)=0 FROM (SELECT (ST_DUMPPOINTS(p1.way)).geom ) AS points1, (SELECT (ST_DUMPPOINTS(p2.way)).geom ) AS points2 WHERE points1.geom = points2.geom) \
// 	  AND (( NOT (p1.tags ? 'layer')  OR NOT (p2.tags ?'layer')) OR ( (p2.tags -> 'layer') = (p1.tags ->'layer') ));", function(err, result) {
// 	   // console.log("Select 5 ejecutada");
// 	    if(err) {
// 	      callback();
// 	      console.log("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2, st_astext(p1.way) AS way1, st_astext(p2.way) AS way2, ST_AsText(ST_Intersection(p1.way, p2.way)) AS way \
// 	  FROM " + token + "_polygon p1, " + token + "_polygon p2 \
// 	  WHERE p1.building IS NOT NULL AND p2.building IS NOT NULL AND ST_Intersects(p1.way,p2.way ) AND p1.osm_id != p2.osm_id AND NOT ST_Touches(p1.way, p2.way) AND \
// 	  (SELECT count(*)=0 FROM (SELECT (ST_DUMPPOINTS(p1.way)).geom ) AS points1, (SELECT (ST_DUMPPOINTS(p2.way)).geom ) AS points2 WHERE points1.geom = points2.geom) \
// 	  AND (( NOT (p1.tags ? 'layer')  OR NOT (p2.tags ?'layer')) OR ( (p2.tags -> 'layer') = (p1.tags ->'layer') ));");
// 	      return console.error('edificios superpuestos  SELECT  error running query', err);
// 	    }
// 	    var ressultCount = result.rows.length;
// 	    insertNumer = ((result.rows.length));
// 	    var type = new Array("way", "way");
// 	    var ids = new Array();
// 	    var geom = new Array();
// 	    var tags = new Array();
// 	    var resultado = result.rows;
// 	   for(var i = 0; i < ressultCount; i++){
// 		  ids[0] = resultado[i].id1;
// 		  ids[1] = resultado[i].id2;
// 		  geom[0] = resultado[i].way1;
// 		  geom[1] = resultado[i].way2;
// 		  geom[2] = resultado[i].way;
// 		  tags[0] = resultado[i].tags1.replace(/'/g, "''");
// 		  tags[1] = resultado[i].tags2.replace(/'/g, "''");
// 		    client.query("INSERT INTO error_104 (geom, tags, id_osm, type_osm, focus) VALUES ( ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore,'"+tags[1]+"'::hstore] , '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', '"+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+geom[2]+"'),900913), 4326));", function(err, result) {
// 		    if(err) {
// 		      console.log("INSERT INTO error_104 (geom, tags, id_osm, type_osm, focus) VALUES ( ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore,'"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', '"+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+geom[2]+"'),900913), 4326));");
// 		      insertNumer--;
// 		      return console.error('edificios superpuestos  INSERT  error running query', err);
// 		    }  
// 		    else{
// 		      insertNumer--;
// 		    }
// 		    if(insertNumer == 0){
// 		      console.log("5 - Ejecutando edificios superpuestos");
// 		      callback();
// 		      client.end();
// 		    }
// 		  });
// 	    }
// 	    if(insertNumer == 0){
// 		      console.log("5 - Ejecutando edificios superpuestos");
// 		      callback();
// 		      client.end();
// 		    }
// 	   }); 
// 	});  
}

exports.getSolution = function getSolution(idError, callback){
  client.connect(function(err) {
	if(err) {
	  console.log('could not connect to postgres', err);
	}
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE error_type = 104 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error104 "+err);
	    client.end();
	    callback();
	  }
	  else{
	     var problem = result.rows[0].problem;
	    if ( problem == "" ){
		 //comprobar si se a eliminado alguna geometría
	      client.query("SELECT array_length(geom,1 ) as size, count(array_length(geom,1 )) as count FROM validations WHERE error_type = 101 AND error_id = " + idError + " GROUP BY array_length(geom,1 ) ORDER BY count desc;", function(err, result){
		if(err){
		  client.end();
		  console.log("error "+err);
		  callback();
		}
		else{
		 if(result.rows[0].size ==1){
		  console.log("Solución error 101, id = " + idError + ", una geometría borrada ");
		  client.end();
		  callback();
		 }
		 else{
		   //comprobar topología
		   callback();
		 }
		}
	      });
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, GeometryType(geom[2]) as type2, * FROM error_104 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error104 "+err);
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
		    client.query( "DELETE FROM validator_"+table+" WHERE id = "+id+";", function(err, result){
		      if(err){
			console.log("error getting solution of error104 "+err);
			client.end();
			callback();
		      }
		      else {
			client.query("DELETE FROM error_104 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error104 "+err);
			      client.end();
			      callback();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 104;", function(err, result){
				  if(err){
				    console.log("error getting solution of error104 "+err);
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
			console.log("error getting solution of error104 "+err);
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
	      client.query( "DELETE FROM error_104 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error104 "+err);
		    client.end();
		    callback();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 104  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error104 "+err);
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
	  }
	});
  });
}