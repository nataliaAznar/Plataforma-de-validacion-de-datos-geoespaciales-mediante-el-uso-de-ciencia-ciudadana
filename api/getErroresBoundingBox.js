var pg = require("/usr/lib/node_modules/pg"),
    conString = "tcp://postgres:4321@localhost/validator",
    obtenerNodo = require('./obtenerNodo'),
    obtenerWay = require('./obtenerWay'),
    obtenerRel = require('./obtenerRel');
    

exports.getErrors = function getErrors(res, ids, xmin, ymin, xmax, ymax){
  var client = new pg.Client(conString);
      client.connect(function(err) {
	  var elements = [];
	  var numberResults=0;
	  if(err) {
	    return console.error('could not connect to postgres', err);
	  }
	  else{
	    client.query("SELECT * FROM item_error WHERE error="+ids+" AND ST_Intersects(ST_MakeEnvelope("+xmin+", "+ymin+", "+xmax+", "+ymax+", 4326), geom);", function(err, result) {
	      if(err) {
		 client.end();
		return console.error('error running query', err);
	      }
	      else{
		var resultado = result.rows;
		for (var i = 0; i<resultado.length; i++){
		  for (var j = 0; j < resultado[i].ids.length; j++){
		      numberResults++;
		  }
		}
		obtenerNodo.createConnection(function(error){
		    if (!error){
		      obtenerWay.createConnection(function(error){
			if(!error){
			 obtenerRel.createConnection(function(error){
			   if(!error){
			      for (var i = 0; i<resultado.length; i++){
				for (var j = 0; j < resultado[i].ids.length; j++){
				  switch(resultado[i].types[j]){
				    case "node":{
				      obtenerNodo.nodeToJson(resultado[i].ids[j], function(result, error){
					if(error){
					  numberResults--;
					  return console.error('BoundingBox error node '+error);
					}
					elements.push(result); 
					numberResults--;
					console.log("number results: "+numberResults);
					if(numberResults==0){
					    console.log("elements:  "+elements.length);
					    obtenerNodo.endConnection();
					    obtenerWay.endConnection();
					    obtenerRel.endConnection();
					    client.end();
					    res.send(JSON.stringify(elements));
					  }
				      });
				    }break;
				    case "way":{
				      obtenerWay.wayToJson(resultado[i].ids[j], function(result, error){
					if(error){
					  numberResults--;
					  return console.error('BoundingBox error way '+error);
					}
					console.log("way  resultado = " +result.nodes.length);
					elements.push(result); 
					numberResults--;
					console.log("number results: "+numberResults);
					console.log("SELECT * FROM item_error WHERE error="+ids+" AND ST_Intersects( ST_MakeEnvelope("+xmin+", "+ymin+", "+xmax+", "+ymax+", 4326), geom);");
					if(numberResults==0){
					  console.log("elements:  "+elements.length);
					  obtenerNodo.endConnection();
					  obtenerWay.endConnection();
					  obtenerRel.endConnection();
					  client.end();
					  res.send(JSON.stringify(elements));
					}
				      });
				    }break;
				    case "rel":{
				      obtenerRel.relToJson(resultado[i].ids[j], function(result, error){
					if(error){
					  numberResults--;
					  return console.error('BoundingBox error rel '+error);
					}
					elements.push(result); 
					numberResults--;
					console.log("number results: "+numberResults);
					if(numberResults==0){
					    console.log("elements:  "+elements.length);
					    obtenerNodo.endConnection();
					    obtenerWay.endConnection();
					    obtenerRel.endConnection();
					    client.end();
					    res.send(JSON.stringify(elements));
					  }
				      });
				    }
				  }
				}
			      }
			   }
			 });
			}
		      });
		    }
		});
	      }
	    });
	  }
      });
}
