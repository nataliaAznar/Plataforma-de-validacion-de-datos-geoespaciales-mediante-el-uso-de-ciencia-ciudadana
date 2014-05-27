/* jshint multistr:true */
// common ui used by every mode
osmly.ui = (function() {
    var ui = {};

    ui.go = function() {
        setInterface();
        document.title = osmly.settings.title;
        $('#title').html(osmly.settings.title);
        $('#title, #top-bar').fadeIn(250);
	$('#locationName').hide();
	$('#geolocate,#introduceLocation').fadeIn(250);
	setRegion();
        bind();
    };
    ui.reload = function(){
      document.title = osmly.settings.title;
      $('#title').html(osmly.settings.title);
      $('#instruction-text').html(osmly.settings.instructions);
    };

    function setInterface() {
        $('body').append('\
            <div id="mode">\
                <div id="geolocate">Geolocalizar usuario »</div>\
                <div id="introduceLocation">Introducir localización »</div>\
                <textarea placeholder="Localizaci&oacute;n" id="locationName"></textarea>\
                <div id="send">Enviar »</div>\
            </div>\
        ');

        $('body').append('\
            <span id="title"></span>\
            <div id="notify"></div>\
        ');

        $('body').append('\
            <div class="semantic-content" id="instruction-modal">\
                <div class="modal-inner">\
                    <header id="modal-label"><h2>Instrucciones</h2></header>\
                    <div class="modal-content" id = "instruction-text">\
                    ' + osmly.settings.instructions + '\
                    </div>\
                </div>\
                <a href="#!" class="modal-close" title="Close this modal" data-close="Close" data-dismiss="modal"></a>\
            </div>\
            <div class="semantic-content" id="reusable-modal">\
                <div class="modal-inner wide800">\
                    <header id="modal-label"></header>\
                    <div class="modal-content">\
                    </div>\
                </div>\
                <a href="#!" class="modal-close" title="Close this modal" data-close="Close" data-dismiss="modal"></a>\
            </div>\
        ');
    }

    function setRegion() {
        if (!osmly.settings.region) return false;
        ui.region = L.geoJson(osmly.settings.region, {
            style: {
                color: '#fff',
                fill: false,
                clickable: false,
                weight: 3,
                opacity: 1
            }
        });

        osmly.map.fitBounds(ui.region.getBounds());

        ui.region.addTo(osmly.map);
        ui.region.bringToFront();
    }

    function bind() {
	$('#geolocate').on('click', geolocate);
	$('#introduceLocation').on('click', introduceLocation);
	$('#send').on('click', send);
    }





    ui.notify = function(string) {
        if (string !== '') string = '<span>' + string + '</span>';
        string = '<img src="static/loader.gif" />' + string;
        $('#notify').html(string);
        $('#notify').show();
        // don't forget to hide #notify later
    };

    
    function geolocate(){     
      osmly.location.getLocation(function(err){
	if(err == 0){
	      if (ui.region) osmly.map.removeLayer(ui.region);
	      $('#geolocate, #introduceLocation').fadeOut(250);
	      osmly.import.go();
	}
      });
    }

    function introduceLocation(){
	    if (ui.region) osmly.map.removeLayer(ui.region);
	    $('#geolocate, #introduceLocation').fadeOut(250);
	 $('#send').fadeIn(250);
	 $('#locationName').fadeIn(250);
    }
    
  
    function send(){
      osmly.geocoding.getLocation( function (err){     
	$('#send').fadeOut(250);
	$('#locationName').fadeOut(250);
	osmly.import.go();
      });
    }


    return ui;
}());
