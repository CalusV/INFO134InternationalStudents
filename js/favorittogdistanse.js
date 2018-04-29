function distanceFromFav(){
	var leastDistance = 0;
	var lat1 = currentFav.latitude; 
	var lng1 = currentFav.longitude; 
	for(i=0;i<locationList[i].length;i++){
		var lat2 = lokasjonsListe[i].latitude;
		var lng2 = lokasjonsListe[i].longitude;
		var distance = Math.hypot(lat1 - lat2, lng1 - lng2);
		if (leastDistance <= distance) {
			leastDistance = distance;
			var leastDistanceMarker = new google.maps.Marker({
				position: new google.maps.LatLng(lat2, lng2)
			});
		}
