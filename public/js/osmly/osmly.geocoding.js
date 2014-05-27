osmly.geocoding = (function() {
   var location = {};
  
   location.getLocation = function(callback) {
     
     var city = document.getElementById("locationName").value;
     var url = "http://nominatim.openstreetmap.org/search?q=" + city + "&format=json&limit=1"
     
     $.ajax({
	  url: url,
	  type: 'GET',
	  dataType: 'json',
	  success: function(data) {
	    if (data.length !=0){
	      console.log("data "+data[0].lat);
	      location.lat = data[0].lat;
	      location.lon = data[0].lon;
	      callback(0);
	    }
	    else{
	      alert("Error: Position is unavailable!");
	      callback(1);
	    }
	  },
	  error: function(){
	    alert("Error: Position is unavailable!");
	    callback(1);
	  }
      });   
     
   };
   
    return location;
}());
 
