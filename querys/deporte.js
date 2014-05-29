var pg = require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
     async = require("../node_modules/async"),
    client = new pg.Client(conString);
    
var tableName = "error_102";
exports.tableName = tableName;
var errorDesc = '<p>Especificar qué tipo de deporte se realiza en esta infraestructura.<br/>\
Los tipos de deporte se indican con el tag sport = X y las posibles combinaciones vienen descritas en:<br/>\
<a href="http://wiki.openstreetmap.org/wiki/ES:Map_Features#Sport_.28Deportes.29" target="blank">http://wiki.openstreetmap.org/wiki/ES:Map_Features#Sport_.28Deportes.29</a></p>\
<p>Formas de solucionarlo: <br/><br/> <ul> \
<li type=\"circle\">Añadir un tag sport a la geometría</li>\
</ul></p>';
exports.errorDesc = errorDesc;
var numError = 102;
exports.numError = numError;
var title = "Deportes incompleto";
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
      var query = "SELECT osm_id, tags, way FROM  "+token+"_line WHERE ((tags -> 'leisure') = 'pitch') AND ((tags-> 'sport') IS NULL OR (tags-> 'sport') = 'FIXME');";
      clientOne.query(query, function(err, result) {
	if(err) {
	  callback();
	  console.log(query);
	  console.log('vias con nombres iguales  SELECT  error running query', err);
	}
	else{
	  var type = new Array("way");
	  var ids = new Array();
	  var geom= new Array();
	  var tags = new Array();
	   async.each(result.rows, function( row, callbackEach) {
	      ids[0] = row.osm_id;
	      geom[0] = row.way;
	      tags[0] = row.tags.replace(/'/g, "''");
	      clientOne.query("INSERT INTO error_102 (geom, tags, id_osm, type_osm) VALUES (ARRAY[ST_Transform( '"+ geom[0]+"', 4326)], ARRAY['"+tags[0]+"'::hstore], '{"+ids[0]+"}',ARRAY['"+type[0]+"'] );", function(err, result) {
		if(err) {
		  console.log("INSERT INTO error_102 (geom, tags, id_osm, type_osm) VALUES (ARRAY[ST_Transform( '"+ geom[0]+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}',ARRAY['"+type[0]+"'] );");
		  console.log('deportes  INSERT  error running query', err);
		}  
		callbackEach();
	      }); 
	     
	  }, function(err){
	      console.log("3 - Ejecutando deportes");
	      clientOne.end()
	      callback();
	  });
	}
      });
    }
    
  });
  /*
  
  client.connect(function(err) {
	  var insertNumer;
	  if(err) {
	    callback();
	    return console.error('could not connect to postgres', err);
	  }
	  client.query("SELECT osm_id, tags, way FROM  "+token+"_line WHERE ((tags -> 'leisure') = 'pitch') AND ((tags-> 'sport') IS NULL OR (tags-> 'sport') = 'FIXME');", function(err, result) {
	    //console.log("Select 13 ejecutada");
	   var ressultCount = result.rows.length;
	      insertNumer = ((result.rows.length));
	      var type = new Array("way");
	      var ids = new Array();
	      var geom= new Array();
	      var tags = new Array();
	      var resultado = result.rows;
	      for(var i = 0; i < ressultCount; i++){
		ids[0] = resultado[i].osm_id;
		  geom[0] = resultado[i].way;
		  tags[0] = resultado[i].tags.replace(/'/g, "''");
		  client.query("INSERT INTO error_102 (geom, tags, id_osm, type_osm) VALUES (ARRAY[ST_Transform( '"+ geom[0]+"', 4326)], ARRAY['"+tags[0]+"'::hstore], '{"+ids[0]+"}',ARRAY['"+type[0]+"'] );", function(err, result) {
		    if(err) {
		      console.log("INSERT INTO error_102 (geom, tags, id_osm, type_osm) VALUES (ARRAY[ST_Transform( '"+ geom[0]+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{"+ids[0]+"}',ARRAY['"+type[0]+"'] );");
		      insertNumer--;
		      return console.error('deportes  INSERT  error running query', err);
		    }  
		    else{
		      insertNumer--;
		    }
		    if(insertNumer == 0){
		      console.log("3 - Ejecutando deportes");
		      callback();
		      client.end();
		    }
		  }); 
	      }
	      if(insertNumer == 0){
		      console.log("3 - Ejecutando deportes");
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
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE error_type = 102 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc ;", function(err, result){
	  if(err){
	    console.log("error getting solution of error102 "+err);
	    client.end();
	  }
	  else{
	    var problem = result.rows[0].problem;
	    if ( problem == "" ){
		client.query( "SELECT ( tags[1]->'sport' ) AS sport, COUNT( tags[1]->'sport' ) AS count FROM validations WHERE error_type = 102 AND error_id = " + idError + " GROUP BY ( tags[1]->'sport' ) ORDER BY count desc, sport desc; ", function (err, result){ 
		  if(err){
		    console.log("error getting solution of error102 "+err);
		    client.end();
		  }
		  else{
		    var name = result.rows[0].sport;
		    console.log("Resultado de la geometria error_type=102, error_id = "+idError+", "+name);
		    client.end();
		  }
		});
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, * FROM error_102 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error102 "+err);
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
			console.log("error getting solution of error102 "+err);
			client.end();
		      }
		      else {
			client.query("DELETE FROM error_102 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error102 "+err);
			      client.end();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 102;", function(err, result){
				  if(err){
				    console.log("error getting solution of error102 "+err);
				    client.end();
				  }
				  else {
				    console.log("Borrando geometria error_type=102, error_id = "+idError);
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
	      client.query( "DELETE FROM error_102 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error102 "+err);
		    client.end();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 102  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error102 "+err);
			  client.end();
			}
			else{
			  console.log("geometria error_type=102, error_id = "+idError+" is ok");
			  client.end();
			}
		    });
		  }
	      });
	    }
	  }
	});
  });
}
