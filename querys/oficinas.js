var pg = require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
     async = require("../node_modules/async"),
    client = new pg.Client(conString);
    
var tableName = "error_112";
exports.tableName = tableName;
var errorDesc = 'Especificar a qué se dedican las oficinas<br/>\
Los tipos de oficina se indican con el tag office = X y las posibles combinaciones vienen descritas en:<br/>\
<a href="http://wiki.openstreetmap.org/wiki/ES:Map_Features#Office_.28Oficinas.29" target="blank">http://wiki.openstreetmap.org/wiki/ES:Map_Features#Office_.28Oficinas.29</a>\
<p>Formas de solucionarlo: <br/><br/> <ul> \
<li type=\"circle\">Añadir un tag office a la geometría</li>\
</ul></p>';
exports.errorDesc = errorDesc;
var numError = 112;
exports.numError = numError;
var title = "Oficinas";
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
			  client.query( "INSERT INTO error VALUES("+numError+", '"+errorDesc+"', '"+title+"', '"+tableName+"', 'oficinas.js');" , function(err, result){
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
	       clientOne.query("SELECT tags, osm_id, way FROM " + token + "_point WHERE ((tags -> 'landuse') = 'commercial') AND ( (tags-> 'office') IS NULL or (tags-> 'office') = 'FIXME');", function(err, result) {
		  if(err) {
		    callbackParallel();
		    console.log("SELECT tags, osm_id, way FROM " + token + "_point WHERE ((tags -> 'landuse') = 'commercial') AND ( (tags-> 'office') IS NULL or (tags-> 'office') = 'FIXME');");
		    console.log('oficinas  SELECT  error running query', err);
		  }
		  else{
		     var type = new Array("node");
		     var ids = new Array();
		     async.each(result.rows, function( row, callbackEach) {
			ids[0] = row.osm_id;
			var tags = row.tags;
			clientOne.query("INSERT INTO error_112 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
			  if(err) {
			    console.log("INSERT INTO error_112 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
			    console.log('oficinas  INSERT  error running query', err);
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
	       clientTwo.query("SELECT osm_id, way FROM " + token + "_polygon WHERE ((tags -> 'landuse') = 'commercial') AND ((tags-> 'office') = 'FIXME');", function(err, result) {
	    	  if(err) {
		    callbackParallel();
		    console.log("SELECT osm_id, way FROM " + token + "_polygon WHERE ((tags -> 'landuse') = 'commercial') AND ((tags-> 'office') = 'FIXME');");
		    console.log('oficinas  SELECT2  error running query', err);
		  }
		  else{
		    var type = new Array("way");
		    var ids = new Array();
		    async.each(result.rows, function( row, callbackEach) {
			ids[0] = row.osm_id;
			var tags = row.tags;
			clientTwo.query("INSERT INTO error_112 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
			  if(err) {
			    console.log("INSERT INTO error_112 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
			    console.log('oficinas  INSERT2  error running query', err);
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
      console.log("13 - Ejecutando oficinas");
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
	  client.query("SELECT tags, osm_id, way FROM " + token + "_point WHERE ((tags -> 'landuse') = 'commercial') AND ( (tags-> 'office') IS NULL or (tags-> 'office') = 'FIXME');", function(err, result) {
	    if(err) {
	      callback();
	      return console.error('oficinas  SELECT  error running query', err);
	    }
	    insertNumer = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("node");
	      var ids = new Array();
	      var resultado = result.rows;
	      for(var i = 0; i < ressultCount; i++){
		ids[0] = resultado[i].osm_id;
		var tags = resultado[i].tags;
		client.query("INSERT INTO error_112 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_112 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		    insertNumer--;
		    return console.error('oficinas  INSERT  error running query', err);
		  }  
		  else{
		    insertNumer--;
		  }
		  if((insertNumer == 0) && (insertNumer2 == 0)){
		    console.log("13 - Ejecutando oficinas");
		    callback();
		    client.end();
		  }
		});
	      }
	      if((insertNumer == 0) && (insertNumer2 == 0)){
		    console.log("13 - Ejecutando oficinas");
		    callback();
		    client.end();
		  }
	  });
	  client.query("SELECT osm_id, way FROM " + token + "_polygon WHERE ((tags -> 'landuse') = 'commercial') AND ((tags-> 'office') = 'FIXME');", function(err, result) {
	    //console.log("Select 13 ejecutada");
	    if(err) {
	      callback();
	      return console.error('oficinas  SELECT2  error running query', err);
	    }
	    insertNumer2 = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("way");
	      var ids = new Array();
	      var resultado = result.rows;
	       for(var i = 0; i < ressultCount; i++){
		ids[0] = resultado[i].osm_id;
		var tags = resultado[i].tags;
		client.query("INSERT INTO error_112 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_112 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		    insertNumer2--;
		    return console.error('oficinas  INSERT2  error running query', err);
		  }  
		  else{
		    insertNumer2--;
		  }
		  if((insertNumer == 0) && (insertNumer2 == 0)){
		    console.log("13 - Ejecutando oficinas");
		    callback();
		    client.end();
		  }
		});
	      }
	      if((insertNumer == 0) && (insertNumer2 == 0)){
		    console.log("13 - Ejecutando oficinas");
		    callback();
		    client.end();
		  }
	  });
  }); */
}

exports.getSolution = function getSolution(idError, callback){
  client.connect(function(err) {
	if(err) {
	  console.log('could not connect to postgres', err);
	  callback();
	}
	client.query( "SELECT problem, COUNT(*) AS count FROM validations WHERE error_type = 112 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error112 "+err);
	    client.end();
	    callback();
	  }
	  else{
	    var problem = result.rows[0].problem;
	    
	    if ( problem == "" ){
		client.query( "SELECT count(tags[1]->'office') AS count, (tags[1]->'office') AS office FROM validations WHERE error_type = 112 AND error_id = " + idError + " ORDER BY office GROUP BY count desc, office desc", function (err, result){ 
		    if(err){
		      console.log("error getting solution of error112 "+err);
		      client.end();
		      callback();
		    }
		    else{
		      var name = result.rows[0].office;
		      console.log("Resultado de la geometria error_type=112, error_id = "+idError+", "+name);
		      client.end();
		      callback();
		    }
		  });
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, * FROM error_112 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error112 "+err);
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
			console.log("error getting solution of error112 "+err);
			client.end();
			callback();
		      }
		      else {
			client.query("DELETE FROM error_112 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error112 "+err);
			      client.end();
			      callback();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 112;", function(err, result){
				  if(err){
				    console.log("error getting solution of error112 "+err);
				    client.end();
				    callback();
				  }
				  else {
				    console.log("Borrando geometria error_type=112, error_id = "+idError);
				    client.end();
				    callback();
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
	      client.query( "DELETE FROM error_112 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error112 "+err);
		    client.end();
		    callback();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 112  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error112 "+err);
			  client.end();
			  callback();
			}
			else{
			  console.log("geometria error_type=112, error_id = "+idError+" is ok");
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