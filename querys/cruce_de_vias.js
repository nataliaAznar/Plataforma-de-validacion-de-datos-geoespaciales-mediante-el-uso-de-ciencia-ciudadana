var pg = require("/usr/lib/node_modules/pg"),
    obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
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
    client.connect(function(err) {
	  var insertNumer;
	  if(err) {
	    callback();
	    return console.error('could not connect to postgres', err);
	  }
	  var query = "SELECT l1.osm_id as id1, l2.osm_id as id2, ST_ASTEXT(l1.way) as way1, ST_ASTEXT(l2.way) as way2, l1.tags AS tags1, l2.tags AS tags2, ST_ASTEXT(ST_INTERSECTION( l1.way, l2.way)) AS way from " + token + "_line AS l1, " + token + "_line AS l2\
		  WHERE l1.osm_id <> l2.osm_id AND l1.tags ? 'highway' AND l2.tags ? 'highway' AND ST_INTERSECTS( l1.way, l2.way ) AND NOT l1.tags ? 'bridge' AND NOT l2.tags ? 'bridge' AND \
		  NOT l1.tags ? 'tunnel' AND NOT l2.tags ? 'tunnel' AND\
		  ( NOT (l1.tags->'layer') = '-1' OR NOT (l2.tags->'layer') = '-1') AND \
		  ( SELECT count(*)=0 FROM (SELECT (ST_DUMPPOINTS(l1.way)).geom) AS points1,\
		  (SELECT (ST_DUMPPOINTS(l2.way)).geom) AS points2\
		  WHERE points1.geom = points2.geom)\
		  ;"
	    client.query( query, function(err, result) {
	      if(err) {
		callback();
		console.log(query);
		return console.error('cruce de vias  SELECT  error running query', err);
	      }
	      var ressultCount = result.rows.length;
	      insertNumer = ((result.rows.length));
	      var type = new Array("way", "way");
	      var ids = new Array();
	      var geom= new Array();
	      var tags = new Array();
	      var resultado = result.rows;
	      for(var i = 0; i < ressultCount; i++){
		  ids[0] = resultado[i].id1;
		  ids[1] = resultado[i].id2;
		  geom[0] = resultado[i].way1;
		  geom[1] = resultado[i].way2;
		  geom[3] = resultado[i].way;
		  tags[0] = resultado[i].tags1.replace(/'/g, "''");
		  tags[1] = resultado[i].tags2.replace(/'/g, "''");			  
		  client.query("INSERT INTO error_101 (geom, tags, id_osm, type_osm, focus) VALUES (ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore, '"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', '"+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[3]+"'),900913), 4326) );", function(err, result) {
		    if(err) {
		      console.log("INSERT INTO error_101 VALUES (ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore, '"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY['"+type[0]+"', '"+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[3]+"'),900913), 4326) );");
		      insertNumer--;
		      return console.error('cruce de vias  INSERT  error running query', err);
		    }  
		    else{
		      insertNumer--;
		    }
		    if(insertNumer == 0){
		      console.log("2 - Ejecutando cruce de vias");
		      callback();
		      client.end();
		    }
		});
	      }
	      if(insertNumer == 0){
		      console.log("2 - Ejecutando cruce de vias");
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
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE Error_type = 101 group by problem", function(err, result){
	  if(err){
	    console.log("error getting solution of error101 "+err);
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
		
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom) as type, * FROM error_101 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error101 "+err);
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
			console.log("error getting solution of error101 "+err);
			client.end();
		      }
		      else {
			client.query("DELETE FROM error_101 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error101 "+err);
			      client.end();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 101;", function(err, result){
				  if(err){
				    console.log("error getting solution of error101 "+err);
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
	      client.query( "DELETE FROM error_101 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error101 "+err);
		    client.end();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 101  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error101 "+err);
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