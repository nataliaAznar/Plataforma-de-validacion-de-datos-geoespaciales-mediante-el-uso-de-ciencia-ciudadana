/* Ejemplo
 * 
 * {
 * "elements" : [
 *   {
      "type": "way",
      "id": 234,
      "nodes" : [
      
      {
      "type": "node",
      "id": 1,
      "lat": 2.0,
      "lon": -3.0
      "tags" : {
	"k" : "v",
	"k" : "v"
	}
      },
      {
      "type": "node",
      "id": 2,
      "lat": 2.0,
      "lon": -3.0
      "tags" : {
	"k" : "v",
	"k" : "v"
	}
      },
      {
      "type": "node",
      "id": 3,
      "lat": 2.0,
      "lon": -3.0
      "tags" : {
	"k" : "v",
	"k" : "v"
	}
      }
      
      ]
      "tags" : {
	"k" : "v",
	"k" : "v"
	}
      }
    ]
   }
 * 
 * 
 */


var pg = require("/usr/lib/node_modules/pg"),
    conString = "tcp://postgres:4321@localhost/validator";
var client;

exports.getWay = function getWay(res, id){ 
// 	client.connect(function(err) {
// 	  if(err) {
// 	    return console.error('could not connect to postgres', err);
// 	  }
// 	  client.query('SELECT id, nodes FROM planet_osm_ways WHERE id = '+id+';', function(err, result) {
// 	    var elements = [];
// 	    if(err) {
// 		console.log("error");
// 		res.send(JSON.stringify(elements));
// 	    }
// 	    else{
// 		var way=new Object();
// 		way.type = "way";
// 		way.id = id;
// 		way.nodes = new Array();
// 		way.tags= result.rows[0].tags;
// 		var numberResults=result.rows[0].nodes.length;
// 		var nodos=result.rows[0].nodes;
// 		for (var i = 0; i < nodos.length; i++){
// 		  client.query('SELECT id, tags, ST_X(ST_TRANSFORM(ST_SetSRID(ST_MAKEPOINT(lon,lat), 900913), 4326)) as lon, ST_Y(ST_TRANSFORM(ST_SetSRID(ST_MAKEPOINT(lon,lat), 900913), 4326)) as lat FROM planet_osm_nodes WHERE id = ' + nodos[i] + ';', function(err, result) {
// 		      if(err) {
// 			console.log("error");
// 			numberResults--;
// 		      }
// 		      else{
// 			var node=new Object();
// 			node.type = "node";
// 			node.id = result.rows[0].id;
// 			node.lat = result.rows[0].lat;
// 			node.lon = result.rows[0].lon;
// 			node.tags= result.rows[0].tags;
// 			
// 			way.nodes.push(node);
// 			numberResults--;
// 			if(numberResults==0){
// 			  elements.push(way);
// 			  res.send(JSON.stringify(elements));
// 			}
// 		      }
// 		      
// 		  });	  
// 		}  
// 	    }
// 	  });
// 	});
	this.wayToJson(id, function(result, error){
	  if (error){
	    console.log("Error con el way");
	  } else {
	    
	    var elements = [];
	    elements.push(result);
	    res.send(JSON.stringify(elements));
	  }
	});
	

	
}

exports.createConnection = function createConnection(callback){
      client = new pg.Client(conString);
      	client.connect(function(err) {
	  if(err) {
	    callback(err);
	    return console.error('could not connect to postgres', err);
	  }
	  else{
	    callback();
	  }
      });
    }
    
exports.endConnection = function endConnection(){
  client.end();
}

exports.wayToJson = function wayToJson(id,callback){
  
	  client.query('SELECT id, nodes, tags FROM planet_osm_ways WHERE id = '+id+';', function(err, result) {
	    if(err) {
		console.log("Way error"+err);
	    }
	    else{
		var way=new Object();
		way.type = "way";
		way.id = id;
		way.nodes = new Array();
		if(result.rows.length!=0){
		 console.log("no nulo");
		way.tags= result.rows[0].tags;
		var numberResults = result.rows[0].nodes.length;
		var nodos=result.rows[0].nodes;
		for (var i = 0; i < nodos.length; i++){
		  client.query('SELECT id, tags, ST_X(ST_SetSRID(ST_MAKEPOINT(lon / 100,lat / 100), 900913)) as lon, ST_Y(ST_SetSRID(ST_MAKEPOINT(lon / 100, lat / 100), 900913)) as lat FROM planet_osm_nodes WHERE id = ' + nodos[i] + ';', function(err, result) {
		      if(err) {
			console.log("Way error "+err);
			callback(way, true);
		      }
		      else{
			if(result.rows.length!=0){
			var node=new Object();
			node.type = "node";
			node.id = result.rows[0].id;
			node.lat = result.rows[0].lat;
			node.lon = result.rows[0].lon;
			node.tags= result.rows[0].tags;
			
			way.nodes.push(node);
			numberResults--;
			if(numberResults==0){
			  console.log("ok");
			  callback(way, false);
			}
		      }
		      }
		  });	  
		}
		}
		else {
		 console.log("nulo"); 
		 callback(null, false);
		}
	    }
	  
	});
  
}

