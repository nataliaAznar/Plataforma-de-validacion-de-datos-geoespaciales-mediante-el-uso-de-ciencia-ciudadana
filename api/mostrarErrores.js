var pg = require("/usr/lib/node_modules/pg"),
    conString = "tcp://postgres:4321@localhost/validator";
    

exports.getErrors= function getErrors(res){ 
  var client = new pg.Client(conString);
    client.connect(function(err) {
	  if(err) {
	    return console.error('could not connect to postgres', err);
	  }
	  client.query('SELECT error, "desc" AS desc FROM error;', function(err, result) {	     
	    if(err) {
	      client.end();
	      return console.error('error running query', err);
	    }
	    var a='';
	    for(var i = 0; i < result.rows.length; i++){
		a=a+' ; '+ result.rows[i].error+":  "+result.rows[i].desc;
	    }
	    client.end();
	    res.send(a);
	   }); 
	   
	});   
}