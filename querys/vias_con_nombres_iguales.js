var pg=require("/usr/lib/node_modules/pg"),
    async = require("../node_modules/async");
// var obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId');
var    conString = "tcp://postgres:4321@localhost/validator";
var    client = new pg.Client(conString);
    
var tableName = "error_120";
exports.tableName = tableName;
var errorDesc = "<p>Dos vías que tienen el mismo nombre</p>.\
<p>Formas de solucionarlo: <br/><br/> <ul> \
<li type=\"circle\">En caso de que una de ellas tenga el nombre incorrecto, se modifican sus tags.</li>\
<li type=\"circle\">En caso de que ambas vías sean una sola, modificar las geometrías para unirlas</li>\
<li type=\"circle\">Si todo es correcto, seleccionar la opción \"Element is ok\" en el menú \"problem\"·</li>\
</ul></p>";
exports.errorDesc = errorDesc;
var numError = 120;
exports.numError = numError;
var title = "Vías con el mismo nombre";
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
			  client.query( "INSERT INTO error VALUES("+numError+", '"+errorDesc+"', '"+title+"', '"+tableName+"', 'vias_con_nombres_iguales.js');" , function(err, result){
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
      clientOne.query("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2,st_astext(p1.way) AS way1, st_astext(p2.way) AS way2, ST_AsText(ST_INTERSECTION(p1.way, p2.way)) AS way FROM " + token + "_line p1, " + token + "_line p2 WHERE (((p1.tags -> 'name') = (p2.tags -> 'name')) OR ((p1.tags -> 'name:es') = (p2.tags -> 'name:es'))) AND p1.osm_id!=p2.osm_id;", function(err, result) {
	if(err) {
	  callback();
	  console.log("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2,st_astext(p1.way) AS way1, st_astext(p2.way) AS way2, ST_AsText(ST_INTERSECTION(p1.way, p2.way)) AS way FROM " + token + "_line p1, " + token + "_line p2 WHERE (((p1.tags -> 'name') = (p2.tags -> 'name')) OR ((p1.tags -> 'name:es') = (p2.tags -> 'name:es'))) AND p1.osm_id!=p2.osm_id;");
	  console.log('vias con nombres iguales  SELECT  error running query', err);
	}
	else{
	  var type = new Array("way", "way");
	  var ids = new Array();
	  var geom = new Array();
	  var tags = new Array();
	  async.each(result.rows, function( row, callbackEach) {
		ids[0] = row.id1;
		ids[1] = row.id2;
		geom[0] = row.way1;
		geom[1] = row.way2;
		geom[2] = row.way;
		tags[0] = row.tags1;
		tags[1] = row.tags2;
		var query = "";
		if ( geom[2] == "GEOMETRYCOLLECTION EMPTY")
		{
		  query = "INSERT INTO error_120 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0].replace(/'/g, "''")+"'::hstore,'"+tags[1].replace(/'/g, "''")+"'::hstore], '{"+ids[0]+" , "+ids[1]+"}' ,ARRAY['"+type[0]+"', '"+type[1]+"']);"
		}
		else{
		  query = "INSERT INTO error_120 (geom, tags, id_osm, type_osm, focus) VALUES ( ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0].replace(/'/g, "''")+"'::hstore,'"+tags[1].replace(/'/g, "''")+"'::hstore], '{"+ids[0]+" , "+ids[1]+"}' ,ARRAY['"+type[0]+"', '"+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[2]+"'),900913), 4326));";
		}
		
		clientOne.query(query, function(err, result) {
		  if(err) {
		    console.log(query);
		    console.log('vias con nombres iguales  INSERT  error running query', err);
		  }  
		  callbackEach();
		});
	  }, function(err){
	      console.log("21 - Ejecutando vias con nombres iguales");
	      clientOne.end()
	      callback();
	  });
	}
      });
    }
  });

  
  
  
  
