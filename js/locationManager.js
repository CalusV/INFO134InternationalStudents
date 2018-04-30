/// All global variables
var map, markers;
markers = [];
map = "";

/*
	getJSON(url) = Løftefunksjon for å laste side og verifisere JSON.
	loadTable() = Laster en ny liste med toaletter fra JSON-filen. Kan knyttes til API om nødvendig.
		* refreshTable() = Clears and populates the table.
				* clearTable() = Brukes til å tømme et table så man ikke må refreshe for å videreutvikle søk.
				* populateTable() = Brukes til å generere listene over toaletter.
		* executeSearch() = Genererer en mindre liste avhengig av søkekriterier.
				* generateSearch() = Lager et searchQuery-objekt basert på data fra HTML-skjema.
	SearchQuery() = PROTOTYPEN for query-objekter som brukes til å søke.
*/

function getJSON(url){
	return new Promise(function(resolve, reject){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200){
					if(JSON.parse(xhr.response)){
					 	var list = JSON.parse(xhr.response);
						resolve(list);
						console.log("JSON validated, promise succeeded.");
					} else {
						reject("JSON not validated.");
					}
				} else {
					reject(xhr.statusText);
					console.log("Rejected URL promise.");
				}
			}
		}
		xhr.send();
	});
}

function loadTable(url, loadType){
	var searchTable = document.getElementById("searchTable");
	var isToiletRegex = /dokart/;
	var isPlaygroundRegex = /lekeplass/;
	var tableName = "";
	var locationList = [];
	var locationEntries = 0;

	if (isToiletRegex.test(url)){
		tableName = "toilet";
	} else if (isPlaygroundRegex.test(url)){
		tableName = "playground";
	} else {
		tableName = "kindergarden";
	}
	var searchType = tableName;

	// PROMISE //
	var listPromise = getJSON(url);
	listPromise.then(function(value){


		if(loadType === "search"){
			if(locationList !== undefined) { //Delete previous markers
				deleteMarkers();
			}

			console.log("Updating table from search.");
			if(tableName === "kindergarden") {
				// This adds an ID attribute to each element in the kindergarden list
				for(i = 0; i < value.length; i++) {
					value[i].id = i + 1;
				}
				locationList = executeSearch(value, tableName);
			}
			else {
				locationList = executeSearch(value.entries, tableName);
			}
			console.log(locationList);
		} else if(loadType === "load"){
			if(tableName === "kindergarden") {
				// This adds an ID attribute to each element in the kindergarden list
				createIdAttributeForListElements(value);
				locationList = value;
			}
			else {
				locationList = value.entries;
			}
		}

		locationEntries = locationList.length;
		console.log("Number of entries in list is: " + locationEntries);
		//Refreshing the table by clearing old content and building new map.
		refreshTable(searchTable, searchType);

		// Refreshes the table based on search information. Sub function for loadTable()
		function refreshTable (searchTable, searchType){
			clearTable(searchTable); // Denne var tidligere searchTable
			populateTable(searchTable, locationList, searchType);
				generateAndPushMarkers(locationList, tableName);
				for(i = 0; i < markers.length; i++) {
					if(markers[i] !==  null) {
						markers[i].setMap(map);
					}
				}
				generateInfoWindow(searchType, locationEntries);
	}});
}
	/*
	    SØKEFUNKSJONALITET
	*/
	//Konstruktør for søkeobjekt
function SearchQuery (male, baby, openSunday, openSaturday, openEveryday, access, maxPrice, female, freeSearch) {

		this.herre = male;
		this.stellerom = baby;
		this.tid_sondag = openSunday;
		this.tid_lordag = openSaturday;
		this.tid_hverdag = openEveryday;
		this.rullestol = access;
		this.pris = maxPrice;
		this.dame = female;
		this.search = freeSearch;
	}

function clearTable(table, condition) { //Tøm tabellen fra søk til søk
		if(condition === undefined || condition === null) {
			var tableHeaderRowCount = 0;
		}
		else {
			tableHeaderRowCount = 1;
		}
	  var clearingTable = table;

	    var rowCount = clearingTable.rows.length;
	    for (var i=tableHeaderRowCount; i < rowCount; i++){
	      searchTable.deleteRow(tableHeaderRowCount);
	    }
	}

function generateTableHeaders(searchTable, tableName) {
		if(tableName === "toilet") {
			var toiletAttributeNames = ["Index", "Location", "Adresse", "Weekdays", "Saturdays", "Sundays", "Genders", "Wheelchair", "Changing Stations", "Price", "Mark Favorites"];
			var headerRow = searchTable.insertRow(0);
			for(i = 0; i < 11; i++) {
				var cell = headerRow.insertCell(i);
				cell.innerHTML = toiletAttributeNames[i];
				cell.setAttribute("id", "th-" + (i+1));
				if(i !== (3) && i !== (4) && i !== (5) && i !== (10)) {
					cell.setAttribute("onclick","startSort(this)");
				}
			}
		}
		else if(tableName === "playground") {
			var playgroundAttributeNames = ["Index", "Location", "Mark Favorites"];
			var headerRow = searchTable.insertRow(0);
			for(i = 0; i < 3; i++) {
				var cell = headerRow.insertCell(i);
				cell.innerHTML = playgroundAttributeNames[i];
				cell.setAttribute("id", "th-" + (i+1));
				if(i !== (2)) {
					cell.setAttribute("onclick","startSort(this)");
				}
			}
		}
		else if(tableName === "kindergarden") {
			var kindergardenAttributeNames = ["Index", "Location", "Adresse", "Email", "Kindergarden name", "Telephone"];
			var headerRow = searchTable.insertRow(0);
			for(i = 0; i < 6; i++) {
				var cell = headerRow.insertCell(i);
				cell.innerHTML = kindergardenAttributeNames[i];
				cell.setAttribute("id", "th-" + (i+1));
				if(i !== (4) && i !== (5)) {
					cell.setAttribute("onclick","startSort(this)");
				}
			}
		}
	}

