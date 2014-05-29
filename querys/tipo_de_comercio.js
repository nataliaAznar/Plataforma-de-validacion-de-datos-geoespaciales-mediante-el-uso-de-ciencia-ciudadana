var pg=require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
     async = require("../node_modules/async"),
    client = new pg.Client(conString);
 
var tableName = "error_119";
exports.tableName = tableName;
var errorDesc = "<p>Especificar el tipo de comercio que es.\
El tipo de comercio se indica con el tag shop = X y las posibles combinaciones vienen descritas en:<br/>\
<a href=\"http://wiki.openstreetmap.org/wiki/ES:Map_Features#Shop_.28Comercios.29\" target=\"blank\">http://wiki.openstreetmap.org/wiki/ES:Map_Features#Shop_.28Comercios.29</a></p>\
<p>Formas de solucionarlo: <br/><br/> <ul> \
<li type=\"circle\">Si se puede especificar el tipo de comercio, añadir el tag \"shop\" a la geometría.</li>\
</ul></p>";
exports.errorDesc = errorDesc;
var numError = 119;
exports.numError = numError;
var title = "Tipo de comercio";
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
	    clientOne.query("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags->'fixme') like '%tipo de comercio %');", function(err, result) {
		if(err) {
		  callbackParallel();
		  console.log('tipo de comercio  SELECT  error running query', err);
		}
		else{
		   var type = new Array("way");
		   var ids = new Array();
		   async.each(result.rows, function( row, callbackEach) {
		      ids[0] = row.osm_id;
		      var tags = row.tags
		      clientOne.query("INSERT INTO error_119 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
			if(err) {
			  console.log("INSERT INTO error_119 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);");
			  console.log('tipo de comercio  INSERT  error running query', err);
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
	    clientTwo.query("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags->'fixme') like '% tipo de comercio %');", function(err, result) {
	      if(err) {
		callback();
		return console.error('tipo de comercio  SELECT2  error running query', err);
	      }
	      else{
		var type = new Array("line");
		var ids = new Array();
		async.each(result.rows, function( row, callbackEach) {
		    ids[0] = row.osm_id;
		    var tags = row.tags
		    clientTwo.query("INSERT INTO error_119 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		      if(err) {
			console.log("INSERT INTO error_119 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);");
			console.log('tipo de comercio  INSERT2  error running query', err);
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
    console.log("20 - Ejecutando tipo de comercio");
    clientTwo.end();
    clientOne.end();
    callback();
  });
  
  
  
  
 /* 
  
  
  
  client.connect(function(err) {
	  var insertNumber;
	  var insertNumber2;
	  if(err) {
	    callback();
	    return console.error('could not connect to postgres', err);
	  }
	  client.query("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags->'fixme') like '%tipo de comercio %');", function(err, result) {
	  
	    if(err) {
	      callback();
	      return console.error('tipo de comercio  SELECT  error running query', err);
	    }
	    var ressultCount = result.rows.length;
	      insertNumber = (result.rows.length);
	      var type = new Array("way");
	      var ids = new Array();
	      var resultado = result.rows;
	      for(var i = 0; i< ressultCount ; i++){
		ids[0] = resultado[i].osm_id;
		var tags = resultado[i].tags
		client.query("INSERT INTO error_119 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_119 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);");
		    return console.error('tipo de comercio  INSERT  error running query', err);
		    insertNumber--;
		  }
		  else{
		    insertNumber--;
		  }
		  if((insertNumber == 0) && (insertNumber2 == 0)){
		    console.log("20 - Ejecutando tipo de comercio");
		    callback();
		     client.end();
		  }
		});
	      }
	      if((insertNumber == 0) && (insertNumber2 == 0)){
		    console.log("20 - Ejecutando tipo de comercio");
		    callback();
		     client.end();
		  }
	  });
	  client.query("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags->'fixme') like '% tipo de comercio %');", function(err, result) {
	    if(err) {
	      callback();
	      return console.error('tipo de comercio  SELECT2  error running query', err);
	    }
	    var ressultCount = result.rows.length;
	      insertNumber2 = (result.rows.length);
	      var type = new Array("line");
	      var ids = new Array();
	      var resultado = result.rows;
	      for(var i = 0; i< ressultCount; i++){
		ids[0] = resultado[i].osm_id;
		var tags = resultado[i].tags
		client.query("INSERT INTO error_119 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_119 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);");
		    return console.error('tipo de comercio  INSERT2  error running query', err);
		    insertNumber2--;
		  }
		  else{
		    insertNumber2--;
		  }
		  if((insertNumber == 0) && (insertNumber2 == 0)){
		    console.log("20 - Ejecutando tipo de comercio");
		    callback();
		     client.end();
		  }
		});
	      }
	      if((insertNumber == 0) && (insertNumber2 == 0)){
		    console.log("20 - Ejecutando tipo de comercio");
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
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE error_type = 119 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error119 "+err);
	    client.end();
	  }
	  else{
	     var problem = result.rows[0].problem;
	    if ( problem == "" ){
		client.query( "SELECT (tags[1]->'shop') AS shop, count(tags[1]->'shop') AS count FROM validations WHERE error_type = 119 AND error_id = " + idError + " AND (tags[1]->'shop') is not null GROUP BY (tags[1]->'shop') ORDER BY count desc ", function (err, result){
		    if(err){
		      console.log("error getting solution of error119 "+err);
		      client.end();
		    }
		    else{
		      name = result.rows[0].shop;
		      console.log("validación de error 119, id = " + idError + ", " + name + ")
		    }
		  });
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, * FROM error_119 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error119 "+err);
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
			console.log("error getting solution of error119 "+err);
			client.end();
		      }
		      else {
			client.query("DELETE FROM error_119 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error119 "+err);
			      client.end();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 119;", function(err, result){
				  if(err){
				    console.log("error getting solution of error119 "+err);
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
	      client.query( "DELETE FROM error_119 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error119 "+err);
		    client.end();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 119  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error119 "+err);
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
