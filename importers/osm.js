//   idAsigner = require('./../idAsigner'),
var  pg = require("./../node_modules/pg"),
     exec = require('child_process').exec,
     sys = require('sys'),
     conString = "tcp://postgres:4321@localhost/validator",
     fs = require('fs');


exports.preanalyzeFile = function preanalyzeFile(token, fileToChange, callback){
  
//   idAsigner.read(fileToChange, token, function(filename){
  // He terminado
  var filename = token+".osm";
    callback(filename);
//   });
}


exports.prepareDB = function prepareDB(token, filename, callback){
      var client = new pg.Client(conString);
      client.connect(function(err) {
	if ( err ) console.log("error "+err);
	client.query("SELECT EXISTS( SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'validator_points')"+
	"AND EXISTS( SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'validator_lines')"+
	"AND EXISTS( SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'validator_polygons') AS EXISTE", function(err, result){
	  if (err){
	    console.log("error preparing db "+err);
	  } 
	  else {
	    if (!result.rows[0].existe){
	      
	      // CREAR TABLAS
	      client.query( " CREATE TABLE validator_points(\
		    id bigserial CONSTRAINT validator_points_pk PRIMARY KEY,\
		    tablename text,\
		    id_table bigint,\
		    tags hstore,\
		    way geometry(Point,4326)\
		      );\
		      CREATE INDEX validator_points_index\
		      ON validator_points\
		      USING gist\
		      (way);", function(err, result){
		      if ( err ) {
			console.log( "Error creating validator_points "+err);
			client.end();
		      }
		      else{
			client.query( " CREATE TABLE validator_lines(\
			      id bigserial CONSTRAINT validator_lines_pk PRIMARY KEY,\
			      tablename text,\
			      id_table bigint,\
			      tags hstore,\
			      way geometry(LineString,4326)\
			      );\
			      CREATE INDEX validator_lines_index\
			      ON validator_lines\
			      USING gist\
			      (way);", function(err, result){
				if ( err ){
				  console.log( "Error creating validator_lines "+err);
				  client.end();
				}
				else
				{
				    client.query( " CREATE TABLE validator_polygons(\
					    id bigserial CONSTRAINT validator_polygons_pk PRIMARY KEY,\
					    tablename text,\
					    id_table bigint,\
					    tags hstore,\
					    way geometry(Geometry,4326)\
					    );\
					    CREATE INDEX validator_polygons_index\
					    ON validator_polygons\
					    USING gist\
					    (way);", function(err, result){
					      if ( err ){
						console.log( "Error creating validator_lines "+err);
						client.end();
					      }
					      else
					      {
						fs.readdir('./../querys', function(err, files){
						    var nFiles = files.length;
						    var nReads = 0;
						    var i;
						    for ( i = 0; i < nFiles; i++) {
						      var t = require('./../querys/'+files[i]);
						      t.createTable(function(){ 
							nReads++; 
							if(nReads == nFiles){
							  callback();
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
	      });
	    }
	    else
	    {
	      fs.readdir('./querys', function(err, files){
		  var nFiles = files.length;
		  var nReads = 0;
		  var i;
		  for ( i = 0; i < nFiles; i++) {
		    var t = require('./../querys/'+files[i]);
		    t.createTable(function(){ 
		      nReads++; 
		      if(nReads == nFiles){
			callback();
			client.end();
		      }
		    });
		  }      
	      });
	    }
	  }
	  });	     
	});
  
}


exports.createTempTables = function createTempTables(callback){
  
  // He terminado
  callback();
}


exports.importData = function importData(token, filename, callback){
  var cmd='osm2pgsql --slim -c -m -j -d validator -U gisuser -H localhost --number-processes 6 --prefix ' + token + ' -C 3001 --hstore-add-index --exclude-invalid-polygon '+__dirname+'/../archivos/'+filename ;
	  run_cmd(cmd, function (me, data, error){
	    if(error){
	      console.log("error executing osm2pgsql "+error);
	    }
	      // AÑADIR LOS DATOS DE ESAS TABLAS A LAS TABLAS GLOBALES	  
		var client = new pg.Client(conString);
		client.connect(function(err) {
		  if ( err ) console.log("error "+err);
		    client.query("INSERT INTO validator_points (tablename, id_table, tags, way)  ( SELECT  'planet_osm_point' AS tablename, osm_id, tags, ST_TRANSFORM(way, 4326) FROM " + token + "_point) ;", function(err, result){
			console.log("Insert 1");
		      if (err){
			  console.log("error insert 1"+err);
			  client.end();
			}
			else{
			  client.query("INSERT INTO validator_lines ( tablename, id_table, tags, way)  (SELECT 'planet_osm_line' AS tablename, osm_id, tags, ST_TRANSFORM(way, 4326) FROM " + token + "_line) ;", function(err, result){
			    console.log("Insert 2");  
			    if (err){
				console.log("error insert 2"+err);
				client.end();
			      }
			      else
			      {
				client.query("INSERT INTO validator_polygons ( tablename, id_table, tags, way)  (SELECT 'planet_osm_polygon' AS tablename, osm_id, tags, ST_TRANSFORM(way, 4326) FROM " + token + "_polygon) ;", function(err, result){
				  console.log("Insert 3");  
				  if (err){
				      console.log("error insert 3 "+err);
				      client.end();
				    }
				    else{
				      callback();
				      client.end();
				      
				    }
				 });
			      }
			  });
			}
		      });
		});
	  });
}

exports.deleteTempTables = function deleteTempTables(token, callback){
  console.log("ejecutando borrado de tablas");
  var client = new pg.Client(conString);
  client.connect(function(err) {
    // BORRAR LAS TABLAS DE osm2pgsql
      client.query("DROP TABLE " + token + "_point", function(err, result){
	  if( err ) {
	    console.log("error droping " + token + "_point "+err);
	    client.end();
	  }
	  else
	  {
	      client.query("DROP TABLE " + token + "_line", function(err, result){
		  if( err ) {
		    console.log("error droping " + token + "_line "+err);
		    client.end();
		  }
		  else
		  {
		    client.query("DROP TABLE " + token + "_polygon", function(err, result){
			if( err ) {
			  console.log("error droping " + token + "_polygon "+err);
			  client.end();
			}
			else
			{
			   client.query("DROP TABLE " + token + "_nodes", function(err, result){
			      if( err ) {
				console.log("error droping " + token + "_nodes "+err);
				client.end();
			      }
			      else
			      {
				client.query("DROP TABLE " + token + "_rels", function(err, result){
				    if( err ) {
				      console.log("error droping " + token + "_rels "+err);
				      client.end();
				    }
				    else
				    {
				      client.query("DROP TABLE " + token + "_roads", function(err, result){
					  if( err ) {
					    console.log("error droping " + token + "_roads "+err);
					    client.end();
					  }
					  else
					  {
					    client.query("DROP TABLE " + token + "_ways", function(err, result){
						  if( err ) {
						    console.log("error droping " + token + "_ways "+err);
						    client.end();
						  }
						  else
						  {
						    console.log("END ");
						      callback();
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
		    });
		  }
	      });
	  }
      });
  });
}

  function run_cmd(cmd, callback) {
	var child = exec(cmd,{maxBuffer: 1024 * 1024}, function (error, stdout, stderr) {
	    sys.print('stdout: ' + stdout);
	    sys.print('stderr: ' + stderr);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }
	    callback(cmd, stdout, stderr);
	});
    }