function createIdAttributeForListElements(value) {
	for(i = 0; i < value.length; i++) {
		value[i].id = i + 1;
	}
}

/**
 * By clicking on a cell index the map will zoom and center at the marker position
**/
function filterByIndex(obj, tableName, url){
		window.scrollTo(0, 100);
		map.setZoom(14);
		setTimeout(function() {
			var promise = getJSON(url);
			promise.then(function(value) {
				var locationList = value;
				if(tableName !== "kindergarden") {
					locationList = locationList.entries;
				}
				else {
					createIdAttributeForListElements(locationList);
				}
				var index = obj.innerHTML;
				index = index.replace(".", "");
				// console.log("List: ", locationList);
				// console.log("Index: ", index);
				for(i = 0; i < locationList.length; i++) {
					if(locationList[i].id.toString() === index) {
						// console.log("Found match: " + (locationList[i].id.toString() === index));
						if(tableName === "kindergarden") {
							map.setCenter(new google.maps.LatLng(locationList[i].Breddegrad, locationList[i].Lengdegrad));
						}
						else {
							map.setCenter(new google.maps.LatLng(locationList[i].latitude, locationList[i].longitude));
						}
						map.setZoom(17);
					}
			}
		})
	}, 1000)
}

function generateNewSortedTable(sortedList) {
	var table = document.getElementById('searchTable');
	var rows = getTableRows();
	clearTable(table, true);
	for(i = 0; i < rows.length; i++) {
		table.appendChild(sortedList[i]);
	}
}

function getTableRows() {
	var rows = document.getElementsByTagName('tr');
	var length = document.getElementsByTagName('tr').length;
	var array = [];
	for(i = 1; i < length; i++) {
		array.push(rows[i]);
	}
	return array;
}

/**
 * This chain of functions which starts a column sort uses quick sort
 * in sortTableAlfabetical function.
 * First we call generateNewSortedTable, then pass in the function that
 * actually sorts the table column selected by the user. This function takes in
 * a function getTableRows which returns all table rows packed in an array
 * and a indicator of which headerElement (column) to be sorted.
 * Not all columns is set to be able to be sortet because of the time it can take
**/
function startSort(headerElement) {
	generateNewSortedTable(sortTableAlfabetical(getTableRows(), headerElement));
}

function sortTableAlfabetical(rows, headerElement) {
		if(rows.length <= 1) {
			console.log("Rows:");
			return rows;
		}
		else {
			if(headerElement.innerHTML === "Index") {
				var rowChildNode = 0;
			}
			else if(headerElement.innerHTML === "Location") {
				var rowChildNode = 1;
			}
			else if(headerElement.innerHTML === "Adresse") {
				var rowChildNode = 2;
			}
			else if(headerElement.innerHTML === "Email") {
				var rowChildNode = 3;
			}
			else if(headerElement.innerHTML === "Genders") {
				var rowChildNode = 6;
			}
			else if(headerElement.innerHTML === "Wheelchair") {
				var rowChildNode = 7;
			}
			else if(headerElement.innerHTML === "Changing Stations") {
				var rowChildNode = 8;
			}
			else if(headerElement.innerHTML === "Price") {
				var rowChildNode = 9;
			}
			var left = [];
			var right = [];
			var newRowList = [];
			var pivot = rows.pop();
			var tableLength = rows.length;
			for(i = 0; i < tableLength; i++) {
				// console.log("Cell: " + rows[i].childNodes[rowChildNode].innerHTML);
				// console.log("Pivot: " + pivot.childNodes[rowChildNode].innerHTML);
				// console.log(rows[i].childNodes[rowChildNode].innerHTML.charAt(0), "greater than", pivot.childNodes[rowChildNode].innerHTML.charAt(0), " | ", rows[i].childNodes[rowChildNode].innerHTML.charAt(0) <= pivot.childNodes[rowChildNode].innerHTML.charAt(0));
				if(rowChildNode === 0) {
					var indexNr1 = parseInt(rows[i].childNodes[rowChildNode].innerHTML);
					var indexNr2 = parseInt(pivot.childNodes[rowChildNode].innerHTML);
					if(indexNr1 <= indexNr2) {
						left.push(rows[i]);
					}
					else {
						right.push(rows[i]);
					}
				}
				else {
					if(rows[i].childNodes[rowChildNode].innerHTML <= pivot.childNodes[rowChildNode].innerHTML) {
						left.push(rows[i]);
						// console.log("Pushed to left: ", rows[i].childNodes[0].innerHTML + " | " + rows[i].childNodes[rowChildNode].innerHTML);
					}
					else {
						right.push(rows[i]);
						console.log("Pushed to right: ", rows[i].childNodes[0].innerHTML + " | " + rows[i].childNodes[rowChildNode].innerHTML);
					}
				}
			}
			return newRowList.concat(sortTableAlfabetical(left, headerElement), pivot, sortTableAlfabetical(right, headerElement));
		}
}

