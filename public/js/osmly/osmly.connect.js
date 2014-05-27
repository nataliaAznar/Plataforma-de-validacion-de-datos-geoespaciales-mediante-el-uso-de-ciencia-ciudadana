osmly.connect = (function() {
    var connect = {};
    //28/10/2013sends the item to the server, to the url stored in the settings. The id of the geometry and the id of the error must be specificated in the GeoJson object. 
    connect.updateItemToServer = function( problem, callback) {
        var data = {};
		 
	data[0] = {};
	data[0].problem = problem + "";
	data[0].geometry = [];
	 
        var geojson = osmly.map.featureLayer.toGeoJSON();
	var tags = osmly.import.parseTagsTable();
	
	
	for ( var tag = 0; tag < tags.length; tag++){
	    geojson['features'][tag]['properties'] = tags[tag];
	}

	
	for( var geom in geojson.features){
	  data[0].geometry[geom] = JSON.stringify(geojson.features[geom]);
	}
	console.log("data");
	console.log(data);
	var idgeom = osmly.import.id;
	var iderror = osmly.import.error;
	var url = osmly.settings.writeServer + '/errors/'+ iderror+'/geom/'+idgeom;
                $.ajax({
                    url: url,
                    type: 'POST',
                    data: data,
                    dataType: 'json',
                    success: function() {
                        if (callback) callback();
                    }
                });   
    };
    return connect;
}());
