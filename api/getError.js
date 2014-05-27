var pg = require("/usr/lib/node_modules/pg"),
    conString = "tcp://postgres:4321@localhost/validator";
    

// exports.getError = function getError(res, id) {
//   var client = new pg.Client(conString);
//    client.connect(function(err) {
// 	  if(err) {
// 	    return console.error('could not connect to postgres', err);
// 	  }
// 	  client.query('SELECT st_AsGeoJSON(geom ) AS geom FROM error_114 WHERE id_osm[2] = '+id+' OR id_osm[1] = '+id+';', function(err, result) {
// 	    if(err) {
// 	      client.end();
// 	      return console.error('error running query', err);
// 	    }
// 	    var response = {};
// 	    response.geometry = JSON.parse(result.rows[0].geom);
// 	    response.type = "Feature";
// 	    response.id = id;
// 	    response.error = 114;
// 	    client.query('SELECT tags FROM planet_osm_polygon WHERE osm_id = '+id+';', function(err, result) {
// 	      if(err) {
// 	      client.end();
// 	      return console.error('error running query', err);
// 	    }
// 	      var tag= result.rows[0].tags;
// 	      var a= tag.replace(/=>/g, ":");
// 	      a= '{'+a+', "bounds": [-118.3757, 34.29364, -118.37389, 34.29729]}';
// 	      response.properties = JSON.parse(a);
// 	      client.end();
// 	      //console.log(JSON.stringify(response));
// 	      res.send(JSON.stringify(response));
// 	    });
// 	   }); 
// 	   
// 	}); 
// }

//get an error near the current location of the map (in progress)
exports.getNearError = function getNearError(res, errorId, lng, lat){
  var client = new pg.Client(conString);
  var ran;
  var response = {};
  var arr = [ ];
   client.connect(function(err) {
	  if(err) {
	    return console.error('could not connect to postgres', err);
	  }
	  var query = 'SELECT selected."idError" as id,\
			st_asgeojson(unnest( selected.geom )) AS geome,\
			st_AsGeoJSON( selected.focus ) AS foc,\
			st_AsGeoJSON( ST_EXTERIORRING(ST_BUFFER(ST_ENVELOPE( selected.geom[1] )::geography, 5)::geometry )) AS env,\
			unnest( selected.tags ) as tags\
			FROM\
			(SELECT "idError", geom, focus, tags FROM error_' + errorId + ' \
			ORDER BY ST_Distance( ST_SetSRID (ST_makePoint( ' + lng + ', ' + lat + ' ),4326 ) , geom[1]) \
			LIMIT 100\
			) AS selected;'
			
			      
	  client.query(query ,function(err, result)
	  {
	    if(err) {
	      client.end();
	      return console.error('obtener error error running query', err);
	    } 
	    if (result.rows.length != 0){
		
		ran = Math.floor(Math.random()*(result.rows.length));

		var id = result.rows[ran].id;
		var resultado = [];
		var j = 0;
		for ( var i = 0; i < result.rows.length; i++){
		 if( result.rows[i].id == id){
		   resultado[j] = result.rows[i];
		   j++;
		 }
		}
		if(resultado[0].foc != "" && resultado[0].foc != undefined){
		  // 	// Create focus geojson
		  var featFocus = {
		    "properties": {
			},
			"geometry": JSON.parse(resultado[0].foc),
			"type": "Feature"
		  };
		  var arrFocus = [ featFocus];
		  var geojsonFeatureFocus = {
		    "type": "FeatureCollection",
		    "features":arrFocus 	  
		  };
	  
		  response.focus = geojsonFeatureFocus;
		}
		response.id = resultado[0].id;
		response.error = errorId;

		
		var left = 180;
		var right = -180;
		var up = -90;
		var down = 90;
		
		var coordinates = JSON.parse(resultado[0].env).coordinates;
		
		if (coordinates) {
		  for(var coor in coordinates){
		    left = Math.min(coordinates[coor][0], left);
		    right = Math.max(coordinates[coor][0], right);
		    up = Math.max(coordinates[coor][1], up);
		    down = Math.min(coordinates[coor][1], down);
		  }
		}
		
		response.bounds = []
		response.bounds[0] = left.toFixed(11);
		response.bounds[1] = down.toFixed(11);
		response.bounds[2] = right.toFixed(11);
		response.bounds[3] = up.toFixed(11);
		
		var arr = [];
		for( var i = 0; i < resultado.length; i++){
		  
		  var t= resultado[i].tags;
		  var tag= t.replace(/=>/g, ":");
		  tag = '{'+tag+'}';
   		  var feat= {
		      "properties": JSON.parse(tag),
		      "geometry": JSON.parse(resultado[i].geome),
		      "type": "Feature"
		      };
		   arr[i] = feat;
		} 
	  
		var geojsonFeature = {
		  "type": "FeatureCollection",
		  "features":arr 	  
		};
	
		response.featureCollection = geojsonFeature;
		client.query("SELECT * FROM error WHERE error_code = "+errorId+" ;", function(err, result) 
		{
		  if(err) {
		    client.end();
		    return console.error('obtener error error running query', err);
		  } 
		  response.title = result.rows[0].title;
		  response.instructions = result.rows[0].desc;

		  res.send(JSON.stringify(response));
		  client.end();
		});
	    }
	    else
	    {
	     //NO HAY GEOMETRÍA
	      response.geometry = "";
	      response.type = "";
	      response.id = "";
	      response.properties = "";
	      response.error = "";
	      res.status(404).send();
	      client.end();
	    }
	    
	    
	   });  
	}); 
}

exports.getErrorList  = function getErrorList(callback){
  var client = new pg.Client(conString),
      errors = [];
  
  client.connect(function(err) {
      if(err) {
	return console.error('could not connect to postgres', err);
      }
      client.query( "SELECT error_code FROM error", function( err, result ){
	if(err){
	    console.log("error getting ErrorList "+ err);
	    client.end();
	}
	else{
	  for (var pos = 0; pos < result.rows.length; pos++){
	      errors[pos] = result.rows[pos].error_code;
	  }
	  var fullErrorTables = [];
	  getFullTables(0, errors, fullErrorTables, callback, client);
	}
     });
  });
}

function getFullTables(cont, errors, fullErrorTables, callback, client){
  client.query( "SELECT count(*) AS numberrows FROM error_" + errors[cont] + ";", function( err, result ){
		if(err){
		    console.log("error checking empty error tables  "+ err);
		    cont++;
		}
		else{
		  if( result.rows[0].numberrows != 0){
		    fullErrorTables.push(errors[cont]);
		  }
		  cont++;
		  if( cont == errors.length){
			callback(fullErrorTables); 
			client.end();
		  }
		  else{
		    getFullTables( cont, errors, fullErrorTables, callback, client);
		  }
		}
	    });
  
}