function generateTableCells(searchTable, locationList, tableName) {
	var locationEntries = locationList.length;
		if(tableName === "toilet") {
			for (i = 0; i < locationEntries; i++) {
				var newRow = searchTable.insertRow(i+1);
				var firstCell = newRow.insertCell(0);
				firstCell.setAttribute("class", "cell1");
				firstCell.setAttribute("onclick", "filterByIndex(this, 'toilet', 'https://hotell.difi.no/api/json/bergen/dokart?')");
				var locCell = newRow.insertCell(1);
				locCell.setAttribute("class", "cell2");
				var adrCell = newRow.insertCell(2);
				adrCell.setAttribute("class", "cell3");
				var wDayCell = newRow.insertCell(3);
				wDayCell.setAttribute("class", "cell4");
				var satCell = newRow.insertCell(4);
				satCell.setAttribute("class", "cell5");
				var sunCell = newRow.insertCell(5);
				sunCell.setAttribute("class", "cell6");
				var genderCell = newRow.insertCell(6);
				genderCell.setAttribute("class", "cell7");
				var wChairCell = newRow.insertCell(7);
				wChairCell.setAttribute("class", "cell8");
				var babyCell = newRow.insertCell(8);
				babyCell.setAttribute("class", "cell9");
				var priceCell = newRow.insertCell(9);
				priceCell.setAttribute("class", "cell10");
				var favLocal = newRow.insertCell(10);
				favLocal.setAttribute("class", "cell11");

				// Cell value
				firstCell.innerHTML = locationList[i].id + ".";
				locCell.innerHTML = locationList[i].place;
				adrCell.innerHTML = locationList[i].adresse;
				wDayCell.innerHTML = locationList[i].tid_hverdag;

				//Åpningstider
		    if (locationList[i].tid_lordag == "NULL"){
		      satCell.innerHTML = "Closed";
		    } else {
		      satCell.innerHTML = locationList[i].tid_lordag;
		    }

		    if (locationList[i].tid_sondag == "NULL"){
		      sunCell.innerHTML = "Closed";
		    } else {
		      sunCell.innerHTML = locationList[i].tid_sondag;
		    }

		    //Kjønn
		    var genderString = "";
		    if (locationList[i].herre == "1") {
		      genderString += "M";
		    }
		    if (locationList[i].dame == "1"){
		      genderString += "F";
		    }
		    if (locationList[i].herre != "1" || locationList[i].dame != "1") {
		      genderString += "NA";
		    }

		    genderCell.innerHTML = genderString;

		    //Handicaptilgang
		    if (locationList[i].rullestol == "1") {
		      wChairCell.innerHTML = "Yes";
		    } else {
		      wChairCell.innerHTML = "No";
		    }

		    //Stellerom for baby
		    if (locationList[i].stellerom == "1") {
		      babyCell.innerHTML = "Yes";
		    } else {
		      babyCell.innerHTML = "No";
		    }

		    //Pris
		    if (locationList[i].pris == 0){
		      priceCell.innerHTML = "FREE";
		    }

		    else if (locationList[i].pris == "NULL"){
		      priceCell.innerHTML = "Unknown";
		    } else {
		      priceCell.innerHTML = locationList[i].pris + "Kr";
		    }

				//Mark favorite
					var favButton = document.createElement("Button");
					var favMark = document.createTextNode("Mark Favorite!");
					favButton.appendChild(favMark);
					favLocal.appendChild(favButton);
					favLocal.setAttribute ("onClick", "buttonFunction(this, 'toilet')");
			}
		}
		else if (tableName === "playground") {
			for (i = 0; i < locationEntries; i++) {
				var newRow = searchTable.insertRow(i+1);
				var firstCell = newRow.insertCell(0);
				firstCell.setAttribute("class", "cell1");
				firstCell.setAttribute("onclick", "filterByIndex(this, 'playground', 'https://hotell.difi.no/api/json/bergen/lekeplasser?')");
				var locCell = newRow.insertCell(1);
				locCell.setAttribute("class", "cell2");
				var favLocal = newRow.insertCell(2);
				favLocal.setAttribute("class", "cell3");

				// Cell value
				firstCell.innerHTML = locationList[i].id + ".";
				locCell.innerHTML = locationList[i].navn;

				//Mark favorite
					var favButton = document.createElement("Button");
					var favMark = document.createTextNode("Mark Favorite!");
					favButton.appendChild(favMark);
					favLocal.appendChild(favButton);
					favLocal.setAttribute ("onClick", "buttonFunction(this, 'playground')");
			}
		}
		else if (tableName === "kindergarden") {
			for (i = 0; i < (locationEntries); i++) {
				var newRow = searchTable.insertRow(i+1);
				var firstCell = newRow.insertCell(0);
				firstCell.setAttribute("class", "cell1");
				firstCell.setAttribute("onclick", "filterByIndex(this, 'kindergarden', 'https://data-nbr.udir.no/enheter/kommune/1201')");
				var locCell = newRow.insertCell(1);
				locCell.setAttribute("class", "cell2");
				var adrCell = newRow.insertCell(2);
				adrCell.setAttribute("class", "cell3");
				var emailCell = newRow.insertCell(3);
				emailCell.setAttribute("class", "cell4");
				var fullName = newRow.insertCell(4);
				fullName.setAttribute("class", "cell5");
				var phoneCell = newRow.insertCell(5);
				phoneCell.setAttribute("class", "cell6");
				var favLocal = newRow.insertCell(6);
				favLocal.setAttribute("class", "cel7");

				// Cell value
				var locationName = locationList[i].BesoksAdresse.split(",");
				firstCell.innerHTML = locationList[i].id + ".";
				locCell.innerHTML = locationName[0];
				adrCell.innerHTML = locationName[1];
				emailCell.innerHTML = locationList[i].Epost;
				fullName.innerHTML = locationList[i].FulltNavn;
				phoneCell.innerHTML = locationList[i].Telefon;

				//Mark favorite
					var favButton = document.createElement("Button");
					var favMark = document.createTextNode("Mark Favorite!");
					favButton.appendChild(favMark);
					favLocal.appendChild(favButton);
					favLocal.setAttribute ("onClick", "buttonFunction(this, 'kindergarden')");
			}
		}
	}
