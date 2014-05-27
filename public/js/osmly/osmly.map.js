/* jshint multistr:true */
osmly.map = function() {
    var bingTiles = new L.BingLayer('Arzdiw4nlOJzRwOz__qailc8NiR31Tt51dN2D7cm57NrnceZnCpgOkmJhNpGoppU');
  
    var map = L.map('map', {
        center: osmly.settings.origin,
        layers: [bingTiles],
        zoom: osmly.settings.zoom,
        maxZoom: 25,
        fadeAnimation: false
    });
    
    
    map.on('moveend', function() {
        var coords = map.getCenter().wrap(),
            lat = coords.lat.toFixed(4).toString(),
            lng = coords.lng.toFixed(4).toString(),
            zoom = map.getZoom().toString();
            osmly.osmlink = 'http://www.openstreetmap.org/#map=' + zoom + '/' + lat + '/' + lng;
    });

    map.attributionControl.setPrefix(false);
    if (osmly.settings.writeApi.split('dev').length > 1) map.attributionControl.setPrefix('DEV SERVER');

    map.osmTiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        maxZoom: 25,
        maxNativeZoom: 19
    });
    
    map.bingTiles = bingTiles;
    
    L.control.layers({'Bing' : map.bingTiles, 'OpenStreetMap' : map.osmTiles}, {}, {position: 'topleft'}).addTo(map);
    
    var info = L.control();

    info.onAdd = function (map) {
	this._div =  L.DomUtil.create('div', 'info'); // create a div with a class "info"
	this.update();
	return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
	this._div.innerHTML = '<a href="#instruction-modal" title="Instrucciones"></a>';
    };
    info.setPosition('topleft');

    info.addTo(map); 
    
    

    map.context = function(bbox, buffer, callback){
        // gets, filters, sets, and shows context
        if (buffer) {
            bbox = [
                bbox[0] - buffer,
                bbox[1] - buffer,
                bbox[2] + buffer,
                bbox[3] + buffer
            ];
        }

        if (map.hasLayer(map.contextLayer))
            map.removeLayer(map.contextLayer);

        osmly.ui.notify('obteniendo datos cercanos de OSM');
        getOsm(bbox, function(xml) {
	    if (xml){
            osmly.ui.notify('representando datos de OSM');
            context = filterContext(osm_geojson.osm2geojson(xml, true));
	    map.setContext(context, "contextLayer",  osmly.settings.contextStyle);
            map.addLayer(map.contextLayer);
	    }
	    map.setContext(osmly.import.focusGeoJson,"focusLayer", osmly.settings.focusStyle);
	    map.addLayer(map.focusLayer);
            callback();
        });

        // for offline usage
        // setTimeout(function() {
        //     setContext('');
        //     map.addLayer(map.contextLayer);
        //     callback();
        // }, 555);
    };

    
    map.toggleLayer = function(layer) {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        } else {
            map.addLayer(layer);
        }
    };

    function getOsm(bbox, callback) {
        $.ajax({
            url: osmly.settings.readApi + 'bbox=' + bbox.join(','),
            dataType: 'xml',
            success: function(xml) {
                map.osmContext = xml;
                callback(xml);
            },
	    error: function(){
	      callback();
	    }
        });
    }
    
    map.deleteGeometry = function(id){
      var updatedFeatureCollection = JSON.parse( JSON.stringify( osmly.import.data.featureCollection ) );  
      updatedFeatureCollection.features.splice(id, 1);
      osmly.import.data.send.splice(id, 1);

      osmly.import.hideItem();

      osmly.map.loadGeoData(updatedFeatureCollection);
      osmly.import.populateTags(osmly.import.data.send);
      osmly.import.displayGeoData();
    }
    
    

    function filterContext(geojson) {
        var geo = {
                'type' : 'FeatureCollection',
                'features' : []};

        for (var i = 0; i < geojson.features.length; i++) {
            var feature = geojson.features[i],
                match = false;

            // Filter downloaded OSM data to show only context
            // OPTION 1 SHOW ONLY CERTAIN VALUES OF A KEY: context: {highway: ['residential', 'primary', 'secondary']},
            // OPTION 2 SHOW ALL VALUES OF A KEY: context: {highway: true}
            if(osmly.settings.context){
		for (var key in feature.properties) {
		    if (key in osmly.settings.context &&
			(osmly.settings.context[key] === true || osmly.settings.context[key].indexOf(feature.properties[key]) > -1) &&
			!match) {
			match = true;
		    }
		}
		
		if (match || !Object.keys(osmly.settings.context).length) {
		    geo.features.push(feature);
		}
	    }
        }
        return geo;
    }

    map.setContext = function setContext(geojson, layerName, styles) {
        map[layerName] = L.geoJson(geojson, {
            style: styles,
            onEachFeature: function(feature, layer) {
	      
                var popup = '',
                    label = 'NO NAME, click for tags',
                    t = 0,
                    tagKeys = Object.keys(feature.properties);
		if (feature.properties) {
               
                    layer.bindPopup(popup);
                        // popup is bound upfront so we can get a leaflet layer id
                        // this id is included in the 'data-layer' attribute, used for merging

                    if (feature.properties.name) label = feature.properties.name;
                    while (t < tagKeys.length) {
                        // we don't display osm_* tags but they're used for merging
                        if (tagKeys[t].split('osm_').length === 1) {
                            popup += '<li><span class="k">' + tagKeys[t] +
                            '</span>: ' + feature.properties[tagKeys[t]] + '</li>';
                        }
                        t++;
                    }
                    layer._popup._content = popup;
                    layer.bindLabel(label);
                }
            },
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 6,
                    opacity: 1,
                    fillOpacity: 0.33
                });
            }
        });
    }
    
    map.on('click', function(e){
      $('.tags').hide();
    });
    
    map.loadGeoData = function(geojson) {
      var i = 0;
        map.featureLayer = L.geoJson(geojson, {
            style: osmly.settings.featureStyle,
            onEachFeature: function (feature, layer) {
	      //store the layer to use it later, for example deleting the geomtry
	      
	      osmly.import.data.send[i].layer = layer;
	      
	      if ( feature.geometry.type == 'MultiPolygon' || feature.geometry.type == 'MultiLineString' || feature.geometry.type == 'MultiPoint') {
		  for (var el in layer._layers) {
		      layer._layers[el].editing.enable();
		  }
	      }
	      else if(feature.geometry.type == 'Point')
	      {
	      }
	      else {
		  layer.editing.enable();
	      }
	      var selector = '#tags'+i;
	      //shows the table with the tags of the geometry that has been clicked
	      layer.on({ click: function(){
		$('.tags').hide();
		setTimeout( function(){
		   $(selector).show();
		}, 200);
	      }
		    })
	      i++;
	    
            }
        });

        map.fitBounds(map.featureLayer.getBounds());

        
            map.featureLayer.addTo(osmly.map);
            map.featureLayer.bringToFront();
       
    };
    
    return map;
};
