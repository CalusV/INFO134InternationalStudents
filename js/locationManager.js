// All global variables
var locationList;
var locationEntries;
var query;
var map = "";
var markers = [];

var toiletURL = "https://hotell.difi.no/api/json/bergen/dokart?";
var playgroundURL = "https://hotell.difi.no/api/json/bergen/lekeplasser?";

/*
		KODEDEL FRA Roy

		loadTable() = Laster en ny liste med toaletter fra JSON-filen. Kan knyttes til API om nødvendig.
			* DET ER DENNE VI PUTTER INN I HTML

		SearchQuery() = PROTOTYPEN for query-objekter som brukes til å søke.
						- herre[BOOLEAN] om toalettet har fasiliteter for menn
						- stellerom[BOOLEAN] om toalettet har stellerom for baby
						- tid_sondag[STRING] Klokkeslett for om man skal på toalettet en søndag
						- tid_lordag[STRING]  Klokkeslett for om man skal på toalettet en lørdag
						- tid_hverdag[STRING]  Klokkeslett for om man skal på toalettet en hverdag
						- rullestol[BOOLEAN] Enkel boolean for om toalettet har handicaptilgang
						- pris[NUMBER] Tallverdi for makspris i NOK
						- dame[BOOLEAN] om toalettet har fasiliteter for kvinner
						- search[STRING] er fritekstsøket som kan brukes med regex

		clearTable() = Brukes til å tømme et table, slik at det ikke holder på gamle søk om man søker flere ganger uten å refreshe siden.
		populateTable() = Brukes til å generere listene over toaletter.
		generateSearch() = Lager et searchQuery-objekt basert på data fra HTML-skjema.
		executeSearch() = Genererer en mindre liste avhengig av søkekriterier.
	*/

	/*
	  JSON parse
	*/
	function loadTable(url) {
		console.log("Loading table");
	  var xmlhttp = new XMLHttpRequest();
	  xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {

					if(locationList !== undefined) {
						deleteMarkers();
					}

	      var myObj = JSON.parse(this.responseText);
	      var searchTable = document.getElementById("searchTable");
				var isToiletRegex = /dokart/;
				var isToiletSearch = isToiletRegex.test(url);
				console.log(url);
				console.log(isToiletRegex.test(url));
				var searchType = (isToiletSearch === true)?"toilet":"playground";

				console.log("Updating table from search.");
	      locationList = executeSearch(myObj.entries, searchType);
				console.log(locationList);
	      locationEntries = locationList.length;

	      clearTable(searchTable); // Denne var tidligere searchTable
	      populateTable(searchType);
				// setTimeout på 0,2sekunder. Dette er en sikkerhet for at locationList er ferdig lastet ned fra difi.no før vi prøver å hente data fra objektet.
	//			setTimeout(function() {
					generateAndReturnMarkers();
					for(i = 0; i < markers.length; i++) {
						if(markers[i] !==  null) {
							markers[i].setMap(map);
						}
					}
					generateInfoWindow(markers, searchType);
		//		}, 200);
			}
	  };
	  xmlhttp.open("GET", url, true);
	  xmlhttp.send();
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

	function clearTable(table) { //Tøm tabellen fra søk til søk
	  var tableHeaderRowCount = 1;
	  var clearingTable = table;

	    var rowCount = clearingTable.rows.length;
	    for (var i=tableHeaderRowCount; i < rowCount; i++){
	      searchTable.deleteRow(tableHeaderRowCount);
	    }
	}

	function populateTable(search) {
	  //Bygg en ny tabell
	  for (i = 0; i < locationEntries; i++) {
	    var newRow = searchTable.insertRow(i+1);
	    var firstCell = newRow.insertCell(0);
	    var locCell = newRow.insertCell(1);
	    var adrCell = newRow.insertCell(2);
	    var wDayCell = newRow.insertCell(3);
	    var satCell = newRow.insertCell(4);
	    var sunCell = newRow.insertCell(5);
	    var genderCell = newRow.insertCell(6);
	    var wChairCell = newRow.insertCell(7);
	    var babyCell = newRow.insertCell(8);
	    var priceCell = newRow.insertCell(9);

			/**
			 * These lines concernes Media Queries
			 * Add id attribute for cell 1 and 2. This is used for
			 * media queries in css when on smaller screens we only want
			 * to show the two to four first cells in every row.
			**/
			firstCell.setAttribute("id", "cell1");
			locCell.setAttribute("id", "cell2");
			adrCell.setAttribute("id", "cell3");
			wDayCell.setAttribute("id", "cell4");

	    //ID for hvert objekt
	    firstCell.innerHTML = locationList[i].id + ".";

	    //Lokasjon
	    locCell.innerHTML = locationList[i].place;
	    adrCell.innerHTML = locationList[i].adresse;

	    //Åpningstider
	    wDayCell.innerHTML = locationList[i].tid_hverdag;

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

	  }
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
		  var qParamMaxPrice = advInputMaxPrice.value;

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
					var maleRegex = /(?:mann|male|gutt|herre)/i;
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
		console.log(query);
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
	  var locationCollection = fullCollection; //Den fulle lista
		var results = []; //Den nye resultatslista
		var params = Object.keys(newQuery); //Liste over parameter i søkeobjektet
		var searchOccurred = false; //Booleansk verdi for å se om et søk er gjort eller ikke, i tilfelle listen lastes uten et søk.

		for (i=0; i< locationCollection.length; i++){
			var definedParameters = 0; //Teller for definerte parametre
			var matchingParameters = 0; //Teller for matchende parametre
			console.log("Checking toilet #" + (i+1));
			for (x=0; x < params.length; x++) {
				if(newQuery[params[x]] != (undefined || false)){ //Om parameteret er definert, skal det telles
					definedParameters++;
					searchOccurred = true;
					console.log("Collection parameter: " + locationCollection[i][params[x]] + " is being compared to search parameter: " + newQuery[params[x]]);

					/*
					FRITEKSTSSØK MED REGEX
					*/
					if(newQuery[params[x]] === newQuery["search"]){
						//Må tilrettelegge for ikke-norske tastatur
						var freeSearchArray = newQuery["search"].split("");
						var builtRegString = "";
						for (y=0; y < freeSearchArray.length; y++){
							if (freeSearchArray[y] === "o"){
								builtRegString += "(?:o|ø)";
							} else if (freeSearchArray[y] === "a"){
								builtRegString += "(?:a|æ|å)";
							} else if (freeSearchArray[y] === "e") {
								builtRegString += "(?:e|æ)";
							} else {
								builtRegString += freeSearchArray[y];
							}
						}

						var matchString = new RegExp(builtRegString, "i");
						if(matchString.test(locationCollection[i]["plassering"]) || matchString.test(locationCollection[i]["place"]) || matchString.test(locationCollection[i]["adresse"])){
							matchingParameters++;
						}
					}
					/*
					 	Behandle tid og dato
					*/

					if((newQuery[params[x]] === (newQuery["tid_hverdag"]||newQuery["tid_lordag"]||newQuery["tid_sondag"])) && (locationCollection[i]["tid_hverdag"]||locationCollection[i]["tid_hverdag"]||locationCollection[i]["tid_hverdag"]) === "ALL"){
						matchingParameters++;
					}

					else if(((newQuery[params[x]] === newQuery["tid_hverdag"]) && locationCollection[i]["tid_hverdag"]) && (locationCollection[i]["tid_hverdag"] != "ALL")){ //If we're investigating opening times on a weekday
						var weekdayTimeSplit = locationCollection[i]["tid_hverdag"].split(" - ");
						var openingTime = weekdayTimeSplit[0].split(".");
						var closingTime = weekdayTimeSplit[1].split(".");
						var requestedTime = newQuery["tid_hverdag"].split(".");

						if ((openingTime[0] < requestedTime[0]) && (requestedTime[0] < closingTime[0])){
							matchingParameters++;
						} else if (openingTime[0] === requestedTime[0]){
							if(openingTime[1] < requestedTime[1]){
								matchingParameters++;
							} else if (requestedTime[0] === closingTime[0]){
								if(requestedTime[1] < closingTime[1]){
									matchingParameters++;
								}
							}
						}
					}

					else if(((newQuery[params[x]] === newQuery["tid_lordag"]) && locationCollection[i]["tid_lordag"]) && (locationCollection[i]["tid_lordag"] != "ALL")){ //If we're investigating opening times on a saturday
						var saturdayTimeSplit = locationCollection[i]["tid_lordag"].split(" - ");
						var openingTime = saturdayTimeSplit[0].split(".");

						if (saturdayTimeSplit[1]){
							var closingTime = saturdayTimeSplit[1].split(".");
						}

						var requestedTime = newQuery["tid_lordag"].split(".");

						if ((openingTime[0] < requestedTime[0]) && (requestedTime[0] < closingTime[0])){
							matchingParameters++;
						} else if (openingTime[0] === requestedTime[0]){
							if(openingTime[1] < requestedTime[1]){
								matchingParameters++;
							} else if (requestedTime[0] === closingTime[0]){
									if(requestedTime[1] < closingTime[1]){
										matchingParameters++;
									}
								}
							}
					}

					else if(((newQuery[params[x]] === newQuery["tid_sondag"]) && locationCollection[i]["tid_sondag"]) && (locationCollection[i]["tid_sondag"] != "ALL")){ //If we're investigating opening times on a sunday
						var sundayTimeSplit = locationCollection[i]["tid_sondag"].split(" - ");
						var openingTime = sundayTimeSplit[0].split(".");

						if (sundayTimeSplit[1]){
							var closingTime = sundayTimeSplit[1].split(".");
						}

						var requestedTime = newQuery["tid_sondag"].split(".");

						if ((openingTime[0] < requestedTime[0]) && (requestedTime[0] < closingTime[0])){
							matchingParameters++;
						} else if (openingTime[0] === requestedTime[0]){
							if(openingTime[1] < requestedTime[1]){
								matchingParameters++;
							} else if (requestedTime[0] === closingTime[0]){
								if(requestedTime[1] < closingTime[1]){
									matchingParameters++;
								}
							}
						}
					}

					//Sett til sann verdi også dersom satt pris er mindre enn ønsket pris.
					if(((newQuery[params[x]] === newQuery["pris"]) > locationCollection[i]["pris"]) && (newQuery["pris"] != "Free")){
						matchingParameters++;
					} else if (((newQuery[params[x]] === newQuery["pris"]) === 0) && (locationCollection[i]["pris"] == "0")){
						matchingParameters++;
					} else if (((newQuery[params[x]] === newQuery["pris"]) === "Free") && (locationCollection[i]["pris"] === "0")){
						matchingParameters++;
					}

					/*
						SAMMENLIGN ALLE VERDIER SOM IKKE ALLEREDE ER DEFINERT
					*/
					if((locationCollection[i][params[x]] === newQuery[params[x]]) && (locationCollection[i][params[x]] != "NULL")){ //Om parameter samsvarer med søk, tell
						matchingParameters++;
					}
				}
			}
			console.log("Defined: " + definedParameters + "| Matching: " + matchingParameters);
			if ((definedParameters === matchingParameters) && definedParameters != 0){ //Om tellerne har like mange verdier
				results.push(locationCollection[i]); //Legg til objektet i den nye lista
			}
		}

		if (searchOccurred){ //Om et søk har forekommet(Booleansk verdi)
			console.log("Returning new list");
			searchOccurred = false;
			return results; //Returner den nye listen, selv om den er tom.

		}
		else { // Ellers kan den fulle listen returneres.
			console.log("Returning full list");
			return locationCollection;
		}
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
	function generateAndReturnMarkers() {
		for (i = 0; i < locationList.length; i++) {
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
			});
			markers.push(marker);
	}
}

/*
 * Function for generating information windows for each marker
 * Param: array of markers
 * The setContent method used 'this' (a marker instance) and its attribute
 * value to fill the iWindow with value
*/
function generateInfoWindow(marker, searchType) {
	for(i = 0; i < locationList.length; i++) {
		var infoW = new google.maps.InfoWindow();
		if(markers[i] !== null) {
			marker[i].addListener('click', function() {
				// Oppdatert infoWindow hos marker (Ø.J)
				infoW.setContent("<h3>This Toilet</h3>" +
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
}

/*
 * Function for deleting all markers on the map
 * This is mainly used for refreshing the map with new markers when
 * someone makes a search. (Ø.j)
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