/*Får navnet av favorittlekeplass fra samme rad som knappen og sender til Urlen til den nye htmlsiden.
Sender også hvilken tabell det er fra
*/
function buttonFunction(x, tableName){
	var table = document.getElementById('searchTable');
	c = table.rows[x.parentElement.rowIndex].cells[1].innerHTML;
	window.open("favLocal.html?"+c+'?'+tableName);

}
//funksjonen marker favorittlekeplass og finner og markerer nærmeste toalett.
function favPlace() {
	var x = document.location.href;
  var params = x.split('?')[1].replace(/%20/g,' ').replace(/%C3%A5/g,'å').replace(/%C3%B8/g,'ø').replace(/%C3%A6/g,'æ').replace(/%C3%98/g,'Ø');
	var table=x.split('?')[2];

	if (table === "playground"){
  	document.getElementById('placeFav').innerHTML ='Your favorite playground is '+ params;
	} else if (table === "toilet"){
  	document.getElementById('placeFav').innerHTML ='Your favorite toilet is '+ params;
	}


	//hvis favoritt er toalett(slett om vi ikke skal brue favorittdo)
	var url = "";
	var nearestURL = "";

	if(table === "toilet"){
		url='https://hotell.difi.no/api/json/bergen/dokart?';
		nearestURL='https://hotell.difi.no/api/json/bergen/lekeplasser?';
	} else if (table === "playground"){
		url='https://hotell.difi.no/api/json/bergen/lekeplasser?';
		nearestURL='https://hotell.difi.no/api/json/bergen/dokart?';
	}

	var promise=getJSON(url);
	promise.then(function(value){
		var locationList = value;
		var favourite = undefined;
		locationList = locationList.entries;
		console.log(params);
		console.log(locationList);
		/*Finnes lekeplassen med samme navn i listen og henter koordinater
		Disse brukes for å lage markers og finne nærmeste toalett
		*/

		if(table === "playground"){
			favourite = locationList.filter(location => location.navn.toString() === params);
		} else if (table === "toilet"){
			favourite = locationList.filter(location => location.place.toString() === params);
		}
		console.log(favourite);
		var favLat = favourite[0].latitude;
		var favLong = favourite[0].longitude;
		console.log("Lat to match is: " + favLat + " | Long to match is: " + favLong);

		if(table === "playground") {
			var favoriteMarker = new google.maps.Marker({
				position: new google.maps.LatLng(favLat, favLong),
				map:map
			});

			var infoW = new google.maps.InfoWindow();
			if(favoriteMarker !== null) {
				favoriteMarker.addListener('click', function() {
					// Oppdatert infoWindow hos marker (Ø.J)
					infoW.setContent("<h3>Playground:</h3>"+ params);
					infoW.open(map, this);
				});
			}
		}
		else if(table === "toilet") {
			var favoriteMarker = new google.maps.Marker({
				position: new google.maps.LatLng(favLat, favLong),
				map:map
			});

			var infoW = new google.maps.InfoWindow();
			if(favoriteMarker !== null) {
				favoriteMarker.addListener('click', function() {
					// Oppdatert infoWindow hos marker (Ø.J)
					infoW.setContent("<h3>Toilet:</h3>"+ params);
					infoW.open(map, this);
				});
			}
		}

		var nearestListPromise=getJSON(nearestURL);
		nearestListPromise.then(function(value){
			var andreListe = value.entries;
			console.log(andreListe);
			var leastDistance = 10000;
			var leastLat=0;
			var leastLng=0;

			for(i = 0; i< andreListe.length; i++){
				var otherLat = andreListe[i].latitude;
				var otherLong = andreListe[i].longitude;
				console.log(otherLat, otherLong);
				var distance = Math.hypot(favLat - otherLat, favLong - otherLong);
				console.log(distance);
				if (leastDistance >= distance) {
					leastDistance = distance;
					leastLat=otherLat;
					leastLng=otherLong;
					var place = "";
					if (table === "playground"){
						place = andreListe[i].plassering;
						document.getElementById('placeNearest').innerHTML='Nearest toilet is '+ place;

					} else if (table === "toilet"){
						place = andreListe[i].navn;
						document.getElementById('placeNearest').innerHTML='Nearest playground is '+ place;

					}

					console.log('least:',leastDistance);
					console.log(leastLat,leastLng)
				}
			}

			console.log('siste least', leastDistance);
			//markers for nærmeste toalett
			if(table === "playground") {
				var leastDistanceMarker = new google.maps.Marker({
					position: new google.maps.LatLng(leastLat, leastLng),
					map:map
				});
				var infoW = new google.maps.InfoWindow();
				if(leastDistanceMarker !== null) {
					leastDistanceMarker.addListener('click', function() {
					// Oppdatert infoWindow hos marker
					infoW.setContent("<h3>Toilet</h3>" + place);
					infoW.open(map, this);
					});
				}
			}
			else if(table === "toilet") {
				var leastDistanceMarker = new google.maps.Marker({
					position: new google.maps.LatLng(leastLat, leastLng),
					map:map
				});
				var infoW = new google.maps.InfoWindow();
				if(leastDistanceMarker !== null) {
					leastDistanceMarker.addListener('click', function() {
					// Oppdatert infoWindow hos marker
					infoW.setContent("<h3>Playground</h3>" + place);
					infoW.open(map, this);
					});
				}
			}

			//lager en linje mellom favorittlekeplass og nærmeste toalett
			var leastLatLng = {lat:+leastLat  ,lng:+leastLng};
			var favLatLng = {lat:+favLat, lng:+favLong};
			var leastDistanceLine = [leastLatLng,favLatLng];
			var lineBetweenLeastDistance = new google.maps.Polyline({
				path: leastDistanceLine,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 3
			});
			lineBetweenLeastDistance.setMap(map);

			//zommer inn så man ser begge markers midt i bilde
			if(favLat<leastLat && favLong<leastLng){
				var lat_min = favLat;
				var lat_max = leastLat;
				var lng_min = favLong;
				var lng_max = leastLng;
				console.log('fav');
				console.log(favLat, favLong, leastLat, leastLng);
			} else if(leastLat<favLat && leastLng<favLong){
					var lat_min = leastLat;
					var lat_max = favLat;
					var lng_min = leastLng;
					var lng_max = favLong;
					console.log('least');
					console.log(favLat, favLong, leastLat, leastLng);
				} else {
						var senterMap = map.setCenter(new google.maps.LatLng(favLat, favLong));
					}

			map.setCenter(new google.maps.LatLng(
				((lat_max + lat_min) / 2.0),
				((lng_max + lng_min) / 2.0)
			));
			map.fitBounds(new google.maps.LatLngBounds(
				//bottom left
				new google.maps.LatLng(lat_min, lng_min),
				//top right
				new google.maps.LatLng(lat_max, lng_max)
			));
		})
	})
}

