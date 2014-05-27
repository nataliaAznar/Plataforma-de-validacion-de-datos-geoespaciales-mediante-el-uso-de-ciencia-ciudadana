var pg = require("/usr/lib/node_modules/pg"),
    conString = "tcp://postgres:4321@localhost/validator";
    
exports.store = function store(errorType, errorId, ip, data, problem){
  var client = new pg.Client(conString);
  client.connect(function(err) {
	if(err) {
	  return console.error('could not connect to postgres', err);
	}
	var tags = [];
	var geometries = [];
	for ( var geom in data){
	  var geometry = JSON.parse(data[geom]);
	    var x = {};
	    var i = 0;
	    var tag = "";
	    if ( Object.keys(geometry.properties).length != 0){
		  for (var t in geometry.properties)
		  {
		    x[i] = '"' + t + '" => "' + geometry.properties[t] + '"';
		    i++;
		  }
		  var j;
		  for ( j = 0; j < i -1 ; j++){
		    tag = tag +""+ x[j]+", "; 
		  }
		  tag = tag+""+x[i-1];
	    }
	    tags[geom] = tag;
	    geometries[geom] = JSON.stringify(geometry.geometry);
	}
	console.log ( "errorType "+ errorType+ ", errorId "+ errorId);
	client.query("SELECT * FROM validations WHERE error_type = " + errorType + " AND error_id = " + errorId + " AND  ip = '" + ip + "'; ", function(error, result){
	      if(error) {
		client.end();
		return console.error('error running query', err);
	      } else {
		  if ( result.rows.length != 0 ){
		    var query = "UPDATE validations SET geom = ARRAY[ ST_GeomFromGeoJSON('"+geometries[0];
		    for ( var i = 1; i < geometries.length; i++){
		      query = query +"'), ST_GeomFromGeoJSON ('" +geometries[i];
		    }
		    query = query + "')], tags = ARRAY ['"+tags[0];
		    for ( var i = 1; i < tags.length; i++){
		      query = query +"'::hstore, '" +tags[i];
		    }
		    query = query + "'::hstore], problem = '"+problem+"' WHERE error_type = " + errorType + " AND error_id = " + errorId + " AND  ip = '" + ip + "' ;"  
		    
		    client.query(query , function(error2, result2){
		      if(error2) {
			  console.log(query);
			  client.end();
			  return console.error('error running query', error2);
			} 
		      else {
			console.log("update end");
		      }
		      client.end();
		    });
		    
		  }
		  else
		  {
		    console.log("metiendo nuevos datos");
		    var query = "INSERT INTO validations VALUES ( "+ errorType +", "+ errorId +", '"+ ip +"', ARRAY[ ST_GeomFromGeoJSON('"+geometries[0];
		    for ( var i = 1; i < geometries.length; i++){
		      query = query +"'), ST_GeomFromGeoJSON(' " +geometries[i];
		    }
		    query = query + "')], ARRAY ['"+tags[0];
		    for ( var i = 1; i < tags.length; i++){
		      query = query +"'::hstore, '" +tags[i];
		    }
		    query = query + "'::hstore], '"+problem+"' );" 
		    
		    client.query(query , function(error3, result){
		      if(error3) {
			  console.log(query);
			  client.end();
			  return console.error('error running query', error3);
			} 
		      else console.log(" insert end");
		  client.end();
		    });
		  }	
	      }
	});
  });  
}
