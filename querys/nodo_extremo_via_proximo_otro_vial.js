var pg = require("/usr/lib/node_modules/pg"),
    obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
    client = new pg.Client(conString);
    
var tableName = "error_110";
exports.tableName = tableName;
var errorDesc = "<p>Nodo de extremo de vía próximo a otra carretera cerrada y no conectado. En caso de estar conectadas deberían compartir nodo.</p>\
<p>Formas de solucionarlo: <br/><br/> <ul> \
<li type=\"circle\">Si alguna de las carreteras no existe, eliminar esa geometría.</li>\
<li type=\"circle\">Si las dos deben estar conectadas, añadir un nodo para ambas vías en el punto de conexión.</li>\
</ul></p>";
exports.errorDesc = errorDesc;
var numError = 110;
exports.numError = numError;
var title = "Carreteras próximas";
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
	  var insertNumer
	  if(err) {
	    callback();
	    return console.error('could not connect to postgres', err);
	  }
	  client.query("SELECT ST_AsText( ST_MakeLine (ST_ClosestPoint(p1.way, p2.way), ST_ClosestPoint(p2.way, p1.way))) AS line, p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2,st_astext(p1.way) AS way1, st_astext(p2.way) AS way2 FROM " + token + "_line p1, " + token + "_line p2 WHERE p1.highway is not null AND p2.highway is not null AND ((ST_IsClosed(p2.way) AND ( ST_DWithin(ST_EndPoint(p1.way), p2.way, 0.01) OR ST_DWithin(ST_StartPoint(p1.way), p2.way, 0.01))) OR (ST_IsClosed(p1.way) AND (ST_DWithin(ST_EndPoint(p2.way), p1.way, 0.01) OR ST_DWithin(ST_StartPoint(p2.way), p1.way, 0.01)))) AND ST_DISTANCE(p1.way, p2.way)<>0;", function(err, result) {
	    if(err) {
	      callback();
	      return console.error('nodo extremo via proximo a otro vial  SELECT  error running query', err);
	    }
	     insertNumer = ((result.rows.length));
	     var ressultCount = result.rows.length;
	      var type = new Array("way", "way");
	      var ids = new Array();
	      var geom = new Array();
	      var tags = new Array();
	      var resultado = result.rows;
	      for(var i = 0; i < ressultCount ; i++){
		  ids[0] = resultado[i].id1;
		  ids[1] = resultado[i].id2;
		  geom[0] = resultado[i].way1;
		  geom[1] = resultado[i].way2;
		  geom[2] = resultado[i].line;
		  tags[0] = resultado[i].tags1.replace(/'/g, "''");
		  tags[1] = resultado[i].tags2.replace(/'/g, "''");
		  client.query("INSERT INTO error_110 (geom, tags, id_osm, type_osm, focus) VALUES (ARRAY[ST_TRANSFORM( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform( ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore,'"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY[' "+type[0]+"', '"+type[1]+"'], ST_Transform (ST_SetSRID (ST_GeomFromText('"+ geom[2]+"'),900913), 4326));", function(err, result) {
		    if(err) {
		      console.log("INSERT INTO error_110 (geom, tags, id_osm, type_osm, focus) VALUES (ARRAY[ST_TRANSFORM( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform( ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0]+"'::hstore,'"+tags[1]+"'::hstore], '{"+ids[0]+", "+ids[1]+"}',ARRAY[' "+type[0]+"', '"+type[1]+"'], ST_Transform (ST_SetSRID (ST_GeomFromText('"+ geom[2]+"'),900913), 4326));");
		      insertNumer--;
		      return console.error('nodo extremo via proximo a otro vial  INSERT  error running query', err);
		    }  
		    else{
		      insertNumer--;
		    }
		    if(insertNumer == 0){
		      console.log("11 - Ejecutando nodo extremo via proximo otro vial");
		      callback();
		      client.end();
		    }
		  });
	      }
	      if(insertNumer == 0){
		      console.log("11 - Ejecutando nodo extremo via proximo otro vial");
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
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE Error_type = 110 group by problem", function(err, result){
	  if(err){
	    console.log("error getting solution of error110 "+err);
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
	      client.query( "SELECT GeometryType(geom) as type, * FROM error_110 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error110 "+err);
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
			console.log("error getting solution of error110 "+err);
			client.end();
		      }
		      else {
			client.query("DELETE FROM error_110 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error110 "+err);
			      client.end();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 110;", function(err, result){
				  if(err){
				    console.log("error getting solution of error110 "+err);
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
	      client.query( "DELETE FROM error_110 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error110 "+err);
		    client.end();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 110  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error110 "+err);
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