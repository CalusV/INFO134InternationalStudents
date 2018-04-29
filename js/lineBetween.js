 var leastDistanceLine = [uph,sc];
	var lineBetweenLeastDistance = new google.maps.Polyline({
	  path: leastDistanceLine,
	  strokeColor: '#FF0000',
	  strokeOpacity: 1.0,
	  strokeWeight: 3
	});
	lineBetweenLeastDistance.setMap(map);