function populateTable(searchTable, locationList, tableName) {
	//Bygg en ny tabell
	generateTableHeaders(searchTable, tableName);
	generateTableCells(searchTable, locationList, tableName);
}

function generateSearch(searchType){ //Lag et nytt søkeobjekt fra HTML-data
	var freeInput = document.getElementById('searchInput');
	if (searchType === "toilet"){
		var advSearchInput = document.getElementById('advSearchInput');
		var advInputDate = document.getElementById('advDate');
		var advInputHour = document.getElementById('advHour');
		var advInputMinute = document.getElementById('advMin');
		var advInputOpen = document.getElementById('advOpen');
		var advInputAccess = document.getElementById('advAccess');
		var advInputMaxPrice = document.getElementById('advMaxPrice');
		var advInputFree = document.getElementById('advFree');
		var advInputMale = document.getElementById('advMale');
		var advInputFemale = document.getElementById('advFemale');
		var advInputBaby = document.getElementById('advBaby');
	}

	/*
		Om bruker har valgt tid og dato må vi gjøre dette om til en String-verdi i relevant felt
		Om bruker har valgt "Open now" må vi gjøre dette om til String-verdi i relevant felt
	*/
	if (searchType === "toilet"){
		var qParamOpenEveryday = "";
		var qParamOpenSaturday = "";
		var qParamOpenSunday = "";

		//BRUKERDEFINERT DATO OG TID
		var qParamDate = advInputDate.value;
		var qParamHour = advInputHour.value;
		var qParamMinute = advInputMinute.value;

		if (qParamDate && qParamHour && qParamMinute) {
			var dateStringCollection = qParamDate.split("-");
			var setDate = new Date(dateStringCollection[0], dateStringCollection[1], dateStringCollection[2], qParamHour, qParamMinute);

			var timeBuilder = qParamHour + "." + qParamMinute;

			var day = setDate.getDay();
				switch(day){
					case 0: qParamOpenEveryday = timeBuilder; break;
					case 1: qParamOpenEveryday = timeBuilder; break;
					case 2: qParamOpenEveryday = timeBuilder; break;
					case 3: qParamOpenEveryday = timeBuilder; break;
					case 4: qParamOpenEveryday = timeBuilder; break;
					case 5: qParamOpenSaturday = timeBuilder; break;
					case 6: qParamOpenSunday = timeBuilder; break;
				}
		}

		//NÅVÆRENDE DATO OG TID
		if ((advInputOpen.checked === true) || (freeInputOpen === true)){
			freeInputOpen == false;
			var currentDate = new Date();
			qParamHour = currentDate.getHours();
			qParamMinute = currentDate.getMinutes();

			var timeBuilder = qParamHour + "." + qParamMinute;

			var day = currentDate.getDay();
				switch(day){
					case 0: qParamOpenSunday = timeBuilder; break;
					case 1: qParamOpenEveryday = timeBuilder; break;
					case 2: qParamOpenEveryday = timeBuilder; break;
					case 3: qParamOpenEveryday = timeBuilder; break;
					case 4: qParamOpenEveryday = timeBuilder; break;
					case 5: qParamOpenEveryday = timeBuilder; break;
					case 6: qParamOpenSaturday = timeBuilder; break;
				}
		}

		//HANDICAPTILGANG
		 var qParamAccess = (advInputAccess.checked === true)?"1":"0";

		//MAKSPRIS FOR TOALETT
		if (advInputMaxPrice.value === 0){
			var qParamMaxPrice = "Free";
		} else {
				var qParamMaxPrice = advInputMaxPrice.value;
			}

		//GRATIS TOALETT
		if (advInputFree.checked === true){
			qParamMaxPrice = "Free";
		}

		//Behandle booleanske verdier for enkle ja/nei spørsmål
		var qParamMale = (advInputMale.checked === true)?"1":"0";
		var qParamFemale = (advInputFemale.checked === true)?"1":"0";
		var qParamBaby = (advInputBaby.checked === true)?"1":"0";

	}

	/*
		BEHANDLER FRITEKTSSØK TIL SLUTTEN I TILFELLE OVERSKREVNE VERDIER
	*/

	var qParamFreeSearch = freeInput.value;

	if (searchType == "toilet"){
		if (advSearchInput.value){
			qParamFreeSearch = advSearchInput.value;
		}
	}

	var freeInputOpen = false;
	var freeSearchDefined = false;

	if(qParamFreeSearch && (searchType === "toilet")){
		var inputString = qParamFreeSearch;
		var stringArray = inputString.split(" "); //Del ved space for å se etter andre parametre
		console.log(stringArray);

		//Behandle håndskrevne parametre
		if(stringArray.length >= 1){
			for (i=0; i < stringArray.length; i++){

			var paramRegex = /\w+(?::)\w/;
			var paramArray = stringArray[i].split(":");
			var genderRegex = /(?:kjønn|gender|sex)/i;
			var wheelChairRegex = /(?:wheelchair|rullestol|handicap|hc)/i;
			var openRegex = /(?:open|åpen)/i;
			var babyRegex = /(?:baby|diaper|stellerom)/i;
			var priceRegex = /(?:pris|price|cost)/i;
			var freeRegex = /(?:gratis|free)/i;
			var maleRegex = /(?:man|male|gutt|herre)/i;
			var femaleRegex = /(?:kvinne|woman|female|ladies|frue|dame)/i;
			var positiveRegex = /(?:1|yes|checked|true)/i;
			var numberRegex = /\d\d/;
			console.log(paramArray);

			if(paramRegex.test(stringArray[i])){ //Om søket følger reglene for parametre, loop gjennom arrayet.
				if (genderRegex.test(paramArray[0])){
					if (maleRegex.test(paramArray[1])){
						qParamMale = "1";
						if(!freeSearchDefined){
							qParamFreeSearch = "";
						}
					}
					else if (femaleRegex.test(paramArray[1])){
						qParamFemale = "1";
						if(!freeSearchDefined){
							qParamFreeSearch = "";
						}
					}
				}
				else if (wheelChairRegex.test(paramArray[0])){
					if(positiveRegex.test(paramArray[1])){
						qParamAccess = "1";
						if(!freeSearchDefined){
							qParamFreeSearch = "";
						}
					}
				}
				else if (openRegex.test(paramArray[0])){
					if(positiveRegex.test(paramArray[1])){
						freeInputOpen = true;
						if(!freeSearchDefined){
							qParamFreeSearch = "";
						}
					}
				}
				else if (babyRegex.test(paramArray[0])){
					if(positiveRegex.test(paramArray[1])){
						qParamBaby = "1";
						if(!freeSearchDefined){
							qParamFreeSearch = "";
						}
					}
				}
				else if (priceRegex.test(paramArray[0])){
					if (numberRegex.test(paramArray[1])){
						qParamMaxPrice = paramArray[1];
						if(!freeSearchDefined){
							qParamFreeSearch = "";
						}
					}
				}
				else if (freeRegex.test(paramArray[0])){
					if (positiveRegex.test(paramArray[1])){
						qParamMaxPrice = "Free";
						if(!freeSearchDefined){
							qParamFreeSearch = "";
						}
					}
				}
			}
			else {
				qParamFreeSearch = stringArray[i];
				freeSearchDefined = true;
				}
			}
		}
	}

	//Bygg søkeobjektet
	var generatedQuery = new SearchQuery(qParamMale,
		                                   qParamBaby,
		                                   qParamOpenSunday,
		                                   qParamOpenSaturday,
		                                   qParamOpenEveryday,
		                                   qParamAccess,
		                                   qParamMaxPrice,
		                                   qParamFemale,
																			 qParamFreeSearch);
	query = generatedQuery;
	freeSearchDefined = false; //Endre frisøksverdien tilbake til false for å forberede neste søk

	return query;
}

	/*
		EXECUTE SEARCH FUNCTION
		Dette er søkemotoren vår.
		Tar en full liste og et søkeobjekt, bygger en ny liste med matchende objekter.
	*/
