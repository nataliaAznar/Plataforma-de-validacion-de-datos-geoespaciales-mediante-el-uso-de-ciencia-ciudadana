var fs = require('fs'),
    xml2js = require('xml2js');
    pg = require("/usr/lib/node_modules/pg"),
    getBiggerId = require('/var/www/localhost/htdocs/validator/getBiggerId'),
    conString = "tcp://postgres:4321@localhost/validator",
    client = new pg.Client(conString);


exports.read = function read(file, token, callback){
  var filename = token+'.osm';
  var fl= __dirname+'/archivos/'+ file;
  var f2= __dirname+'/archivos/'+filename;
  var parser = new xml2js.Parser();
  var hasNodes = {};
  var hasWays = {};
  var hasRels = {};
  var nodeId;
  var wayId;
  var relId;
 
  
  
  fs.readFile(fl, function (err,data) {
    console.log(data);
    if (err) {
      return console.log("error en idAsigner" +err);
    }
    parser.parseString(data, function(err, result) {
        console.log('Done');
	var i = 0;
	var j = 0;
	for( i; i < result.osm.node.length; i++)
	{
	  var node = {};
	  node.id = result.osm.node[i].$.id;
	  node.lat = result.osm.node[i].$.lat;
	  node.lon = result.osm.node[i].$.lon;
	  if(result.osm.node[i].tag){
	    node.tags = {};
	    for ( j = 0; j < result.osm.node[i].tag.length; j++){
	      node.tags[result.osm.node[i].tag[j].$.k] = result.osm.node[i].tag[j].$.v;
	    }
	  }
	  else
	    node.tags = {};
	  hasNodes[result.osm.node[i].$.id] = node;
	}
	
	for( i = 0; i < result.osm.way.length; i++)
	{
	  var way = {};
	  way.id = result.osm.way[i].$.id;
	  
	  if(result.osm.way[i].nd){
	    way.ref = [];
	    for ( j = 0; j < result.osm.way[i].nd.length; j++){
	      way.ref[j] = result.osm.way[i].nd[j].$.ref;
	    }
	  }
	  else way.ref = [];
	  
	  if(result.osm.way[i].tag){
	    way.tags = {};
	    for ( j = 0; j < result.osm.way[i].tag.length; j++){
	      way.tags[result.osm.way[i].tag[j].$.k] = result.osm.way[i].tag[j].$.v;
	    }
	  }
	  else
	    way.tags = {};
	  hasWays[result.osm.way[i].$.id] = way;
	}
	
	
	for( i = 0; i < result.osm.relation.length; i++)
	{
	  var rel = {};
	  rel.id = result.osm.relation[i].$.id;
	  
	  if(result.osm.relation[i].member){
	    rel.member = [];
	    for ( j = 0; j < result.osm.relation[i].member.length; j++){
	      var mem={};
	      mem.type = result.osm.relation[i].member[j].$.type;
	      mem.ref = result.osm.relation[i].member[j].$.ref;
	      mem.role = result.osm.relation[i].member[j].$.role;
	      rel.member[j] = mem;
	    }
	  }
	  else
	    re.member = [];
	  
	  if(result.osm.relation[i].tag){
	    rel.tags = {};
	    for ( j = 0; j < result.osm.relation[i].tag.length; j++){
	      rel.tags[result.osm.relation[i].tag[j].$.k] = result.osm.relation[i].tag[j].$.v;
	    }
	  }
	  else
	    rel.tags = {};
	  
	  hasRels[result.osm.relation[i].$.id] = rel;
	}	
	
	/*
	 *  var hasNodes = {};
	    var hasWays = {};
	    var hasRels = {};
	    */
	var hasNodesPositive = {};
	var hasWaysPositive = {};
	var hasRelsPositive = {};
	
	console.log("Begin changing ids");
	client.connect(function(err) {
	  if ( err) console.log("error conecting to db "+ err);
	  var table = token+"nodes";
	  getBiggerId.getId(table, client, function(id, error){
	    nodeId = id;
	      if (error != 0) console.error("error "+error);
	      for ( var i in hasNodes ){
		var node = {};
		    node.id = id;
		    node.lat = hasNodes[i].lat;
		    node.lon = hasNodes[i].lon;
		    node.tags = hasNodes[i].tags;
		hasNodesPositive[id] = node;
		for ( var j in hasWays ){
		  for ( var n in hasWays[j].ref){
		    if (hasWays[j].ref[n] == i)	{hasWays[j].ref[n] = id; }
		  }
		}
		for (var r in hasRels){
		  for( var m in hasRels[r].member){
		    if(hasRels[r].member[m].type == "node") { hasRels[r].member[m].ref = id;}
		  }
		}
		id ++ ;
	      }
	      
	      console.log("End changing nodes");
	  
	      console.log("Begin changing ways");
	      var table = token+"ways";
	      getBiggerId.getId(table, client, function( id, error ){
		  if (error != 0) console.error("error "+error);
		  wayId = id;

		  for ( var i in hasWays ){
		    var way = {};
			way.id = id;
			way.ref = hasWays[i].ref;
			way.tags = hasWays[i].tags;
			
		    hasWaysPositive[id] = way;
		    for (var r in hasRels){
		      for( var m in hasRels[r].member){
			if(hasRels[r].member[m].type == "way") { hasRels[r].member[m].ref = id;}
		      }
		    }
		    id ++ ;
		  }
	      
		  console.log("End changing ways");
		  console.log("Begin changing rels");
		  var table = token+"rels";
		  getBiggerId.getId(table, client, function( id, error ){
		      if (error != 0) console.error("error "+error);
		      relId = id;
		      for ( var i in hasRels ){
			  var rel = {};
			      rel.id = id;
			      rel.tags = hasRels[i].tags;
			      rel.member = [];
			  for ( var l = 0; l < hasRels[i].member.length; l++){
			    rel.member[l] = hasRels[i].member[l];  
			  }			  
			  hasRelsPositive[id] = rel;
			  id ++;
		      }
		      console.log("End changing rels");
		      var w = "<?xml version='1.0' encoding='UTF-8'?> \n";
		      w = w+ "<osm version='0.6' upload='false' generator='JOSM'>\n"
		      fs.appendFileSync(f2, w );
		      for ( var a in hasNodesPositive){
			var p = 0;
			var w = "  <node  id='"+hasNodesPositive[a].id+"' version='1' lat='"+hasNodesPositive[a].lat+"' lon='"+hasNodesPositive[a].lon+"' ";
			for ( var c in hasNodesPositive[a].tags){
			  p = 1;
			  w = w+" >\n";
			  w = w+"    <tag k='"+c+"' v='"+hasNodesPositive[a].tags[c].replace('\'' , '')+"' />\n";
			}
			if (p ==0 ) w = w+'/>\n';
			else w = w+"  </node>\n"
			fs.appendFileSync(f2, w );
		      }
		      
		      for ( var b in hasWaysPositive){
			var w = "  <way  id='"+hasWaysPositive[b].id+"' version='1' >\n";
			for (var d in hasWaysPositive[b].ref){
			  w = w+"    <nd ref='"+hasWaysPositive[b].ref[d]+"' />\n"; 
			}
			for ( var e in hasWaysPositive[b].tags){
			  w = w+"    <tag k='"+e+"' v='"+hasWaysPositive[b].tags[e].replace('\'' , '')+"' />\n";
			}
			w = w+'  </way>\n';
			fs.appendFileSync(f2, w );
		      }
		      
		      for ( var f in hasRelsPositive){
			var w = "  <relation  id='"+hasRelsPositive[f].id+"' version='1'>\n";
			for (var g in hasRelsPositive[f].member){
			  w = w+"    <member type='"+hasRelsPositive[f].member[g].type+"' ref='"+hasRelsPositive[f].member[g].ref+"' role='"+hasRelsPositive[f].member[g].role+"' />\n"; 
			}
			for ( var e in hasRelsPositive[f].tags){
			  w = w+"    <tag k='"+e+"' v='"+hasRelsPositive[f].tags[e].replace('\'' , '')+"' />\n";
			}
			w = w+'  </relation>\n';
			fs.appendFileSync(f2, w );
		      }
		      var w = "</osm>";
		      fs.appendFileSync(f2, w );
		      console.log("end");
		      callback(filename);
		});
	      });
	    });
	});
    });
  }); 
}
