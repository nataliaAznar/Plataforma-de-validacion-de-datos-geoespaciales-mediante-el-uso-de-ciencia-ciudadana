var pg=require("/usr/lib/node_modules/pg"),
//     obtenerId = require('/var/www/localhost/htdocs/validator/obtenerId'),
    conString = "tcp://postgres:4321@localhost/validator",
     async = require("../node_modules/async"),
    client = new pg.Client(conString);
    
var tableName = "error_122";
exports.tableName = tableName;
var errorDesc = "<p>No se han encontrado entradas a este edificio. Si es posible añadir sus entradas.</p>.\
<p>Los tipos de entrada se indican con el tag entrance = X y las posibles combinaciones vienen descritas en:<br/>\
<a href=\"http://wiki.openstreetmap.org/wiki/Key:entrance\"http://wiki.openstreetmap.org/wiki/Key:entrance</a></p>\
<p>Formas de solucionarlo: <br/><br/> <ul> \
<li type=\"circle\">Añadir la entrada al edificio. Para ello, situarla en el lugar correcto y añadir el tag \"entrance\"</li>\
</ul></p>";
exports.errorDesc = errorDesc;
var numError = 122;
exports.numError = numError;
var title = "Edificios sin entrada";
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
		  geom geometry(Geometry, 4326)[],\
		  "idError" bigserial NOT NULL,\
		  tags hstore[],\
		  id_osm integer[],\
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
      clientOne.query("SELECT buildings.osm_id, buildings.way, buildings.tags FROM ( SELECT * FROM " + token + "_polygon WHERE (tags->'building') IS NOT NULL ) AS buildings, (SELECT * FROM "+token+"_point WHERE (tags->'entrance') IS NOT NULL) AS entrances WHERE NOT ST_Intersects( ST_Buffer ( geography(ST_Transform(buildings.way, 4326)), 1)::geometry , entrances.way )", function(err, result) {
	 if(err) {
	    callback();
	    console.log("SELECT buildings.osm_id, buildings.way, buildings.tags FROM ( SELECT * FROM " + token + "_polygon WHERE (tags->'building') IS NOT NULL ) AS buildings, (SELECT * FROM "+token+"_point WHERE (tags->'entrance') IS NOT NULL) AS entrances WHERE NOT ST_Intersects( ST_Buffer ( geography(ST_Transform(buildings.way, 4326)), 1)::geometry , entrances.way )");
	    console.log('Edificios sin portal  SELECT  error running query', err);
	  }
	  else{
	    var type = new Array("way");
	    var ids = new Array(); 
	     async.each(result.rows, function( row, callbackEach) {
		  ids[0] = row.osm_id;
		  var tags = row.tags;
		  clientOne.query("INSERT INTO error_122 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		    if(err) {
		    console.log("INSERT INTO error_122 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+row.way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);");
		    console.log('vias con nombres iguales  INSERT  error running query', err);
		  }  
		  callbackEach();
		});
	     }, function(err){
		console.log("23 - ejecutando edificio sin portal ");
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
	  client.query("SELECT buildings.osm_id, buildings.way, buildings.tags FROM ( SELECT * FROM " + token + "_polygon WHERE (tags->'building') IS NOT NULL ) AS buildings, (SELECT * FROM "+token+"_point WHERE (tags->'entrance') IS NOT NULL) AS entrances WHERE NOT ST_Intersects( ST_Buffer ( geography(ST_Transform(buildings.way, 4326)), 1)::geometry , entrances.way )", function(err, result) {
	    //console.log("Select 23 ejecutada");
	    if(err) {
	      callback();
	      console.log("SELECT buildings.osm_id, buildings.way, buildings.tags FROM ( SELECT * FROM " + token + "_polygon WHERE (tags->'building') IS NOT NULL ) AS buildings, (SELECT * FROM "+token+"_point WHERE (tags->'entrance') IS NOT NULL) AS entrances WHERE NOT ST_Intersects( ST_Buffer ( geography(ST_Transform(buildings.way, 4326)), 1)::geometry , entrances.way )");
	      return console.error('Edificios sin portal  SELECT  error running query', err);
	    }
	    insertNumer = result.rows.length;
	    var ressultCount = result.rows.length;
	    var type = new Array("way");
	    var ids = new Array(); 
	      for(var j = 0; j < ressultCount; j++){
		obtenerId.getId("122", client,result.rows,j, function (errorId, err, resultado,i){
		  if (err!=0){
		    callback();
		   return console.error( err); 
		  }
		  ids[0] = resultado[i].osm_id;
		  var tags = resultado[i].tags;
		  if ( i != 0) errorId = errorId + i;
		  // console.log("INSERT INTO error_122 VALUES ( '"+resultado[i].way+"', "+errorId+", '{ "+ids[0]+"}', ARRAY['"+type[0]+"'], '"+resultado[i].tags+"');");
		  client.query("INSERT INTO error_122 (geom, tags, id_osm, type_osm) VALUES ( ARRAY[st_transform('"+resultado[i].way+"', 4326)], ARRAY['"+tags.replace(/'/g, "''")+"'::hstore], '{ "+ids[0]+"}', ARRAY['"+type[0]+"']);", function(err, result) {
		    if(err) {
		      insertNumer--;
		      return console.error('Edificios sin portal INSERT  error running query', err);
		    }  
		    else{
		      insertNumer--;
		    }
		    if( insertNumer == 0){
			console.log("23 - ejecutando edificio sin portal ");
			callback();
			client.end();
		    }
		  });
		});
	    }
	    if( insertNumer == 0){
			console.log("23 - ejecutando edificio sin portal");
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
	client.query( "SELECT problem, COUNT(*)  FROM validations WHERE error_type = 122 AND error_id = " + idError + " GROUP BY problem ORDER BY count desc, problem desc", function(err, result){
	  if(err){
	    console.log("error getting solution of error122 "+err);
	    client.end();
	  }
	  else{
	    var problem = result.rows[0].problem;
	    if ( problem == "" ){
		client.query( "SELECT (tags[1]->'entrance') AS entrance, count(tags[1]->'entrance') AS count FROM validations WHERE error_type = 122 AND error_id = " + idError + " AND (tags[|]->'entrance') is not null GROUP BY (tags[1]->'entrance') ORDER BY count ;", function (err, result){
		  if(err){
		    console.log("error getting solution of error122 "+err);
		    client.end();
		  }
		  else{
		    var entrance = result.rows[0].entrance;
		    client.end();
		  }
		});
	    }
	    else if ( problem == "Borrar elemento" ){
	      client.query( "SELECT GeometryType(geom[1]) as type, * FROM error_122 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error122 "+err);
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
			console.log("error getting solution of error122 "+err);
			client.end();
		      }
		      else {
			client.query("DELETE FROM error_122 WHERE \"idError\" = "+idError+";", function(err, result){
			   if(err){
			      console.log("error getting solution of error122 "+err);
			      client.end();
			    }
			    else {
			      client.query("DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 122;", function(err, result){
				  if(err){
				    console.log("error getting solution of error122 "+err);
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
	      client.query( "DELETE FROM error_122 WHERE idError = "+idError+";", function (err, result){
		  if(err){
		    console.log("error getting solution of error122 "+err);
		    client.end();
		  }
		  else {
		    client.query( "DELETE FROM validations WHERE error_id = "+idError+" AND error_type = 122  ;", function (err, result){
			if(err){
			  console.log("error getting solution of error122 "+err);
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