function executeSearch(fullCollection, searchType) {
  var newQuery = generateSearch(searchType);	//Søkeobjektet
	console.log(newQuery);
  var locationCollection = fullCollection; //Den fulle lista
	var results = []; //Den nye resultatslista
	var params = Object.keys(newQuery); //Liste over parameter i søkeobjektet
	var definedParams = [];
	var listSwitcher = false;
	var searchPrice = 0;
	var i = 0;

	//Building list of defined parameters.
	for (i; i < params.length; i++){
		if(newQuery[params[i]] && newQuery[params[i]]!="0"){ //Om parameteret er definert, skal det telles
			console.log("Checking parameter: " + params[i]);
			console.log("Parameter is defined! Parameter value is: " + newQuery[params[i]]);

			if (!definedParams.includes(params[i])){
				definedParams.push(params[i]);
			}
			console.log(definedParams);
		}
	}

	//FREE SEARCH WITH REGEX
	if (definedParams.includes("search")){
		var searchParams = ["plassering", "place", "adresse", "navn", "Besoksadresse"];
		var locationParams = Object.keys(locationCollection[0]);
		var freeSearchArray = newQuery["search"].split("");
		var builtRegString = "";
		var matchString = "";
		var x = 0;

		searchParams = searchParams.filter(param => locationParams.includes(param));

		//Tilrettelegge for internasjonale tastatur
		for (x; x < freeSearchArray.length; x++){
			if (freeSearchArray[x] === "o"){
				builtRegString += "(?:o|ø)";
			}
			else if (freeSearchArray[x] === "a"){
				builtRegString += "(?:a|æ|å)";
			}
			else if (freeSearchArray[x] === "e") {
				builtRegString += "(?:e|æ)";
			} else {
					builtRegString += freeSearchArray[x];
			}
		}

		matchString = new RegExp(builtRegString, "i");

		//Loop gjennom matchende søkeparameter
		if(listSwitcher){
			results = results.filter(result => filterByParam(result, searchParams, matchString));
		} else {
				results = locationCollection.filter(location => filterByParam(location, searchParams, matchString));
				listSwitcher = true;
			}
	}

	//DATE AND TIME SEARCH
	if (definedParams.includes("tid_sondag") || definedParams.includes("tid_lordag") || definedParams.includes("tid_hverdag")){
		if(listSwitcher){
			results = results.filter(result => filterByTime(result, newQuery));
		} else {
			results = locationCollection.filter(location => filterByTime(location, newQuery));
			listSwitcher = true;
		}
	}

	//PRICE SEARCH
	if (definedParams.includes("pris")){
		searchPrice = parseInt(newQuery["pris"]);

		if(listSwitcher){
			results = results.map(result => result["pris"] = parseInt(result["pris"]));
			results = results.filter(result => result["pris"] <= searchPrice);
		} else {
			results = locationCollection.map(result => result["pris"] = parseInt(result["pris"]));
			results = locationCollection.filter(result => result["pris"] <= searchPrice);
			listSwitcher = true;
		}
	}

	//DIAPER CHANGING ROOM SEARCH
	if (definedParams.includes("stellerom")){
		if(listSwitcher){
			results = results.filter(result => result["stellerom"] === newQuery["stellerom"]);
		} else {
			results = locationCollection.filter(location => location["stellerom"] === newQuery["stellerom"]);
			listSwitcher = true;
		}
	}

	//WHEEL CHAIR SEARCH
	if (definedParams.includes("rullestol")){
		if(listSwitcher){
			results = results.filter(result => result["rullestol"] === newQuery["rullestol"]);
		} else {
			results = locationCollection.filter(location => location["rullestol"] === newQuery["rullestol"]);
			listSwitcher = true;
		}
	}

	//MALE ACCESS SEARCH
	if (definedParams.includes("herre")){
		if(listSwitcher){
			results = results.filter(result => result["herre"] === newQuery["herre"]);
		} else {
			results = locationCollection.filter(location => location["herre"] === newQuery["herre"]);
			listSwitcher = true;
		}
	}

	//FEMALE ACCESS SEARCH
	if (definedParams.includes("dame")){
		if(listSwitcher){
			results = results.filter(result => result["dame"] === newQuery["dame"]);
		} else {
			results = locationCollection.filter(location => location["dame"] === newQuery["dame"]);
			listSwitcher = true;
		}
	}
	/**
		*	Function for filtering time of day.
		*/
	function filterByTime (listEntry, searchQuery){
		var targetDay = "";
		if(searchQuery["tid_hverdag"]){
			targetDay = "tid_hverdag";
		} else if (searchQuery["tid_lordag"]){
			targetDay = "tid_lordag";
		} else if (searchQuery["tid_sondag"]){
			targetDay = "tid_sondag";
		}

		if((listEntry[targetDay]) === "ALL"){
			return true;
		} else {
			var timeSplit = listEntry[targetDay].split(" - ");
			var openingTime = timeSplit[0].split(".");
			var closingTime = timeSplit[1].split(".");
			var requestedTime = searchQuery[targetDay].split(".");

			if ((openingTime[0] < requestedTime[0]) && (requestedTime[0] < closingTime[0])){
				return true;
			}
			else if (openingTime[0] === requestedTime[0]){
				if(openingTime[1] < requestedTime[1]){
					return true;
				}
				else if (requestedTime[0] === closingTime[0]){
					if(requestedTime[1] < closingTime[1]){
						return true;
					}
				}
			}
		}
	}

	function filterByParam(listEntry, paramList, regex){
		var z = 0;
		for(z; z < paramList.length; z++){
			if(regex.test(listEntry[paramList[z]])){
				return true;
			}
		}
	}

	if (listSwitcher){
		console.log("Returning new list");
		return results;
	} else {
		console.log("Returning full list");
		return locationCollection;
	}

	listSwitcher = false; //Change the switcher back to false after completed search.
}


