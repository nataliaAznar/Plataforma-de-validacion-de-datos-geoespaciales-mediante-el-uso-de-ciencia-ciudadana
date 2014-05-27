var pg = require("/usr/lib/node_modules/pg"),
    obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
    async = require(".a./node_modules/async"),
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
			  var query = "INSERT INTO error VALUES("+numError+", '"+errorDesc+"', '"+title+"', '"+ tableName+"');";
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
	      return console.error('area no cerrada  SELECT  error running query', err);
	    }
	      var types = new Array("way");
	      var ids = new Array();
	      async.each(result.rows, function( row, callbackEach) {
		 var eachClient = new pg.Client(conString);
		  ids[0] = row.osm_id;
		  var tags = row.tags;
		  var query = "INSERT INTO error_100 (geom, tags, id_osm, type_osm, focus) VALUES (ARRAY[ st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+types[0]+"'], st_transform(ST_SetSRID(ST_GeomFromText('"+ row.way1+"'),900913), 4326) );";
		   eachClient.connect(function(err){
		      if(err) {
			  callbackEach(err);
			  console.log('could not connect to postgres', err);
			}
			else{
			  eachClient.query(query, function(err, result) {
			  if(err) {
			    console.log(query);
			    console.error('area no cerrada  INSERT  error running query', err);
			  }  
			    eachClient.end();
			    callbackEach();
			  });
			}
		 });
		  
	      }, function(err){
		callbackParallel();
	    });
	     });
	  }
	});
    },
    function(callbackParallel){
//         clientTwo = new pg.Client(conString);
// 	clientTwo.connect(function(err) {
// 	  if(err) {
// 	    callbackParallel();
// 	    return console.error('could not connect to postgres', err);
// 	  }
// 	  else{
// 	     client.query("SELECT osm_id, way, tags, ST_AsText(ST_MakeLine(ST_EndPoint(way), ST_StartPoint(way))) AS way1 FROM " + token + "_line WHERE (tags ? 'building' OR tags ? 'landuse' ) AND NOT tags @> '\"area\"=>\"no\"' AND ST_ISCLOSED(way) = FALSE;", function(err, result) {
// 	    if(err) {
// 	      callback();
// 	      console.log("SELECT osm_id, way, tags FROM " + token + "_line WHERE (tags ? 'building' OR tags ? 'landuse' ) AND NOT tags @> '\"area\"=>\"no\"' AND ST_ISCLOSED(way) = FALSE;");
// 	      return console.error('area no cerrada  SELECT2  error running query', err);
// 	    }
// 	    
// 	     });
// 	  }
// 	});
      callbackParallel();
    }
],

function(err, results){
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
	  return console.error('could not connect to postgres', err);
	}
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE Error_type = 100 group by problem", function(err, result){
	  if(err){
	    console.log("error getting solution of error100 "+err);
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
	      client.query( "SELECT GeometryType(geom) as type, * FROM error_100 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error100 "+err);
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
			console.log("error getting solution of error100 "+err);
			client.end();
		      }
		      else {
			client.query("DELETE FROM error_100 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error100 "+err);
			      client.end();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 100;", function(err, result){
				  if(err){
				    console.log("error getting solution of error100 "+err);
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
	      client.query( "DELETE FROM error_100 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error100 "+err);
		    client.end();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 100  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error100 "+err);
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
