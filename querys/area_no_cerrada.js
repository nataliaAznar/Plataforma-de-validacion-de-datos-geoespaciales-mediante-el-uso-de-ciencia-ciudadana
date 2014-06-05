var pg = require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
    async = require("../node_modules/async"),
    client = new pg.Client(conString);

var tableName = "error_100";
exports.tableName = tableName;
var errorDesc = "<p>Una vía que debería ser un área, ya que tiene tags de este tipo, pero no llega a cerrarse.</p>\
<p>Formas de solucionarlo: <br/><br/> <ul> \
<li type=\"circle\">En caso de que la vía sea un área, modificar la geometría.</li>\
<li type=\"circle\">En caso de que la vía no sea un área, eliminar los tags propios de las áreas</li>\
</ul></p>";
exports.errorDesc = errorDesc;
var numError = 100;
exports.numError = numError;
var title = "Área sin cerrar";
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
		  CONSTRAINT pkey PRIMARY KEY ("idError"))\
		  WITH (\
		    OIDS=FALSE\
		  );', function(err, result){
			if ( err ) {
			  console.log( "Error creating "+tableName+ " "+err);
			  client.end();
			}
			else{
			  var query = "INSERT INTO error VALUES("+numError+", '"+errorDesc+"', '"+title+"', '"+ tableName+"', 'area_no_cerrada.js');";
			  client.query( query , function(err, result){
			    if(err){
			      console.log("error insert "+tableName+", erro: "+err);
			      console.log(query);
			    }
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
	     clientOne.query("SELECT osm_id, way, tags, ST_AsText(ST_MakeLine(ST_EndPoint(way), ST_StartPoint(way))) AS way1  FROM " + token + "_polygon WHERE ST_IsClosed(way) = false;", function(err, result) {
		  if(err) {
		    callbackParallel();
		    console.log("SELECT osm_id, way, tags FROM " + token + "_polygon WHERE ST_IsClosed(way) = false;");
		    console.log('area no cerrada  SELECT  error running query', err);
		  }
		  else{
		    var types = new Array("way");
		    var ids = new Array();
		    async.each(result.rows, function( row, callbackEach) {
			ids[0] = row.osm_id;
			var tags = row.tags;
			var query = "INSERT INTO error_100 (geom, tags, id_osm, type_osm, focus) VALUES (ARRAY[ st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+types[0]+"'], st_transform(ST_SetSRID(ST_GeomFromText('"+ row.way1+"'),900913), 4326) );";
			clientOne.query(query, function(err, result) {
			  if(err) {
			    console.log(query);
			    console.log('area no cerrada  INSERT  error running query', err);
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
	     clientTwo.query("SELECT osm_id, way, tags, ST_AsText(ST_MakeLine(ST_EndPoint(way), ST_StartPoint(way))) AS way1 FROM " + token + "_line WHERE (tags ? 'building' OR tags ? 'landuse' ) AND NOT tags @> '\"area\"=>\"no\"' AND ST_ISCLOSED(way) = FALSE;", function(err, result) {
		if(err) {
		  callback();
		  console.log("SELECT osm_id, way, tags FROM " + token + "_line WHERE (tags ? 'building' OR tags ? 'landuse' ) AND NOT tags @> '\"area\"=>\"no\"' AND ST_ISCLOSED(way) = FALSE;");
		  return console.error('area no cerrada  SELECT2  error running query', err);
		}
		else{
		  var typess = new Array("way");
		  var idss = new Array(); 
		  async.each(result.rows, function( row, callbackEach) {
		    idss[0] = row.osm_id;
		    var tags = row.tags;
		    var query = "INSERT INTO error_100 (geom, tags, id_osm, type_osm, focus) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+idss[0]+"}', ARRAY['"+typess[0]+"'], st_transform(ST_SetSRID(ST_GeomFromText('"+ row.way1+"'),900913), 4326));";
		    clientTwo.query(query, function(err, result) {
		      if(err) {
			console.log(query);
			console.log('area no cerrada  INSERT2  error running query', err);
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
  console.log("1 - Ejecutando area no cerrada");
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
	  client.query("SELECT osm_id, way, tags, ST_AsText(ST_MakeLine(ST_EndPoint(way), ST_StartPoint(way))) AS way1  FROM " + token + "_polygon WHERE ST_IsClosed(way) = false;", function(err, result) {
	   // console.log("Select 1 ejecutada");
	    if(err) {
	      callback();
	      console.log("SELECT osm_id, way, tags FROM " + token + "_polygon WHERE ST_IsClosed(way) = false;");
	      return console.error('area no cerrada  SELECT  error running query', err);
	    }

	    var types = new Array("way");
	    var ids = new Array();
	    var resultado = result.rows;
	    async.each(resultado, function( item, callback2) {
	      var paralelClient = new pg.Client(conString);
		ids[0] = item.osm_id;
		    var tags = item.tags;
		    var query = "INSERT INTO error_100 (geom, tags, id_osm, type_osm, focus) VALUES (ARRAY[ st_transform('"+item.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+types[0]+"'], st_transform(ST_SetSRID(ST_GeomFromText('"+ item.way1+"'),900913), 4326) );";
		    paralelClient.connect(function(err){
		      if(err) {
			  callback2(err);
			  console.log('could not connect to postgres', err);
			}
			paralelClient.query(query, function(err, result) {
			if(err) {
			  console.log(query);
			  insertNumer--;
			  console.error('area no cerrada  INSERT  error running query', err);
			  client.end();
			  paralelClient.end();
			}  
			else{
			  insertNumer--;
			  paralelClient.end();
			}
			if((insertNumer == 0) && (insertNumer2 == 0)){
			  console.log("1 - Ejecutando area no cerrada");
			  callback2();
			  client.end();
			}
		    });
		 });
	      }
	      }, function(err){
		callback();
	    });
	      if((insertNumer == 0) && (insertNumer2 == 0)){
		      console.log("1 - Ejecutando area no cerrada");
		      callback();
		      client.end();
		    }
	  });
	  




	    
	  client.query("SELECT osm_id, way, tags, ST_AsText(ST_MakeLine(ST_EndPoint(way), ST_StartPoint(way))) AS way1 FROM " + token + "_line WHERE (tags ? 'building' OR tags ? 'landuse' ) AND NOT tags @> '\"area\"=>\"no\"' AND ST_ISCLOSED(way) = FALSE;", function(err, result) {
	   // console.log("Select 2 ejecutada");
	    if(err) {
	      callback();
	      console.log("SELECT osm_id, way, tags FROM " + token + "_line WHERE (tags ? 'building' OR tags ? 'landuse' ) AND NOT tags @> '\"area\"=>\"no\"' AND ST_ISCLOSED(way) = FALSE;");
	      return console.error('area no cerrada  SELECT2  error running query', err);
	    }
	    insertNumer2 = (result.rows.length);
	    var ressultCount = result.rows.length;
	    var typess = new Array("way");
	    var idss = new Array();
	    var resultado = result.rows;
	    for(var i = 0; i < ressultCount; i++){
	      console.log(ressultCount);
	      var paralelClient2 = new pg.Client(conString);
	      idss[0] = resultado[i].osm_id;
		var tags = resultado[i].tags;
		var query = "INSERT INTO error_100 (geom, tags, id_osm, type_osm, focus) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+idss[0]+"}', ARRAY['"+typess[0]+"'], st_transform(ST_SetSRID(ST_GeomFromText('"+ resultado[i].way1+"'),900913), 4326));";
		paralelClient2.connect(function(err){
		  console.log("conectado");
		  if(err) {
		      callback();
		      console.log('could not connect to postgres', err);
		    }
		    console.log("a");
		  paralelClient2.query(query, function(err, result) {
		    console.log("Insert hecha");
		    if(err) {
		      console.log(query);
		      insertNumer2--;
		      paralelClient2.end();
		      console.log('area no cerrada  INSERT2  error running query', err);
		    }
		    else{
		      insertNumer2--;
		      paralelClient2.end();
		    }
		    if((insertNumer == 0) && (insertNumer2 == 0)){
		      console.log("1 - Ejecutando area no cerrada");
		      callback();
		      client.end();
		    }
		  });
		});
	    }
	    if((insertNumer == 0) && (insertNumer2 == 0)){
		      console.log("1 - Ejecutando area no cerrada");
		      callback();
		      client.end();
		    }
	  });    
});*/
}


exports.getSolution = function getSolution(idError, callback){
  client.connect(function(err) {
	if(err) {
	  console.log('could not connect to postgres', err);
	  callback();
	}
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE error_type = 100 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error100 "+err);
	    client.end();
	    callback();
	  }
	  else{
	    var problem = result.rows[0].problem;
	    if ( problem == "" ){
		client.query("SELECT ST_IsClosed(geom[1]) as closed, count (ST_IsClosed(geom[1])) FROM validations WHERE error_type = 100 AND error_id = " + idError + " GROUP BY ST_IsClosed(geom[1]) ORDER BY count desc", function(err, result){
		  if(err){
		    console.log("error "+err);
		    client.end();
		    callback();
		  }
		  else{
		    if(result.rows[0].closed){
		      //intersección de todos
		      client.query(" SELECT geom[1] as geometry FROM validations WHERE error_type = 100 AND error_id = " + idError + "", function(err, result){
			if (err){
			  console.log(err);
			  client.end();
			  callback();
			}
			else{
			  var geometries = [];
			  for( var row in result){
			      geometries.push(row.geometry);
			  }
			  var geom = geometries.shift();
			  intersection(geometries, geom,  function(g){
			    //update en tabla line o insert en tabla de poligonos?
			    client.query("UPDATE SET WHERE ", function(err, result){
			      if(err){
				console.log("error " + err);
				client.end();
				callback();
			      }
			    else{
			      eliminarTablaError(idError, client, function(){
				client.end();
				callback();
			      });
			    }
			    });
			  });
			  
			}
		      });
		    }
		    else{
		      //hacer un count de los tags y coger el que más veces esté
		      client.query("SELECT count(tags[1]) as count, tags[1] as tags FROM validations WHERE error_type = 100 AND error_id = " + idError + " GROUP BY tags[1] ORDER BY count desc", function(err, result){
			if(err){
			  console.log("error " + err);
			  client.end();
			  callback();
			}
			  else{
			    var tags = result.rows[0].tags;
			    client.query("SELECT osm_id FROM error100 WHERE \"idError\" = "+idError+";", function(err, result){
			      if(err){
				consol.log("error "+ err);
				client.end();
				callback();
			      }
			      else{
				var id = result.rows[0].osm_id[1];
				client.query("UPDATE validator_lines SET tags = " + tags + "::hstore WHERE id = " + id + ";", function(err, result){
				  if(err){
				   console.log("error " + err);
				   client.end();
				   callback();
				  }
				  else{
				    eliminarTablaError(idError, client, function(){
				      client.end();
				      callback();
				    });
				  }
				});
			      }
			    });
			  }
			});
		    }
		    
		  client.end();
		  }
		});
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, * FROM error_100 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error100 "+err);
		    client.end();
		    callback();
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
			console.log("error getting solution of error100 "+err);
			client.end();
			callback();
		      }
		      else {
			eliminarTablaError(idError, client, function(){
			  client.end();
			  callback();
			});
		      }
		    });
		  }
	      });
	    }
	    
	    else if ( problem == "Elemento correcto" ){
	      eliminarTablaError(idError, client, function(){
		client.end();
		callback();
	      });
	    }
	  }
	});
  });
}



function intersection(geometries, geom, callback){
  var g = geometries.shift();
  client.query("SELECT st_astext(st_intersection(" + geom + ", " + g + ")) as geom;", function(err, result){
    if(err){
      console.log("error " + err);
      client.end();
    }
    else{
      geom = result.rows[0].geom;
      if(geometries.length) intersection(geometries, geom, callback);
      else callback(geom);
    }
  });  
}

//eliminar elemento de las tablas de error y validación
function eliminarTablaError(idError, client, callback){
  client.query( "DELETE FROM error_100 WHERE \"idError\" = "+idError+";", function (err, result){
	if(err){
	  console.log("error getting solution of error100 "+err);
	  client.end();
	  callback();
	}
	else {
	  client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 100  ;", function (err, result){
	      if(err){
		console.log("error getting solution of error100 "+err);
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