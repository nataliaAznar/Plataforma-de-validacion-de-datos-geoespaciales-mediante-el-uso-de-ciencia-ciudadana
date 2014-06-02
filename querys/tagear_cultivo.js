var pg = require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
     async = require("../node_modules/async"),
    client = new pg.Client(conString);

var tableName = "error_117";
exports.tableName = tableName;
var errorDesc = '<p>Especificar qué tipo de cultivo se encuentra en la ubicación.</br>\
Los tipos de cultivo se especifircan con el tag landuse = X o con el tag natural = X y las posibles combinaciones vienen descritas en: </br>\
<a href ="http://wiki.openstreetmap.org/wiki/ES:Map_Features#Landuse_.28Uso_del_suelo.29" >http://wiki.openstreetmap.org/wiki/ES:Map_Features#Landuse_.28Uso_del_suelo.29 </a> </br>\
<a href = "http://wiki.openstreetmap.org/wiki/ES:Map_Features#Natural_.28Natural.29">http://wiki.openstreetmap.org/wiki/ES:Map_Features#Natural_.28Natural.29</a> </p>\
</br><ul>\
<li type="circle">Añadir el tag correspondiente a la geometría</li>\
</ul></p>'
;
exports.errorDesc = errorDesc;
var numError = 117;
exports.numError = numError;
var title = "Tipo de cultivo";
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
	    clientOne.query("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags->'fixme') like 'Tagear cultivo %');", function(err, result) {
	      if(err) {
		callbackParallel();
		return console.error('tagear cultivo  SELECT  error running query', err);
	      }
	      else{
		var type = new Array("way");
		var ids = new Array();
		async.each(result.rows, function( row, callbackEach) {
		  ids[0] = row.osm_id;
		  var tags = row.tags;
		  clientOne.query("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		    if(err) {
		      console.log("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		      console.log('tagear cultivo  INSERT  error running query', err);
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
	     clientTwo.query("SELECT osm_id, way, tags FROM " + token + "_point WHERE ((tags->'fixme') like 'Tagear cultivo %');", function(err, result) {
		if(err) {
		  callbackParallel();
		  return console.error('tagear cultivo  SELECT2  error running query', err);
		}
		else{
		  var type = new Array("node");
		  var ids = new Array();
		  async.each(result.rows, function( row, callbackEach) {
		    ids[0] = rows.osm_id;
		    var tags = rows.tags;
		    clientTwo.query("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+rows.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		      if(err) {
			console.log("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+rows.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
			console.log('tagear cultivo  INSERT2  error running query', err);
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
	     clientThree.query("SELECT osm_id, way, tags FROM " + token + "_polygon WHERE ((tags->'fixme') like 'Tagear cultivo %');", function(err, result) {
		if(err) {
		  callbackParallel();
		  return console.error('tagear cultivo  SELECT3  error running query', err);
		}
		else{
		  var type = new Array("way");
		  var ids = new Array();
		  async.each(result.rows, function( row, callbackEach) {
		    var tags = row.tags;
		    clientThree.query("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 900913)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		      if(err) {
			console.log("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 900913)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
			console.log('tagear cultivo  INSERT3  error running query', err);
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
    console.log("18 - Ejecutando tagear cultivo");
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
	  client.query("SELECT osm_id, way, tags FROM " + token + "_line WHERE ((tags->'fixme') like 'Tagear cultivo %');", function(err, result) {
	    //console.log("Select 18 ejecutada");
	    if(err) {
	      callback();
	      return console.error('tagear cultivo  SELECT  error running query', err);
	    }
	    insertNumer = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("way");
	      var ids = new Array();
	      var resultado = result.rows;
	       for(var i = 0; i< ressultCount; i++){
		ids[0] = resultado[i].osm_id;
		var tags = resultado[i].tags;
		client.query("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		    insertNumer--;
		    return console.error('tagear cultivo  INSERT  error running query', err);
		  }  
		  else{
		    insertNumer--;
		  }
		  if((insertNumer == 0) && (insertNumer2 == 0) && (insertNumer3 == 0)){
		    console.log("18 - Ejecutando tagear cultivo");
		    callback();
		  client.end();
		  }
		});
	      }
	      if((insertNumer == 0) && (insertNumer2 == 0) && (insertNumer3 == 0)){
		    console.log("18 - Ejecutando tagear cultivo");
		    callback();
		  client.end();
		  }
	  });
	  client.query("SELECT osm_id, way, tags FROM " + token + "_point WHERE ((tags->'fixme') like 'Tagear cultivo %');", function(err, result) {
	    //console.log("Select 18 ejecutada");
	    if(err) {
	      callback();
	      return console.error('tagear cultivo  SELECT2  error running query', err);
	    }
	    insertNumer2 = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("node");
	      var ids = new Array();
	      var resultado = result.rows;
	       for(var i = 0; i< ressultCount; i++){
		ids[0] = resultado[i].osm_id;
		var tags = resultado[i].tags;
		client.query("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		    insertNumer2--;
		    return console.error('tagear cultivo  INSERT2  error running query', err);
		  }  
		  else{
		    insertNumer2--;
		  }
		  if((insertNumer == 0) && (insertNumer2 == 0) && (insertNumer3 == 0)){
		  console.log("18 - Ejecutando tagear cultivo");
		  callback();
		  client.end();
		  }
		});
	      }
	      if((insertNumer == 0) && (insertNumer2 == 0) && (insertNumer3 == 0)){
		    console.log("18 - Ejecutando tagear cultivo");
		    callback();
		  client.end();
		  }
	  });
	  client.query("SELECT osm_id, way, tags FROM " + token + "_polygon WHERE ((tags->'fixme') like 'Tagear cultivo %');", function(err, result) {
	    //console.log("Select 18 ejecutada");
	    if(err) {
	      callback();
	      return console.error('tagear cultivo  SELECT3  error running query', err);
	    }
	    insertNumer3 = (result.rows.length);
	      var ressultCount = result.rows.length;
	      var type = new Array("way");
	      var ids = new Array();
	      var resultado = result.rows;
	       for(var i = 0; i< ressultCount; i++){
		var tags = resultado[i].tags;
		client.query("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 900913)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		  if(err) {
		    console.log("INSERT INTO error_117 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 900913)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}', ARRAY['"+type[0]+"']);");
		    insertNumer3--;
		    return console.error('tagear cultivo  INSERT3  error running query', err);
		  }  
		  else{
		    insertNumer3--;
		  }
		  if((insertNumer == 0) && (insertNumer2 == 0) && (insertNumer3 == 0)){
		    console.log("18 - Ejecutando tagear cultivo");
		    callback();
		    client.end();
		  }
		});
	      }
	      if((insertNumer == 0) && (insertNumer2 == 0) && (insertNumer3 == 0)){
		    console.log("18 - Ejecutando tagear cultivo");
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

	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE error_type = 117 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error117 "+err);
	    client.end();
	  }
	  else{
	    var problem = result.rows[0].problem;
	    if ( problem == "" ){
		client.query( "SELECT count(tags[1]->'landuse') AS landuse, count(tags[1]->'natural') AS natural FROM validations WHERE error_type = 117 AND error_id = " + idError + " ", function (err, result){ 
		    if(err){
		      console.log("error getting solution of error117 "+err);
		      client.end();
		    }
		    else{
		      var number = Math.max(result.rows[0].landuse, result.rows[0].natural);
		      var name;
		      if( number = result.rows[0].landuse) name = "landuse";
		      else if ( number = result.rows[0].natural) name = "natural";
		      client.query( "SELECT (tags[1]->'"+name+"') AS name, count(tags[1]->'"+name+"') AS count FROM validations WHERE error_type = 117 AND error_id = " + idError + " AND (tags->'"+name+"') is not null GROUP BY (tags->'"+name+"') ORDER BY count desc", function (err, result){
			  if(err){
			    console.log("error getting solution of error117 "+err);
			    client.end();
			  }
			  else{
			    var name = result.rows[0].name;
			    console.log("solución del error 117, id = " + idError + ", " + name);
			  }
		      });
		    }
		  });
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, * FROM error_117 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error117 "+err);
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
			console.log("error getting solution of error117 "+err);
			client.end();
		      }
		      else {
			client.query("DELETE FROM error_117 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error117 "+err);
			      client.end();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 117;", function(err, result){
				  if(err){
				    console.log("error getting solution of error117 "+err);
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
	      client.query( "DELETE FROM error_117 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error117 "+err);
		    client.end();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 117  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error117 "+err);
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
