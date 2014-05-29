var pg = require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
    async = require("../node_modules/async"),
    client = new pg.Client(conString);
 
var tableName = "error_106";
exports.tableName = tableName;
var errorDesc = '<p>Especificar el tipo de hidrografía construida (embalse, canal..) que es.\
Los tipos de hidrografía se indican generalmente con el tag waterway = X y las posibles combinaciones vienen descritas en:<br/>\
<a href="http://wiki.openstreetmap.org/wiki/ES:Map_Features#Waterway_.28V.C3.ADas_de_agua_y_portuarias.29" target="blank">http://wiki.openstreetmap.org/wiki/ES:Map_Features#Waterway_.28V.C3.ADas_de_agua_y_portuarias.29</a></p>\
<p>Formas de solucionarlo: <br/><br/> <ul> \
<li type=\"circle\">Si se puede especificar el tipo de hidrografía, añadir el tag \"waterway\" a la geometría.</li>\
</ul></p>';
exports.errorDesc = errorDesc;
var numError = 106;
exports.numError = numError;
var title = "Hidrografía construida";
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
  var clientOne, clientTwo, clientThree ;
  async.parallel([
    function(callbackParallel){
        clientOne = new pg.Client(conString);
	clientOne.connect(function(err) {
	  if(err) {
	    callbackParallel();
	    console.log('could not connect to postgres', err);
	  }
	  else{
	    clientOne.query("SELECT tags, osm_id, way FROM " + token + "_line WHERE ((tags -> 'landuse') = 'reservoir') AND ((tags->'FIXME')  is NOT NULL) ;", function(err, result) {
	    if(err) {
	      callbackParallel();
	      console.log('hidrografia construida  SELECT  error running query', err);
	    }
	    else{
	      var type = new Array("way");
	      var ids = new Array();
	      async.each(result.rows, function( row, callbackEach) {
		  ids[0] = row.osm_id;
		  var tags = row.tags;
		  clientOne.query("INSERT INTO error_106 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		    if(err) {
		      console.log("INSERT INTO error_106 (geom, \"idError\", tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		      console.log('hidrografia construida  INSERT  error running query', err);
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
	     clientTwo.query("SELECT tags, osm_id, way FROM " + token + "_polygon WHERE ((tags -> 'landuse') = 'reservoir') AND ((tags->'FIXME')  IS NOT NULL) ;", function(err, result) {
		if(err) {
		  callbackParallel();
		  console.log('hidrografia construida  SELECT2  error running query', err);
		}
		else{
		  var type = new Array("way");
		  var ids = new Array();
		  async.each(result.rows, function( row, callbackEach) {
		    ids[0] = row.osm_id;
		    var tags = row.tags;
		    clientTwo.query("INSERT INTO error_106 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		      if(err) {
			console.log("INSERT INTO error_106 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
			console.log('hidrografia construida  INSERT2  error running query', err);
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
        clientThree = new pg.Client(conString);
	clientThree.connect(function(err) {
	  if(err) {
	    callbackParallel();
	    return console.error('could not connect to postgres', err);
	  }
	  else{
	    clientThree.query("SELECT osm_id, way FROM " + token + "_point WHERE ((tags -> 'landuse ') = 'reservoir') AND ((tags->'FIXME')  IS NOT NULL) ;", function(err, result) {
	      if(err) {
		callbackParallel();
		console.log('hidrografia construida  SELECT3  error running query', err);
	      }
	      else{
		var type = new Array("node");
		var ids = new Array();
		 async.each(result.rows, function( row, callbackEach) {
		    ids[0] = row.osm_id;
		    var tags = row.tags;
		    clientThree.query("INSERT INTO error_106 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		      if(err) {
			console.log("INSERT INTO error_106 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
			console.log('hidrografia construida  INSERT3  error running query', err);
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
    console.log("7 - Ejecutando hidrografia construida");
    clientTwo.end();
    clientOne.end();
    clientThree.end();
    callback();
  });
  /*
  
  
  
    client.connect(function(err) {
	  var insertNumer;
	  var insertNumer2;
	  var insertNumer3;
	  if(err) {
	    callback();
	    return console.error('could not connect to postgres', err);
	  }
	  client.query("SELECT tags, osm_id, way FROM " + token + "_line WHERE ((tags -> 'landuse') = 'reservoir') AND ((tags->'FIXME')  is NOT NULL) ;", function(err, result) {
	    //console.log("Select 7 ejecutada");
	    if(err) {
	      callback();
	      return console.error('hidrografia construida  SELECT  error running query', err);
	    }
	    insertNumer = (result.rows.length);
	   var ressultCount = result.rows.length;
	    var type = new Array("way");
	    var ids = new Array();
	    var resultado = result.rows;
	    for(var i = 0; i < ressultCount; i++){
		  ids[0] = resultado[i].osm_id;
		  var tags = resultado[i].tags;
		  client.query("INSERT INTO error_106 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		    if(err) {
		      console.log("INSERT INTO error_106 (geom, \"idError\", tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		      insertNumer--;
		      return console.error('hidrografia construida  INSERT  error running query', err);
		    }  
		    else{
		      insertNumer--;
		    }
		    if((insertNumer == 0) && (insertNumer2 == 0)&&(insertNumer3 == 0)){
		      console.log("7 - Ejecutando hidrografia construida");
		      callback();
		      client.end();
		    }
		  });
	    }
	    if((insertNumer == 0) && (insertNumer2 == 0)&&(insertNumer3 == 0)){
		      console.log("7 - Ejecutando hidrografia construida");
		      callback();
		      client.end();
		    }
	  });
	  client.query("SELECT tags, osm_id, way FROM " + token + "_polygon WHERE ((tags -> 'landuse') = 'reservoir') AND ((tags->'FIXME')  IS NOT NULL) ;", function(err, result) {
	    //console.log("Select 7 ejecutada");
	    if(err) {
	      callback();
	      return console.error('hidrografia construida  SELECT2  error running query', err);
	    }
	    insertNumer2 = (result.rows.length);
	   var ressultCount = result.rows.length;
	    var type = new Array("way");
	    var ids = new Array();
	    var resultado = result.rows;
	    for(var i = 0; i < ressultCount; i++){
		 ids[0] = resultado[i].osm_id;
		  var tags = resultado[i].tags;
		  client.query("INSERT INTO error_106 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		    if(err) {
		      console.log("INSERT INTO error_106 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		      insertNumer2--;
		      return console.error('hidrografia construida  INSERT2  error running query', err);
		    }  
		    else{
		      insertNumer2--;
		    }
		    if((insertNumer == 0) && (insertNumer2 == 0)&&(insertNumer3 == 0)){
		      console.log("7 - Ejecutando hidrografia construida");
		      callback();
		      client.end();
		    }
		  });
	    }
	    if((insertNumer == 0) && (insertNumer2 == 0)&&(insertNumer3 == 0)){
		      console.log("7 - Ejecutando hidrografia construida");
		      callback();
		      client.end();
		    }
	  });
	  client.query("SELECT osm_id, way FROM " + token + "_point WHERE ((tags -> 'landuse ') = 'reservoir') AND ((tags->'FIXME')  IS NOT NULL) ;", function(err, result) {
	    //console.log("Select 7 ejecutada");
	    if(err) {
	      callback();
	      return console.error('hidrografia construida  SELECT3  error running query', err);
	    }
	    insertNumer3 = (result.rows.length);
	    var ressultCount = result.rows.length;
	    var type = new Array("node");
	    var ids = new Array();
	    var resultado = result.rows;
	    for(var i = 0; i < ressultCount; i++){
		ids[0] = resultado[i].osm_id;
		  var tags = resultado[i].tags;
		  client.query("INSERT INTO error_106 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		    if(err) {
		      console.log("INSERT INTO error_106 (geom, tags, id_osm, type_osm) VALUES (ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		      insertNumer3--;
		      return console.error('hidrografia construida  INSERT3  error running query', err);
		    }  
		    else{
		      insertNumer3--;
		    }
		    if((insertNumer == 0) && (insertNumer2 == 0)&&(insertNumer3 == 0)){
		      console.log("7 - Ejecutando hidrografia construida");
		      callback();
		      client.end();
		    }
		});
	    }
	    if((insertNumer == 0) && (insertNumer2 == 0)&&(insertNumer3 == 0)){
		      console.log("7 - Ejecutando hidrografia construida");
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
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE error_type = 106 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error106 "+err);
	    client.end();
	  }
	  else{
	    var problem = result.rows[0].problem;
	    if ( problem == "" ){
		client.query( "SELECT count(tags->'landuse') AS landuse, count(tags->'man_made') AS man_made, count(tags->'waterway') AS waterway FROM validations WHERE error_type = 106 AND error_id = " + idError + " ", function (err, result){ 
		    if(err){
		      console.log("error getting solution of error106 "+err);
		      client.end();
		    }
		    else{
		      var number = Math.max(result.rows[0].landuse, result.rows[0].man_made, result.rows[0].waterway);
		      var name;
		      if( number = result.rows[0].landuse) name = "landuse";
		      else if ( number = result.rows[0].man_made) name = "man_made";
		      else if ( number = result.rows[0].waterway) name = "waterway";
		      client.query( "SELECT (tags->'"+name+"') AS name, count(tags->'"+name+"') AS count FROM validations WHERE error_type = 106 AND error_id = " + idError + " AND (tags->'"+name+"') is not null GROUP BY (tags->'"+name+"') ORDER BY count desc", function (err, result){
			  if(err){
			    console.log("error getting solution of error106 "+err);
			    client.end();
			  }
			  else{
			  var name = result.rows[0].name;
			}
		      });
		    }
		  });
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, * FROM error_106 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error106 "+err);
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
			console.log("error getting solution of error106 "+err);
			client.end();
		      }
		      else {
			client.query("DELETE FROM error_106 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error106 "+err);
			      client.end();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 106;", function(err, result){
				  if(err){
				    console.log("error getting solution of error106 "+err);
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
	      client.query( "DELETE FROM error_106 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error106 "+err);
		    client.end();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 106  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error106 "+err);
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