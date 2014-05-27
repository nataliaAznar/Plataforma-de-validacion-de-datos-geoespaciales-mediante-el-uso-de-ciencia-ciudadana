osmly.location = (function() {
   var location = {};
  
   location.getLocation = function(callback) {
     if (navigator.geolocation)
     {
       var options = {timeout:60000};
       navigator.geolocation.watchPosition(function(position){
	 
	 location.lat = position.coords.latitude;
	 location.lon = position.coords.longitude;
	 callback(0);
	 
       }
       , function(err){
	 console.log(err);
	 if(err.code == 1) {
	   alert("Error: Access is denied!");
	 }else if( err.code == 2) {
	   alert("Error: Position is unavailable!");
	 }
	 callback(err.code);
       }, options);
     }
      else{console.log("Geolocation is not supported by this browser.");}
   };
   
    return location;
}());

