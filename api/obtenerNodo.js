/* Ejemplo
 * 
 * {
 * "elements" : [
 *    {
      "type": "node",
      "id": 1,
      "lat": 2.0,
      "lon": -3.0
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
    conString = "tcp://postgres:4321@localhost/validator",
    client;
    

exports.getNode = function getNode(res, id){
//   client.connect(function(err) {
// 	  if(err) {
// 	    return console.error('could not connect to postgres', err);
// 	  }
// 	    client.query('SELECT id, tags, ST_X(ST_TRANSFORM(ST_SetSRID(ST_MAKEPOINT(lon,lat), 900913), 4326)) as lon, ST_Y(ST_TRANSFORM(ST_SetSRID(ST_MAKEPOINT(lon,lat), 900913), 4326)) as lat FROM planet_osm_nodes WHERE id = ' + id + ';', function(err, result) {
// 	      console.log("query finalizada");
// 		var elements = [];
// 	      
// 		if(err) {
// 		  console.log("error");
// 		  res.send(JSON.stringify(elements));
// 		}
// 		else{
// 
// 		  var node=new Object();
// 		  node.type = "node";
// 		  node.id = id;
// 		  node.lat = result.rows[0].lat;
// 		  node.lon = result.rows[0].lon;
// 		  node.tags= result.rows[0].tags;
// 		  
// 		  elements.push(node);
// 		  res.send(JSON.stringify(elements));
// 		 }
// 		
// 	    });	  
//   });
	  this.nodeToJson(id, function(result, error){
	  
	  if (error){
	    console.log("Error con el nodo");
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

exports.nodeToJson = function nodeToJson(id, callback){
	    client.query('SELECT id, tags, ST_X(ST_SetSRID(ST_MAKEPOINT(lon / 100,lat / 100), 900913)) as lon, ST_Y(ST_SetSRID(ST_MAKEPOINT(lon / 100,lat / 100), 900913)) as lat FROM planet_osm_nodes WHERE id = ' + id + ';', function(err, result) {
		if(err) {
		  console.log("Node error"+ err);
		  callback(node, true);
		  
		}
		else{
		  console.log(result.rows.length);
		  if (result.rows.length > 0){
		  var node=new Object();
		  node.type = "node";
		  node.id = id;
		  node.lat = result.rows[0].lat;
		  node.lon = result.rows[0].lon;
		  node.tags= result.rows[0].tags;
		  callback(node, false);
		 }
		}
		 
	    });
	
}