/**
 * Funksjon for å laste inn kart.
**/
function initMap() {
	var bergen = {lat: 60.391, lng: 5.324};
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 14,
		center: bergen
	});
}

/*
 * Function for generation a list of markers
 * When all markers are made with the appropriate data, it is pushed in
 * to the markers array (markers array is a gloabl variable).
 * This way each marker can be set to a map with the setMap function.
	*/
function generateAndPushMarkers(locationList, tableName) {
	for (i = 0; i < locationList.length; i++) {
		if(tableName === "toilet") {
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(locationList[i].latitude, locationList[i].longitude),
				label: locationList[i].id,
				placement: locationList[i].plassering,
				address: locationList[i].adresse,
				ladies: (locationList[i].dame === "1")?"Yes":"No",
				gentlemen: (locationList[i].herre === "1")?"Yes":"No",
				price: locationList[i].pris,
				wheelchair: (locationList[i].rullestol === "1")?"Yes":"No",
				weekday: locationList[i].tid_hverdag,
				saturday: locationList[i].tid_lordag,
				sunday: locationList[i].tid_sondag,
				animation: google.maps.Animation.DROP,
			});
		}
		if(tableName === "playground") {
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(locationList[i].latitude, locationList[i].longitude),
				label: locationList[i].id,
				name: locationList[i].navn,
			});
		}
		if(tableName === "kindergarden") {
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(locationList[i].Breddegrad, locationList[i].Lengdegrad),
				label: locationList[i].id.toString(),
				name: locationList[i].FulltNavn,
				locName: locationList[i].BesoksAdresse,
				phone: locationList[i].Telefon,
				mail: locationList[i].Epost,
			});
		}
		markers.push(marker);
	}
}


