/**/

/*Avstandskalkulator og korteste-avstand-finner :) */

//Placeholder-navn
	//currentFav (den valgte favoritten)
	//currentFav tilsvarer lokasjonsListe[i].entries, men valgt direkte i html-siden.

function distanceBetween2Latlng () {
	var lat1 = selectedElement1.latitude;
	var lng1 = selectedElement1.longitude;
	
	var lat2 = selectedElement2.latitude;
	var lng2 = selectedElement2.longitude;
	//Calculate distance
	distance = Math.hypot(lat1 - lat2, lng1 - lng2);
	//logger resultatet
	console.log("The distance between lat1: " + lat1 + " lng1: " + lng1 + 
				" and lat2: " + lat2 + " lng2: " + lng2 + " is " + distance);
	}
	
//currentFav er den valgte favorittlokasjonen
//lokasjonsListe er json-listen som skal letes igjennom. 
function distanceFromFav(){
	var currentDistance = 0;
	var leastDistance = 0;
	for(i=0; i<lokasjonsListe.length; i++){
		var lat1 = currentFav.latitude; //denne hentes utenfra og er konstant
		var lng1 = currentFav.longitude; //denne hentes utenfra og er konstant
		var lat2 = lokasjonsListe[i].latitude;
		var lng2 = lokasjonsListe[i].longitude;
		distanceBetween2Latlng() {		
			currentDistance = distance;
			leastDistance = currentDistance;
			if (currentDistance <= distance) {
				leastDistance = distance;
			}
		}
	}	
			
	console.log("Avstanden til nærmeste er " + leastDistance);
	}

/**/

function markFavorite () {
	
	
	
	
}