//     client.connect(function(err) {
// 	  var insertNumber;
// 	  if(err) {
// 	    callback();
// 	    return console.error('could not connect to postgres', err);
// 	  }
// 	  client.query("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2,st_astext(p1.way) AS way1, st_astext(p2.way) AS way2, ST_AsText(ST_INTERSECTION(p1.way, p2.way)) AS way FROM " + token + "_line p1, " + token + "_line p2 WHERE (((p1.tags -> 'name') = (p2.tags -> 'name')) OR ((p1.tags -> 'name:es') = (p2.tags -> 'name:es'))) AND p1.osm_id!=p2.osm_id;", function(err, result) {
// 	   // console.log("Select 21 ejecutada");
// 	    if(err) {
// 	      console.log("SELECT p1.tags AS tags1, p2.tags AS tags2, p1.osm_id AS id1, p2.osm_id AS id2,st_astext(p1.way) AS way1, st_astext(p2.way) AS way2, ST_AsText(ST_INTERSECTION(p1.way, p2.way)) AS way FROM " + token + "_line p1, " + token + "_line p2 WHERE (((p1.tags -> 'name') = (p2.tags -> 'name')) OR ((p1.tags -> 'name:es') = (p2.tags -> 'name:es'))) AND p1.osm_id!=p2.osm_id;");
// 	      return console.error('vias con nombres iguales  SELECT  error running query', err);
// 	    }
//  	      insertNumber = result.rows.length;
// 	      var ressultCount = result.rows.length;
// 	      var type = new Array("way", "way");
// 	      var ids = new Array();
// 	      var geom = new Array();
// 	      var tags = new Array();
// 	      var resultado = result.rows;
// 	      for(var i = 0; i < ressultCount; i++){
// 		    ids[0] = row.id1;
// 		    ids[1] = row.id2;
// 		    geom[0] = row.way1;
// 		    geom[1] = row.way2;
// 		    geom[2] = row.way;
// 		    tags[0] = row.tags1;
// 		    tags[1] = row.tags2;
// 		    var query = "";
// 		    if ( geom[2] == "GEOMETRYCOLLECTION EMPTY")
// 		    {
// 		      query = "INSERT INTO error_120 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0].replace(/'/g, "''")+"'::hstore,'"+tags[1].replace(/'/g, "''")+"'::hstore], '{"+ids[0]+" , "+ids[1]+"}' ,ARRAY['"+type[0]+"', '"+type[1]+"']);"
// 		    }
// 		    else{
// 		      query = "INSERT INTO error_120 (geom, tags, id_osm, type_osm, focus) VALUES ( ARRAY[ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[0]+"'),900913), 4326), ST_Transform(ST_SetSRID(ST_GeomFromText('"+geom[1]+"'),900913), 4326)], ARRAY['"+tags[0].replace(/'/g, "''")+"'::hstore,'"+tags[1].replace(/'/g, "''")+"'::hstore], '{"+ids[0]+" , "+ids[1]+"}' ,ARRAY['"+type[0]+"', '"+type[1]+"'], ST_Transform( ST_SetSRID(ST_GeomFromText('"+ geom[2]+"'),900913), 4326));";
// 		    }
// 		    client.query(query, function(err, result) {
// 		      if(err) {
// 			console.log(query);
// 			return console.error('vias con nombres iguales  INSERT  error running query', err);
// 			insertNumber--;
// 		      }  
// 		      else{
// 		      insertNumber--; 
// 		      }
// 		      if(insertNumber==0){
// 			console.log("21 - Ejecutando vias con nombres iguales");
// 			callback();
// 			client.end();
// 		      }
// 		    });
// 	      }
// 	      if(insertNumber==0){
// 			console.log("21 - Ejecutando vias con nombres iguales");
// 			callback();
// 			client.end();
// 		      }
// 	  });
// 	}); 
}

exports.getSolution = function getSolution(idError, callback){
  client.connect(function(err) {
	if(err) {
	  return console.error('could not connect to postgres', err);
	}
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE error_type = 120 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error120 "+err);
	    client.end();
	    callback();
	  }
	  else{
	     var problem = result.rows[0].problem;
	    if ( problem == "" ){
	      client.query("SELECT array_length(geom,1 ) as size, count(array_length(geom,1 )) as count FROM validations WHERE error_type = 110 AND error_id = " + idError + " GROUP BY array_length(geom,1 ) ORDER BY count desc;", function(err, result){
		if(err){
		  callback();
		  client.end();
		  console.log("error "+err);
		}
	      else{
		if(result.rows[0].size ==1){
		  console.log("Solución error 110, id = " + idError + ", una geometría borrada ");
		  callback();
		  client.end();
		 }
		 else{
		   //buscar el que más se repite en una y el que más se repite en otra por separado
		    client.query("SELECT ( tags[1]->'name' ) AS name, COUNT( tags[1]->'name' ) AS count FROM validations WHERE error_type = 120 AND error_id = " + idError + " GROUP BY ( tags[1]->'name' ) ORDER BY count desc;", function (err, result){
		      if(err){
			console.log("error "+err);
			client.end();
			callback();
		      }
		      else{
			  var name = result.rows[0].name;
			  client.query("SELECT ( tags[2]->'name' ) AS name, COUNT( tags[2]->'name' ) AS count FROM validations WHERE error_type = 120 AND error_id = " + idError + " GROUP BY ( tags[2]->'name' ) ORDER BY count desc;", function (err, result){
				if(err){
				  console.log("error "+err);
				  client.end();
				  callback();
				}
				else{
				    var name2 = result.rows[0].name;
				    console.log("solución error 120, id = " + idError + ", " + name + ", " + name2);
				    callback();
				}
		      
			    });
		      }
		    });
		 }
	      }
	      });
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, GeometryType(geom[2]) as type2, * FROM error_120 WHERE \"idError\" = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error120 "+err);
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
		    client.query( "DELETE FROM validator_"+table+" WHERE id_table = "+id+";", function(err, result){
		      if(err){
			console.log("error getting solution of error120 "+err);
			client.end();
		      }
		      else {
			eliminarTablaError(idError, client, function(){
			  firstEnd = 1;
			  if( secondEnd == 1){
			    client.end();
			    callback();
			  }
			});
			
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
		    client.query( "DELETE FROM validator_"+table+" WHERE id_table = "+id+";", function(err, result){
		      if(err){
			console.log("error getting solution of error107 "+err);
			client.end();
		      }
		      else {
			secondEnd = 1;
			if(firstEnd == 1 ){
			client.end();
			callback();
			}
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

function eliminarTablaError(idError, client, callback){
  client.query( "DELETE FROM error_120 WHERE \"idError\" = "+idError+";", function (err, result){
      if(err){
	console.log("error getting solution of error120 "+err);
	client.end();
      }
      else {
	client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 120  ;", function (err, result){
	    if(err){
	      console.log("error getting solution of error120 "+err);
	      client.end();
	    }
	    else{
	      callback();
	    }
	});
      }
  });
}