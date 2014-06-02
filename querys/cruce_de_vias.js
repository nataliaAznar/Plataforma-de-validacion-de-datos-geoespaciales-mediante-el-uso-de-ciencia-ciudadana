var pg = require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
     async = require("../node_modules/async"),
    client = new pg.Client(conString);

    
var tableName = "error_101";
exports.tableName = tableName;
var errorDesc = "<p>Dos vías que se cruzan pero no se cortan.</p>\
<p>Formas de solucionarlo: <br/><br/> <ul> \
<li type=\"circle\">Si alguna de las vías no existe, eliminarla.</li>\
<li type=\"circle\">Si las vías se cortan, añadir un nodo para ambas vías en el punto de conexión.</li>\
<li type=\"circle\">Si las vías se encuentran a distintos niveles, añadir el tag \"layer = X\", donde X indica el nivel en el que se encuentra cada vía.</li>\
</ul></p>";
exports.errorDesc = errorDesc;
var numError = 101;
exports.numError = numError;
var title = "Cruce de vías";
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
       var query = "SELECT l1.osm_id as id1, l2.osm_id as id2, ST_ASTEXT(l1.way) as way1, ST_ASTEXT(l2.way) as way2, l1.tags AS tags1, l2.tags AS tags2, ST_ASTEXT(ST_INTERSECTION( l1.way, l2.way)) AS way from " + token + "_line AS l1, " + token + "_line AS l2\
		  WHERE l1.osm_id <> l2.osm_id AND l1.tags ? 'highway' AND l2.tags ? 'highway' AND ST_INTERSECTS( l1.way, l2.way ) AND NOT l1.tags ? 'bridge' AND NOT l2.tags ? 'bridge' AND \
		  NOT l1.tags ? 'tunnel' AND NOT l2.tags ? 'tunnel' AND\
		  ( NOT (l1.tags->'layer') = '-1' OR NOT (l2.tags->'layer') = '-1') AND \
		  ( SELECT count(*)=0 FROM (SELECT (ST_DUMPPOINTS(l1.way)).geom) AS points1,\
		  (SELECT (ST_DUMPPOINTS(l2.way)).geom) AS points2\
		  WHERE points1.geom = points2.geom)\
		  ;"
      clientOne.query( query, function(err, result) {
	if(err) {
	  callback();
	  console.log(query);
	  console.log('cruce de vias  SELECT  error running query', err);
	}
	else{
	  var type = new Array("way", "way");
	  var ids = new Array();
	  var geom= new Array();
	  var tags = new Array();
	   async.each(result.rows, function( row, callbackEach) {
	      ids[0] = row.id1;
	      ids[1] = row.id2;
	      geom[0] = row.way1;
	      geom[1] = row.way2;
	      geom[3] = row.way;
	      tags[0] = row.tags1.replace(/'/g, "''");
	      tags[1] = row.tags2.replace(/'/g, "''");			  
	      clientOne.query("INSERT INTO error_101 (geom, tags, id_osm, type_osm, focus) VALUES (ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore, '"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', '"+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[3]+"'),900913), 4326) );", function(err, result) {
		if(err) {
		  console.log("INSERT INTO error_101 VALUES (ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore, '"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', '"+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[3]+"'),900913), 4326) );");
		  console.log('cruce de vias  INSERT  error running query', err);
		}  
		callbackEach();
	    });     
	  }, function(err){
	       console.log("2 - Ejecutando cruce de vias");
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
// 	  var query = "SELECT l1.osm_id as id1, l2.osm_id as id2, ST_ASTEXT(l1.way) as way1, ST_ASTEXT(l2.way) as way2, l1.tags AS tags1, l2.tags AS tags2, ST_ASTEXT(ST_INTERSECTION( l1.way, l2.way)) AS way from " + token + "_line AS l1, " + token + "_line AS l2\
// 		  WHERE l1.osm_id <> l2.osm_id AND l1.tags ? 'highway' AND l2.tags ? 'highway' AND ST_INTERSECTS( l1.way, l2.way ) AND NOT l1.tags ? 'bridge' AND NOT l2.tags ? 'bridge' AND \
// 		  NOT l1.tags ? 'tunnel' AND NOT l2.tags ? 'tunnel' AND\
// 		  ( NOT (l1.tags->'layer') = '-1' OR NOT (l2.tags->'layer') = '-1') AND \
// 		  ( SELECT count(*)=0 FROM (SELECT (ST_DUMPPOINTS(l1.way)).geom) AS points1,\
// 		  (SELECT (ST_DUMPPOINTS(l2.way)).geom) AS points2\
// 		  WHERE points1.geom = points2.geom)\
// 		  ;"
// 	    client.query( query, function(err, result) {
// 	      if(err) {
// 		callback();
// 		console.log(query);
// 		return console.error('cruce de vias  SELECT  error running query', err);
// 	      }
// 	      var ressultCount = result.rows.length;
// 	      insertNumer = ((result.rows.length));
// 	      var type = new Array("way", "way");
// 	      var ids = new Array();
// 	      var geom= new Array();
// 	      var tags = new Array();
// 	      var resultado = result.rows;
// 	      for(var i = 0; i < ressultCount; i++){
// 		  ids[0] = resultado[i].id1;
// 		  ids[1] = resultado[i].id2;
// 		  geom[0] = resultado[i].way1;
// 		  geom[1] = resultado[i].way2;
// 		  geom[3] = resultado[i].way;
// 		  tags[0] = resultado[i].tags1.replace(/'/g, "''");
// 		  tags[1] = resultado[i].tags2.replace(/'/g, "''");			  
// 		  client.query("INSERT INTO error_101 (geom, tags, id_osm, type_osm, focus) VALUES (ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore, '"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', '"+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[3]+"'),900913), 4326) );", function(err, result) {
// 		    if(err) {
// 		      console.log("INSERT INTO error_101 VALUES (ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore, '"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', '"+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[3]+"'),900913), 4326) );");
// 		      insertNumer--;
// 		      return console.error('cruce de vias  INSERT  error running query', err);
// 		    }  
// 		    else{
// 		      insertNumer--;
// 		    }
// 		    if(insertNumer == 0){
// 		      console.log("2 - Ejecutando cruce de vias");
// 		      callback();
// 		      client.end();
// 		    }
// 		});
// 	      }
// 	      if(insertNumer == 0){
// 		      console.log("2 - Ejecutando cruce de vias");
// 		      callback();
// 		      client.end();
// 		    }
// 	 });
//     });
}


exports.getSolution = function getSolution(idError, callback){
  client.connect(function(err) {
	if(err) {
	  return console.error('could not connect to postgres', err);
	}
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE error_type = 101 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error101 "+err);
	    client.end();
	  }
	  else{
	    var problem = result.rows[0].problem;
	    if ( problem == "" ){
	      //comprobar si se a eliminado alguna geometría
	      client.query("SELECT array_length(geom,1 ) as size, count(array_length(geom,1 )) as count FROM validations WHERE error_type = 101 AND error_id = " + idError + " GROUP BY array_length(geom,1 ) ORDER BY count desc;", function(err, result){
		if(err){
		  client.end();
		  console.log("error "+err);
		}
		else{
		 if(result.rows[0].size ==1){
		  console.log("Solución error 101, id = " + idError + ", una geometría borrada ");
		  client.end();
		 }
		 else{
		   //comprobar si se han añadido los tags "layer"
		   client.query("SELECT (tags[1]->'layer') AS layer, count(tags[1]?'layer') AS count FROM validations WHERE  error_type = 101 AND error_id = " + idError + " GROUP BY layer ORDER BY count des", function(err, result){
		    if (err){
			client.end();
			console.log("error "+err);
		    }
		    else{
		      var layer = result.rows[0].layer;
		      client.query("SELECT (tags[2]->'layer') AS layer, count(tags[2]?'layer') AS count FROM validations WHERE  error_type = 101 AND error_id = " + idError + " GROUP BY layer ORDER BY count des", function(err, result){
			  if (err){
			      client.end();
			      console.log("error "+err);
			  }
			  else{
			    var layer2 = result.rows[0].layer;
			    if( layer || layer2){
			    console.log("Solución error 101, id = " + idError + ", layer1 = " + layer + ", layer2 = " + layer1);
			    client.end();
			    }
			    else{
			    //hayar el punto de unión de las geometrías
			      client.query("SELECT osm_id, ST_AsText(ST_Intersection(geom[1], geom[2])) AS point, ST_AsText(geom[1]) AS geom1, ST_AsText(geom[2]) AS geom[2] FROM validations WHERE error_type = 101 AND error_id = " + idError + ";", function(err, result)  {
				  if(err){
				    console.log("error " + err);
				    client.end();
				  }
				  else{
				    var point = result.rows[0].point;
				    var geom1 = result.rows[0].geom1;
				    var geom2 = result.rows[0].geom2;
				    var id1 = result.rows[0].osm_id[1];
				    var id2 = result.rows[0].osm_id[2];
				    //añadir el punto de unión a las geometrías
				    client.query("SELECT ST_AsText( ST_LineMerge(ST_Union(ST_Line_Substring(line, 0, ST_Line_Locate_Point(line, point)),ST_Line_Substring(line, ST_Line_Locate_Point(line, point), 1)))) as geom\
					  FROM  ST_GeomFromText('" + geom1 + "') as line, \
						ST_GeomFromText('" + point + "') as point;", function(err, result){
				     if(err){
				      console.log("error " + err);
				      client.end();
				     }
				     else{
				       geom1 = result.rows[0].geom;
				       client.query("SELECT ST_AsText( ST_LineMerge(ST_Union(ST_Line_Substring(line, 0, ST_Line_Locate_Point(line, point)),ST_Line_Substring(line, ST_Line_Locate_Point(line, point), 1)))) as geom\
					  FROM  ST_GeomFromText('" + geom2 + "') as line, \
						ST_GeomFromText('" + point + "') as point;", function(err, result){
					if(err){
					 console.log("error ", err);
					 client.end();
					}
					else{
					  geom2 = result.rows[0].geom;
					  //actualizar tablas ¿habría que insertar el punto en la tabla nodes?
					  console.log("solución error 101, id = " + idError + ", se cruzan");
					    client.query("UPDATE validator_lines SET way =  ST_GeomFromText" + geom1 + " WHERE id = " + id1 + ";", function(err, result){
					      if(err){
						console.log("erroe "+err);
						client.end();
					      }
					      else{
						client.query("UPDATE validator_lines SET way =  ST_GeomFromText" + geom2 + " WHERE id = " + id2 + ";", function(err, result){
						  if(err){
						    console.log("erroe "+err);
						    client.end();
						  }
						  else{
						    //eliminar de las tablas de error y validación
						    eliminarTablaError(idError, client, function(){
						      client.end();
						    });
						  }
						});
					      }
					    });
					  
					}
				       });
				       
				     }
				    });
				  }
			      });
			    }
			    
			  }
		      });
		    }
		   });
		 }
		}
	      });
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, GeometryType(geom[2]) as type2, * FROM error_101 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error101 "+err);
		    client.end();
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
			console.log("error getting solution of error101 "+err);
			client.end();
		      }
		      else {
			eliminarTablaError(idError, client, function(){
			  firstEnd = 1;
			  if( secondEnd == 1)
			    client.end();
			}
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
		      }
		      else {
			secondEnd = 1;
			if(firstEnd == 1 )
			client.end();
		      }
		    });
		  }
	      });
	    }
	    
	    else if ( problem == "Elemento correcto" ){
	      eliminarTablaError(idError, client, function(){
		client.end();
	      });
	    }
	  }
	});
  });
}

//eliminar elemento de las tablas de error y validación
function eliminarTablaError(idError, client, callback){
  client.query("DELETE FROM error_101 WHERE \"idError\" = "+idError+";", function(err, result){
	  if(err){
	    console.log("error getting solution of error101 "+err);
	    callback();
	  }
	  else {
	    client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 101;", function(err, result){
		if(err){
		  console.log("error getting solution of error101 "+err);
		  callback();
		}
		else {
		  callback();
		}
	    });
	  }
      });
  
}