var pg = require("/usr/lib/node_modules/pg"),
    conString = "tcp://postgres:4321@localhost/validator",
    client;
   

exports.getWay = function getWay(res, id){ 
   var a = new Array();
//    client.connect(function(err) {
// 	  if(err) {
// 	    return console.error('could not connect to postgres', err);
// 	  }
//    client.query('SELECT * FROM planet_osm_rels WHERE id = '+id+';', function(err, result) {
// 		var elements = [];
// 	      
// 		if(err) {
// 		  console.log("error");
// 		  res.send(JSON.stringify(elements));
// 		}
// 		else{
// 
// 		  var rel=new Object();
// 		  rel.type = "relation";
// 		  rel.id = id;
// 		  rel.way_off = result.rows[0].way_off;
// 		  rel.rel_off = result.rows[0].rel_off;
// 		  rel.parts = result.rows[0].parts;
// 		  rel.members = result.rows[0].members;
// 		  rel.tags= result.rows[0].tags;
// 		  rel.pending = result.rows[0].pending;
// 		  
// 		  elements.push(rel);
// 		  res.send(JSON.stringify(elements));
// 		 }
// 		
// 	});      
//    });
   
      this.relToJson(id, function(result, error){
	  
	  if (error){
	    console.log("Error con la relacion");
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

exports.relToJson = function relToJson(id, callback){
	  client.query('SELECT * FROM planet_osm_rels WHERE '+id+' = id;', function(err, result) {
		if(err) {
		  console.log("Rel error "+err);
		  callback(rel, true);
		}
		else{
		  var rel=new Object();
		  if(result.rows.length>0){
		    rel.type = "relation";
		    rel.id = id;
		    rel.way_off = result.rows[0].way_off;
		    rel.rel_off = result.rows[0].rel_off;
		    rel.tags= result.rows[0].tags;
		    rel.pending = result.rows[0].pending;
		    rel.members = new Array();
		    
		    var members = result.rows[0].members;
		    var table=new Array();
		    
		    var enc=false;
		    var j = 1;
		    while(!enc){
		      if(members[j] == outer){
			enc = true;
			var id= members[j - 1].substring(1);
			if(members[j - 1].substring(0,1)=="w"){
			  obtenerWay.wayToJson(id, function(result, error){
			    if(error){
			      return console.error('ObtenerRel error way '+error);
			    }
			    if(result!=null){
			      var num=j-1;
			      rel.members.splice(num, 2);
			      rel.members.push(result); 
			      for (var i = 0; i < members.length; i+2){
				  var id= members[i].substring(1);
				    if(members[i].substring(0,1)=="w"){
				      obtenerWay.wayToJson(id, function(result, error){
					if(error){
					  return console.error('ObtenerRel error way '+error);
					}
					if(result!=null){
					  rel.members.push(result); 
					}
				      });
				    } 
				    else
				    {
				      obtenerNodo.nodeToJson(id, function(result, error){
					if(error){
					  return console.error('BoundingBox error node '+error);
					}
					if(result!=null){
					  rel.members.push(result); 
					}
				      });
				    }
				}
			    }
			  });
			}
			else{
			  obtenerNodo.nodeToJson(id, function(result, error){
			    if(error){
			      return console.error('BoundingBox error node '+error);
			    }
			    if(result!=null){
			      var num=j-1;
			      rel.members.splice(num, 2);
			      rel.members.push(result); 
			      for (var i = 0; i < members.length; i+2){
				  var id= members[i].substring(1);
				    if(members[i].substring(0,1)=="w"){
				      obtenerWay.wayToJson(id, function(result, error){
					if(error){
					  return console.error('ObtenerRel error way '+error);
					}
					if(result!=null){
					  rel.members.push(result); 
					}
				      });
				    }
				    else{
				      obtenerNodo.nodeToJson(id, function(result, error){
					if(error){
					  return console.error('BoundingBox error node '+error);
					}
					if(result!=null){
					  rel.members.push(result); 
					}
				      });
				    }
				}
			    }
			  });
			}
			
		      }
		      j=+2;
		    }
		    
		    
		  }
		  callback(rel, false);
		 }
   });
}