/*
 * Function for generating information windows for each marker
 * Param: array of markers
 * The setContent method used 'this' (a marker instance) and its attribute
 * value to fill the iWindow with value
*/
function generateInfoWindow(tableName, locationEntries) {
	for(i = 0; i < locationEntries; i++) {
		console.log("This is tableName: " + tableName);
		if(tableName === "toilet") {
			var infoW = new google.maps.InfoWindow();
			if(markers[i] !== null) {
				markers[i].addListener('click', function() {
					// Oppdatert infoWindow hos marker (Ø.J)
					infoW.setContent(
							"<h3>This Toilet</h3>" +
							"<b>Placement:</b> " + this.placement + "<br>" +
							"<b>Address:</b> " + this.address + "<br>" +
							"<b>Ladies:</b> " + this.ladies + "<br>" +
							"<b>Gentlemen:</b> " + this.gentlemen + "<br>" +
							"<b>Price:</b> " + this.price + " ,-" + "<br>" +
							"<b>Wheelchair:</b> " + this.wheelchair + "<br>" +
							" " + "<br>" +
							"<h3>Availability</h3> " +
							"<b>Weekday:</b> " + this.weekday + "<br>" +
							"<b>Saturday:</b> " + this.saturday + "<br>" +
							"<b>Sunday:</b> " + this.sunday);
					infoW.open(map, this);
				});
			}
		}
		if(tableName === "playground") {
			var infoW = new google.maps.InfoWindow();
			if(markers[i] !== null) {
				markers[i].addListener('click', function() {
					// Oppdatert infoWindow hos marker
					infoW.setContent(
							"<h3>This Playground</h3>" +
							"<b>Placement:</b> " + this.name);
					infoW.open(map, this);
				});
			}
		}
		if(tableName === "kindergarden") {
			var infoW = new google.maps.InfoWindow();
			if(markers[i] !== null) {
				markers[i].addListener('click', function() {
					// Oppdatert infoWindow hos marker
					infoW.setContent(
							"<h3>This Kindergarden</h3>" +
							"<b>Kindergarden:</b> " + this.name + "<br>" +
							"<b>Adresse:</b> " + this.locName + "<br>" +
							"<b>Telephone:</b> " + this.phone + "<br>" +
							"<b>Email:</b> " + this.mail);
					infoW.open(map, this);
				});
			}
		}
	}
}
/*
 * Function for deleting all markers on the map
 * This is mainly used for refreshing the map with new markers when
 * someone makes a search.
*/
function deleteMarkers() {
	for(i = 0; i < markers.length; i++) {
		if(markers[i] !== null) {
			markers[i].setMap(null);
			markers[i] = null;
		}
	}
	markers = [];
}
