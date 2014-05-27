/* jshint multistr:true */
// import is a reserved word but it doesn't apply to properties
osmly.import = (function() {
    var imp = {};

    imp.go = function(){
        setInterface();
        bind();
        next();
    };

    imp.stop = function() {
       unbind();
       unsetInterface();
    };

    function bind() {
        // botton-left buttons
	$('#reset').on('click', reset);
        $('#skip').on('click', imp.skip);
        $('#problem').on('change', problem);
        $('#submit').on('click', submit);
//         $('#tagContainer').on('click', '.add-new-tag', alert('a'));
//         $('#tagContainer').on('click', '.tags .minus', function(){
//             if ($('.tags tr').length > 1) this.parentNode.remove();
//         });

// 	more useful if layer is no removed
        $('#osmtiles').on('click', function(){
//             $('#tags').toggle();
//             $('#action-block').toggle();
            osmly.map.toggleLayer(osmly.map.osmTiles);
//            osmly.map.toggleLayer(osmly.map.contextLayer);
//            osmly.map.toggleLayer(osmly.map.featureLayer);
        });

        $(document).on('click', '.merge', function(){
            // not sure why I can't do $('li').on...
            imp.mergeTags = JSON.parse(this.getAttribute('data-tags'));
            imp.mergeLayer = this.getAttribute('data-layer');
            var conflicts = compareTags(imp.mergeTags);
            if (conflicts) {
                conflictModal(conflicts);
            } else {
                merge();
            }
        });

        $('#reusable-modal').on('click', 'button', function(){
            $('[data-tag="' + this.getAttribute('data-tag') +'"]').removeAttr('style');
            $('[data-tag="' + this.getAttribute('data-tag') +'"]').removeAttr('data-selected');
            this.setAttribute('style', 'background: #7EEE7A');
            this.setAttribute('data-selected', 'true');
        });

        $('#reusable-modal').on('click', '#merge', function() {
            // turn the selected buttons into tags
            var selected = $('[data-selected]');
            if (selected.length == this.getAttribute('data-count')) {
                for (var a = 0; a < selected.length; a++) {
                    imp.mergeTags[selected[a].getAttribute('data-tag')] = selected[a].textContent;
                }
            }
            merge();
        });
    }

    function unbind() {
        $('#skip, #problem, #submit, #reset').off();
        $('.add-new-tag, .tags').off();
    }

    function setInterface() {
        var body = $('body');
	body.append('\<div id = "tagContainer"></div>');
        body.append('\<div id="action-block">\
                <li id="hold-problem" style="margin-left: 0;">\
                    <select name="problem" id="problem">\
                        <option value="problem" disabled selected>Problema</option>\
                    </select>\
                </li>\
                <li id="skip">Omitir</li>\
                <li id="submit">Enviar</li>\
                <li id="reset">Resetear</li>\
            </div>\
        ');

        var problem = $('#problem');
        for (var p = 0; p < osmly.settings.problems.length; p++) {
            problem.append('<option value="'+[p]+'">'+osmly.settings.problems[p]+'</option>');
        }


        body.append('\
            <div id="flash">\
                <div style="position: relative">\
                    <img class="problem hidden flash" src="static/problem.svg" />\
                    <img class="right-arrow hidden flash" src="static/right-arrow.svg" />\
                    <img class="up-arrow hidden flash" src="static/up-arrow.svg" />\
                </div>\
            </div>\
        ');
    }

    function unsetInterface() {
        $('.tags, #action-block, #bottom-right, #flash').remove();
        osmly.map.closePopup();
        if (osmly.map.hasLayer(osmly.map.featureLayer)) osmly.map.removeLayer(osmly.map.featureLayer);
        if (osmly.map.hasLayer(osmly.map.contextLayer)) osmly.map.removeLayer(osmly.map.contextLayer);
	if (osmly.map.hasLayer(osmly.map.focusLayer)) osmly.map.removeLayer(osmly.map.focusLayer);
    }

    // Show geojson layers in map
    imp.displayGeoData = function () {
      if( osmly.map.contextLayer){
        osmly.map.addLayer(osmly.map.contextLayer);
      }
	osmly.map.addLayer(osmly.map.focusLayer);
	osmly.map.addLayer(osmly.map.featureLayer);

        $('#notify').hide();
        $('#hold-problem, #submit, #bottom-right, #action-block').fadeIn(200);
        $('#tagContainer').fadeIn(200);
    }
    
    // Create tags table
    imp.populateTags = function (geometriesArray) {
      $('#tagContainer').html('');
      // Create one table for each geometry
      for(var pos in geometriesArray){
	   var name = 'tags'+pos;
	   var moreThanOneGeometry = geometriesArray.length > 1 ? '<button onclick = "osmly.map.deleteGeometry('+pos+')" style="margin-bottom: 20px; background:red" >BORRAR GEOMETRÍA</button>' : '';
	   $('#tagContainer').append('<div id="'+name+'" class = "tags">' +
	     moreThanOneGeometry +
            '<button onclick = "$(\'.tags\').hide()" class="tags-close" title="Close the tags" data-close="Close">x</button>\
            </br>\
                <table>\
                    <tbody></tbody>\
                </table>\
                <span class = "add-new-tag k" id="add-new-tag'+pos+'" onclick = "osmly.import.addTag('+pos+')"  alt="Add a new tag">+</span>\
                </br>\
            </div>\
	  ');

	   for (var prop in geometriesArray[pos].properties) {
	      if (geometriesArray[pos].properties[prop] !== null && geometriesArray[pos].properties[prop] !== 'null') {
		  $('#'+name+' tbody').append(
		      '<tr>' +
		      '<td class="k" spellcheck="false"><input type="text" onchange="osmly.import.parseTagsTable()" style="border: none" value = "' + prop + '"></td>' +
		      '<td class="v" spellcheck="false"><input type="text" onchange="osmly.import.parseTagsTable()" style="border: none" value = "' + geometriesArray[pos].properties[prop] + '"></td>' +
		      '<td class="minus"><button onclick = "osmly.import.removeTag(this)">-</button></td>'+
		      '</tr>');
	      }
	  }
      }
       $('.tags').hide();
    }
    
    

     imp.removeTag = function (event){
       event.parentNode.parentNode.remove();
       imp.parseTagsTable();
     }
     
     
    imp.hideItem = function (callback) {
        $('#bottom-right, #action-block, .tags').hide();
        if (callback) callback();
        osmly.map.closePopup();
        if (osmly.map.featureLayer) osmly.map.removeLayer(osmly.map.featureLayer);
        osmly.map.removeLayer(osmly.map.contextLayer);
	osmly.map.removeLayer(osmly.map.focusLayer);
    }

    imp.skip = function() {
        imp.deleted = [];
        imp.hideItem();
        leftToRight($('.right-arrow'));
        next();
    };

    function submit() {
        imp.hideItem();     
	osmly.connect.updateItemToServer( '');
	next();
        bigUp($('.up-arrow'));
    }

    function problem() {
        imp.hideItem();
	
        $('.problem').show(function(){
            setTimeout(function(){
                $('.problem').fadeOut(250);
            }, 250);
        });
	osmly.connect.updateItemToServer($('#problem')[0].options[$('#problem')[0].selectedIndex].text );
        $('#problem').val('problem');
        $('.tags tr').remove();
        next();
    }


    function reset() {
        imp.hideItem();
// 	delete imp.data.featureCollection.features;
// 	
// 	// Reset SEND
	imp.data.send = JSON.parse( JSON.stringify( imp.data.original ) ); // [{properties : {tags}, layer : layer, feature : feature}]
// 	
// 	imp.data.featureCollection.features = [];
// 	for(var pos in imp.data.original){
// 	  imp.data.featureCollection.features.push(imp.data.original[pos].feature);
// 	}
	
        osmly.map.loadGeoData(imp.data.featureCollection);
	imp.populateTags(imp.data.original);
        imp.displayGeoData();
    }

    imp.addTag = function (id) {
        $('#tags'+id+' tbody').append('\
            <tr>\
            <td class="k" spellcheck="false" ><input type="text" onchange="osmly.import.parseTagsTable()" style="border: none" ></td>\
            <td class="v" spellcheck="false" ><input type="text" onchange="osmly.import.parseTagsTable()" style="border: none" ></td>\
            <td class="minus"><button onclick = "osmly.import.removeTag(this)">-</button></td>\
            </tr>\
        ');
	imp.parseTagsTable();
    }

    function next() {
        if (osmly.map.hasLayer(osmly.map.featureLayer))
            osmly.map.removeLayer(osmly.map.featureLayer);
	

        osmly.ui.notify('obteniendo el siguiente elemento');
	var lat;
	var lon;
	if(osmly.location.lat != undefined)
	{// 	for(var geometryTags in geometriesTags){
	  lat = osmly.location.lat
	  lon = osmly.location.lon
	}
	else
	{
	  lat = osmly.geocoding.lat
	  lon = osmly.geocoding.lon
	}
        $.ajax({
            url: osmly.settings.db,
            dataType: 'json',
	    type: 'GET',
	    data: {lat : lat, lon: lon},
            success: function(data) {
                if (data) nextPrep(data);
	       else {
		 $('#reusable-modal ').html('<div class="modal-inner">\
                    <header id="modal-label"><h2>Error</h2></header>\
                    <div class="modal-content">\
                    There are no geometries of this kind of errors\
                    </div>\
                </div>\
                <a href="http://energia.deusto.es:3001/errors/error100.html" class="modal-close" title="Close this modal" data-close="Close" data-dismiss="modal"></a>\
                ');
		 CSSModal.open('reusable-modal');
	       }
            },
	    error: function(error){
	      if(error.status = 404){
		$('#reusable-modal ').html('<div class="modal-inner">\
                    <header id="modal-label"><h2>Error</h2></header>\
                    <div class="modal-content">\
                    There are no geometries of this kind of errors\
                    </div>\
                </div>\
                <a href="http://energia.deusto.es:3001/errors/error100.html" class="modal-close" title="Close this modal" data-close="Close" data-dismiss="modal"></a>\
                ');
		CSSModal.open('reusable-modal');
	      }
	    }
        });
// 	$("#tagContainer").hide();
    }

    function nextPrep(data) {
        imp.data = data;
	
	// IDENTIFICATION DATA
        imp.id = imp.data.id; // Store error id
	imp.error = imp.data.error; // Store error type
	
	// MAP DATA
        imp.bbox = imp.data.bounds; // Map bounds to download OSM data
        imp.focusGeoJson = imp.data.focus; // Error showing red geometry
	osmly.settings.title = imp.data.title; // Set map tittle
	osmly.settings.instructions = imp.data.instructions; // Set map instructions
// 	osmly.settings.usePropertyAsTag = [];
// 	osmly.settings.context=false;
	osmly.ui.reload(); // Reload user interface with the new texts
	
	// Store all info and references that will be sent to server
	// THESE WILL BE MANIPULATED
	imp.data.send = []; // [{properties : {tags}, layer : layer, feature : feature}]
	imp.data.original = []; // [{properties : {tags}, features : feature}]
	
	// SAVE ORIGINALS AND CREATE SEND OBJETCT
	for (var pos in imp.data.featureCollection.features){
	  imp.data.send.push({});
	  imp.data.original.push({});
	  
	  imp.data.send[pos].feature = imp.data.featureCollection.features[pos];
	  imp.data.send[pos].properties = imp.data.featureCollection.features[pos].properties;
	  
	  imp.data.original[pos].feature = imp.data.featureCollection.features[pos];
	  imp.data.original[pos].properties = imp.data.featureCollection.features[pos].properties;
	}
	
	// PROCESS DATA
	osmly.map.loadGeoData(imp.data.featureCollection);
	imp.prepareTags();
	osmly.map.context(imp.bbox, 0.001, function() {
	    imp.populateTags(imp.data.original);
	    imp.displayGeoData();
	});
    }


    imp.prepareTags = function(tags) {
        // this needs to be used for editInJosm in .connect
        // bound to data.properties right now
        renameProperties();
        //TODO usePropertiesAsTag(); //this removes tags 
        appendTags();
    };

    function renameProperties() {
        // converts the feature key, doesn't remove old one
        // ex. NAME -> name, CAT2 -> leisure
      for(var pos in imp.data.original){
	for (var prop in osmly.settings.renameProperty) {
	    var change = osmly.settings.renameProperty[prop];
	    imp.data.original[pos].properties[change] = imp.data.original[pos].properties[prop];
	}
      }
    }

    function usePropertiesAsTag() {
        // filters properties to be used as tags
      for( var pos in imp.data.original){
	for (var prop in imp.data.original[pos].properties){
	  if (osmly.settings.usePropertyAsTag.indexOf(prop) === -1 && imp.data.original[pos].properties[prop].toUpperCase() != 'FIXME') {
	      delete imp.data.original[pos].properties[prop];
	  }
	}
      }
    }

    function appendTags() {
      for( var pos in imp.data.original){
        for (var append in osmly.settings.appendTag) {
            imp.data.original[pos].properties[append] = osmly.settings.appendTag[append];
        }
      }
    }

    //store all the tags in a variable and returns it
    imp.parseTagsTable = function(){
       var allTags = [];
       for (var pos in imp.data.send){
	      
	      var properties = {};
	      var table = 'tags' + pos;
	      var tgs = byId(table),
		  trs = tgs.getElementsByTagName('tr');
	      for (var a = 0; a < trs.length; a++) {
		  // 0 = key, 1 = value, 2 = minus
		  var tds = trs[a].getElementsByTagName('td');
		  if (tds[0].getElementsByTagName('input')[0].value !== '' && tds[1].getElementsByTagName('input')[0].value !== '') {
		      properties[tds[0].getElementsByTagName('input')[0].value] = tds[1].getElementsByTagName('input')[0].value;
		  }
	      }
	      allTags.push(properties);
	      imp.data.send[pos].properties = properties;
    }
        return allTags;
    };
    
    
    function discardTags() {
        var tags = osmly.import.tags();
        for (var tag in tags) {
            for (var a = 0; a < osmly.settings.discardTags.length; a++) {
                if (osmly.settings.discardTags[a] == tag) delete tags[tag];
            }
        }
        return tags;
    }


    function compareTags(tags) {
        var conflicts = {},
            count = 0,
            importTags = osmly.import.tags();
        for (var tag in tags) {
            if (importTags[tag] && (importTags[tag] != tags[tag])) {
                conflicts[tag] = tags[tag];
                count++;
            }
        }
        if (count) return conflicts;
        return false;
    }

    function conflictModal(conflicts) {
        $('#reusable-modal #modal-label').html('<h2>Tag Conflict</h2>');

        var html = '',
            importTags = osmly.import.tags(),
            count = 0;

        for (var conflict in conflicts) {
            html += '<div class="conflict">' +
                '\'' + conflict + '\' is ' +
                '<button class="eee" data-tag="' + conflict + '" data-source="import">' + importTags[conflict] + '</button> or ' +
                '<button class="eee" data-tag="' + conflict + '" data-source="osm">' + conflicts[conflict] + '</button> ?' +
                '</div>';
            count++;
        }

        html += '<span id="merge" data-count="' + count + '" style="cursor: pointer; font-weight: bold;">Merge</span>';

        $('#reusable-modal .modal-content').html(html);
        CSSModal.open('reusable-modal');
    }

    /*function merge() {
        var tags = {};
        if (!imp.deleted) imp.deleted = [];
        imp.deleted.push(imp.mergeTags.osm_id);

        for (var tag in imp.mergeTags) {
            if (tag.split('osm_').length === 1) {
                tags[tag] = imp.mergeTags[tag];
            }
        }
        imp.populateTags(tags);
        CSSModal.close();
        osmly.map.removeLayer(osmly.map._layers[imp.mergeLayer]);
    }*/

    /*function buildDelete() {
        if (!imp.deleted.length) return '';
        if (osmly.settings.writeApi.split('dev').length > 1) return '';
        var xml = '<delete if-unused="true">',
            s = new XMLSerializer();
        for (var id in imp.deleted) {
            var element = osmly.map.osmContext.getElementById(imp.deleted[id]);
            element.setAttribute('changeset', token(osmly.settings.db + 'changeset_id'));
            xml += s.serializeToString(element);
        }
        xml = xml.split('\t').join('');
        xml = xml.split('\n').join('');
        return xml + '</delete>';
    }

    imp.bindContextNodes = function() {
        var layers = osmly.map.contextLayer._map._layers;
        for (var layer in layers) {
            layer = layers[layer];
            if (layer._icon && layer.options.opacity && layer.options.opacity === 1) {
                console.log('bound');
                layer.on('mouseover', function() {
                    // do whatever
                    console.log('sticky door');
                });
            }
        }
        // need to make context nodes some kind of markers
    };*/

    return imp;
}());
