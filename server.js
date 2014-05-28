var express = require("/usr/lib/node_modules/express"),
    app = express(),
    port = 3001,
    fs = require('fs'),
    obtener = require('./api/obtenerLatLon'),
    mostrarErrores = require('./api/mostrarErrores'),
    updateError = require('./api/updateError'),
    getError = require('./api/getError'),
    obtenerNodo = require('./api/obtenerNodo'),
    obtenerWay = require('./api/obtenerWay'),
    obtenerRel = require('./api/obtenerRel'),
    getErroresBoundingBox = require('./api/getErroresBoundingBox'),
    getErroresLimitadosBoundingBox = require('./api/getErroresLimitadosBoundingBox'),
    importer = require('./importers/importer'),
    path = require('path'),  // we will need it for file uploads
    pg = require("/usr/lib/node_modules/pg"),
    conString = "tcp://postgres:4321@localhost/validator";
	    

    app.configure(function(){
      app.use(express.bodyParser());
      app.use(express.static(__dirname + '/public'));
      
      app.use(express.logger(':method :url :status'));
      
      app.use(app.router);
    });
    
    app.configure('development', function(){
      app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });
 
    app.configure('production', function(){
      app.use(express.errorHandler());
    });

    app.get('/', function(req, res) {
        fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, text){
            res.send(text);
        });
    });
    
    //The parameters are sent on the body of the request
    app.get('/errors/near', function(req, res){
      var lat = req.query.lat,
	  lng = req.query.lon;
      getError.getErrorList(function( errors ){ 
	//Gets the maximun position of the array and selects one randomly, which would be the type of error to show
	var position = Math.floor(Math.random()*errors.length);
	var idError = errors[position];
	getError.getNearError(res, idError, lng, lat);
      });
      
    });
    
    app.post('/errors/:iderror/geom/:idgeom', function(req, res){
      var data = req.body[0].geometry;
      res.send();
      updateError.store(req.params.iderror, req.params.idgeom, req.connection.remoteAddress + '' + Math.floor(Math.random() * 1000), data, req.body[0].problem );
    });

    

    //get the error inside a BoundingBox
    app.get('/errorType/:id/:xmin/:ymin/:xmax/:ymax', function(req, res){
	console.log('He entrado por errorType');
	var ids = req.params.id;
	var xmin = req.params.xmin;
	var ymin = req.params.ymin;
	var xmax = req.params.xmax;
	var ymax = req.params.ymax;
	getErroresBoundingBox.getErrors(res, ids, xmin, ymin, xmax, ymax);
    });
    
    //get a diferent amount of errors inside a BoundingoBox, used for getting less errors while the zoom increases
    app.get('/numberErrorType/:id/:xmin/:ymin/:xmax/:ymax/:numErrors', function(req, res){
	console.log('He entrado por errorType limitado ' +req.params.numErrors);
	var ids = req.params.id;
	var xmin = req.params.xmin;
	var ymin = req.params.ymin;
	var xmax = req.params.xmax;
	var ymax = req.params.ymax;
	var numErrors = req.params.numErrors
	getErroresLimitadosBoundingBox.getErrors(res, ids, xmin, ymin, xmax, ymax, numErrors);
    });
    
    //upload a new file to the DataBase
    app.post('/upload', function(req, res) {
 	console.log("[SERVER.JS] Recibida peticion " + req + " - " + res+" body "+req.body );	
	res.send();
	var token = new Date().getTime();
	token = "t"+token;
	var tempPath = req.files.uploadingFile.path;
	var extension = path.extname(req.files.uploadingFile.name);
	var directoryRoute = __dirname+'/archivos';
	fs.mkdir( directoryRoute, 0777, function(){ //crea la carpeta archivos
	  var newName = token+''+extension
	  var targetPath = path.resolve(__dirname+'/archivos/'+newName);
	  fs.rename(tempPath, targetPath, function(err) {
	      if (err) 
		throw err;
	      else {
		console.log("Upload completed!");
		console.log('nombre :'+req.files.uploadingFile.name);
		importer.importFile(extension, newName, token );
	      }
	  });
	});
    });
 
    
  

    console.log("[SERVER.JS] Listening on port " + port)
    app.listen(port);
