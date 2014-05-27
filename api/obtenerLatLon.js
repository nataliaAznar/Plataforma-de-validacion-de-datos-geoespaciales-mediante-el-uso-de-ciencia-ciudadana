var pg = require("/usr/lib/node_modules/pg"),
    conString = "tcp://postgres:4321@localhost/validator";
    

exports.getLatLon = function getLatLon(res, id){
  var client = new pg.Client(conString);
client.connect(function(err) {
	  if(err) {
	    return console.error('could not connect to postgres', err);
	  }
	  client.query('SELECT ids, types FROM item_error WHERE ids[0] = '+id+' OR ids[1] = '+id+';', function(err, result) {
	    if(err) {
	      return console.error('error running query', err);
	    }
	    var a = new Array();
	    var b = new Array();
	    var c = new Array();
	    var resultado = result.rows;
	    var numberResults = 0;
	    for(var i = 0; i < resultado.length; i++){
	      for(var j = 0; j < result.rows[i].ids.length; j++){
		numberResults++;
	      }
	    }
	    
	    for(var i = 0; i < resultado.length; i++){
	      for(var j = 0; j < result.rows[i].ids.length; j++){
		switch (resultado[i].types[j]){
		  case "point":{
		    client.query('SELECT id, lat, lon FROM planet_osm_nodes WHERE id = '+result.rows[i].ids[j]+';', function(err, result) {
			if(err) {
			  numberResults--;
			  client.end();
			  return console.error('error running query', err);
			}
			else{
			  b.push('point');
			  b.push(result.rows[0].id);
			  b.push(result.rows[0].lat);
			  b.push(result.rows[0].lon);
			  numberResults--;
			  a.push(b);
			  console.log('numberResults  '+numberResults);
			  if (numberResults == 0){
			    //prueba(a);
			    client.end();
			    res.send(a);
			    
			  }
			}
		    });
		  }break;
		  
		  case "line":{
		    client.query('SELECT id, nodes FROM planet_osm_ways WHERE id = '+result.rows[i].ids[j]+';', function(err, result) {
			if(err) {
			  numberResults--;
			  client.end();
			  return console.error('error running query', err);
			}
			else{
			  numberResults--;
			  var r=result.rows[0]
			  c.push('points');
			  for(var x = 0; x < r.nodes.length; x++){
				c.push(r.nodes[x]);
			      }
			  if(c[0]!=c[(c.length-1)]){
			    b.push('line');
			    b.push(result.rows[0].id);
			    b.push(c);
			  }
			  a.push(b);
			  c.length=0;
			  if (numberResults == 0){
			    //prueba(a);
			    client.end();
			    res.send(a);
			  }
			}
		    } );    
		  } break;
		  
		  case "polygon":{
		    //comprobar que se cierra¿¿¿¿
		    client.query('SELECT id, nodes FROM planet_osm_ways WHERE id = '+result.rows[i].ids[j]+';', function(err, result) {
			if(err) {
			  numberResults--;
			  client.end();
			  return console.error('error running query', err);
			}
			else{
			  numberResults--;
			  var r=result.rows[0]
			  for(var x = 0; x < r.nodes.length; x++){
				c.push('points');
				c.push(r.nodes[x]);
			      }
			  if(c[0]==c[(c.length-1)]){
			    b.push('polygon');
			    b.push(result.rows[0].id);
			    b.push(c);
			  }
			  a.push(b);
			  c.length=0;
			  if (numberResults == 0){
			    //prueba(a);
			    client.end();
			    res.send(a);
			  }
			}
		    });
		  }break;
		}
		b.length = 0;
	      }
	    }
	  });   
	});    
}

//     function prueba (a){
// 		console.log("a 2 "+a.length);
// 		for(var z=0; z<a.length; a++){
// 		  var d=a[z];
// 		    switch (d[0]){
// 		      case "point":{
// 			for(var f=0; f<d.length; f++){
// 			  console.log(d[f]);
// 			}
// 		      }
// 		      case "line":{
// 			for(var f=0; f<d.length; f++){
// 			  console.log(d[f]);
// 			}
// 		      }
// 		      case "polygon":{
// 			for(var f=0; f<d.length; f++){
// 			  console.log(d[f]);
// 			}
// 		      }
// 		    }
// 		 }   
// 	          
//     }
