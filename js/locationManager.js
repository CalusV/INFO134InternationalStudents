// All global variables
var locationList;
var locationEntries;
var query;
var map = "";
var markers = [];
var tableName = "";

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
function loadTable(tableName) {
		console.log("Loading table");
		var url = "";
		if(tableName === "toilet") {
			url = "https://hotell.difi.no/api/json/bergen/dokart?";
		}
		else if(tableName === "playground") {
			url = "https://hotell.difi.no/api/json/bergen/lekeplasser?";
		}
		else if(tableName === "kindergarden") {
			url = "https://data-nbr.udir.no/enheter/kommune/1201";
		}
	  var xmlhttp = new XMLHttpRequest();
	  xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {

					if(locationList !== undefined) {
						deleteMarkers();
					}

	      var myObj = JSON.parse(this.responseText);
	      var searchTable = document.getElementById("searchTable");

				console.log("Updating table from search.");
				if(tableName === "kindergarden") {
					// This adds an ID attribute to each element in the kindergarden list
					for(i = 0; i < myObj.length; i++) {
						myObj[i].id = i + 1;
					}
					locationList = executeSearch(myObj, tableName);
				}
				else {
					locationList = executeSearch(myObj.entries, tableName);
				}
	      locationEntries = locationList.length;

	      clearTable(searchTable); // Denne var tidligere searchTable
	      populateTable(tableName);
					generateAndPushMarkers(tableName);
					for(i = 0; i < markers.length; i++) {
						if(markers[i] !==  null) {
							console.log("setting map on markers");
							markers[i].setMap(map);
						}
					}
					generateInfoWindow(markers, tableName);
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
				cell.setAttribute("onclick","startSort(this)");
			}
		}
		else if(tableName === "playground") {
			var playgroundAttributeNames = ["Index", "Location", "Mark Favorites"];
			var headerRow = searchTable.insertRow(0);
			for(i = 0; i < 3; i++) {
				var cell = headerRow.insertCell(i);
				cell.innerHTML = playgroundAttributeNames[i];
				cell.setAttribute("id", "th-" + (i+1));
				cell.setAttribute("onclick","startSort(this)");
			}
		}
		else if(tableName === "kindergarden") {
			var kindergardenAttributeNames = ["Index", "Location", "Adresse", "Email", "Kindergarden name", "Telephone"];
			var headerRow = searchTable.insertRow(0);
			for(i = 0; i < 6; i++) {
				var cell = headerRow.insertCell(i);
				cell.innerHTML = kindergardenAttributeNames[i];
				cell.setAttribute("id", "th-" + (i+1));
				cell.setAttribute("onclick","startSort(this)");
			}
		}
	}

/**
 * By clicking on a cell index the map will zoom and center at the marker position
**/
function filterByIndex(obj, tableName){
		window.scrollTo(0, 100);
		map.setZoom(14);
		setTimeout(function() {
			var index = obj.innerHTML;
			index = index.replace(".", "");
			for(i = 0; i < locationList.length; i++) {
				if(locationList[i].id.toString() === index) {
					console.log("Found match: " + (locationList[i].id.toString() === index));
					if(tableName === "kindergarden") {
						map.setCenter(new google.maps.LatLng(locationList[i].Breddegrad, locationList[i].Lengdegrad));
					}
					else {
						map.setCenter(new google.maps.LatLng(locationList[i].latitude, locationList[i].longitude));
					}
					map.setZoom(17);
				}
		}}, 1000)
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
						// console.log("Pushed to right: ", rows[i].childNodes[0].innerHTML + " | " + rows[i].childNodes[rowChildNode].innerHTML);
					}
				}
			}
			return newRowList.concat(sortTableAlfabetical(left, headerElement), pivot, sortTableAlfabetical(right, headerElement));
		}
}

function generateTableCells(searchTable, tableName) {
		if(tableName === "toilet") {
			for (i = 0; i < locationEntries; i++) {
				var newRow = searchTable.insertRow(i+1);
				var firstCell = newRow.insertCell(0);
				firstCell.setAttribute("id", "cell1");
				firstCell.setAttribute("onclick", "filterByIndex(this, 'toilet')");
				var locCell = newRow.insertCell(1);
				locCell.setAttribute("id", "cell2");
				var adrCell = newRow.insertCell(2);
				adrCell.setAttribute("id", "cell3");
				var wDayCell = newRow.insertCell(3);
				wDayCell.setAttribute("id", "cell4");
				var satCell = newRow.insertCell(4);
				satCell.setAttribute("id", "cell5");
				var sunCell = newRow.insertCell(5);
				sunCell.setAttribute("id", "cell6");
				var genderCell = newRow.insertCell(6);
				genderCell.setAttribute("id", "cell7");
				var wChairCell = newRow.insertCell(7);
				wChairCell.setAttribute("id", "cell8");
				var babyCell = newRow.insertCell(8);
				babyCell.setAttribute("id", "cell9");
				var priceCell = newRow.insertCell(9);
				priceCell.setAttribute("id", "cell10");
				var favLocal = newRow.insertCell(10);
				favLocal.setAttribute("id", "cell11");

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
					favButton.addEventListener ("click", function() {
	  				alert("did something");
					});
			}
		}
		else if (tableName === "playground") {
			for (i = 0; i < locationEntries; i++) {
				var newRow = searchTable.insertRow(i+1);
				var firstCell = newRow.insertCell(0);
				firstCell.setAttribute("id", "cell1");
				firstCell.setAttribute("onclick", "filterByIndex(this, 'playground')");
				var locCell = newRow.insertCell(1);
				locCell.setAttribute("id", "cell2");
				var favLocal = newRow.insertCell(2);
				favLocal.setAttribute("id", "cell3");

				// Cell value
				firstCell.innerHTML = locationList[i].id + ".";
				locCell.innerHTML = locationList[i].navn;
			}
		}
		else if (tableName === "kindergarden") {
			for (i = 0; i < (locationEntries); i++) {
				var newRow = searchTable.insertRow(i+1);
				var firstCell = newRow.insertCell(0);
				firstCell.setAttribute("id", "cell1");
				firstCell.setAttribute("onclick", "filterByIndex(this, 'kindergarden')");
				var locCell = newRow.insertCell(1);
				locCell.setAttribute("id", "cell2");
				var adrCell = newRow.insertCell(2);
				adrCell.setAttribute("id", "cell3");
				var emailCell = newRow.insertCell(3);
				emailCell.setAttribute("id", "cell4");
				var fullName = newRow.insertCell(4);
				fullName.setAttribute("id", "cell5");
				var phoneCell = newRow.insertCell(5);
				phoneCell.setAttribute("id", "cell6");

				// Cell value
				var locationName = locationList[i].BesoksAdresse.split(",");
				firstCell.innerHTML = locationList[i].id + ".";
				locCell.innerHTML = locationName[0];
				adrCell.innerHTML = locationName[1];
				emailCell.innerHTML = locationList[i].Epost;
				fullName.innerHTML = locationList[i].FulltNavn;
				phoneCell.innerHTML = locationList[i].Telefon;
			}
		}
	}

function populateTable(search) {
	//Bygg en ny tabell
	generateTableHeaders(searchTable, search);
	generateTableCells(searchTable, search);
}

function generateSearch(tableName){ //Lag et nytt søkeobjekt fra HTML-data
	  var freeInput = document.getElementById('searchInput');
		if (tableName === "toilet"){
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
		if (tableName === "toilet"){
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

		if (tableName == "toilet"){
			if (advSearchInput.value){
				qParamFreeSearch = advSearchInput.value;
			}
		}

		var freeInputOpen = false;
		var freeSearchDefined = false;

		if(qParamFreeSearch && (tableName === "toilet")){
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
	function executeSearch(fullCollection, tableName) {
	  var newQuery = generateSearch(tableName);	//Søkeobjektet
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
						if(matchString.test(locationCollection[i]["BesoksAdresse"]) || matchString.test(locationCollection[i]["plassering"]) || matchString.test(locationCollection[i]["place"]) || matchString.test(locationCollection[i]["adresse"])|| matchString.test(locationCollection[i]["navn"])){
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

					/*
						Behandle priser
					*/
					console.log()

					if(((newQuery[params[x]] === newQuery["pris"]) > locationCollection[i]["pris"]) && (newQuery["pris"] != "Free")){
						matchingParameters++;
					} else if (((newQuery[params[x]] === newQuery["pris"]) && (newQuery["pris"] === "Free") && (locationCollection[i]["pris"] === "0"))){
						matchingParameters++;
					}
				}

				/*
					SAMMENLIGN ALLE VERDIER SOM IKKE ALLEREDE ER DEFINERT
				*/
				if((locationCollection[i][params[x]] === newQuery[params[x]]) && (locationCollection[i][params[x]] != "NULL")){ //Om parameter samsvarer med søk, tell
					matchingParameters++;
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
	function generateAndPushMarkers(tableName) {
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
function generateInfoWindow(marker, tableName) {
	for(i = 0; i < locationEntries; i++) {
		console.log("This is tableName: " + tableName);
		if(tableName === "toilet") {
			var infoW = new google.maps.InfoWindow();
			if(markers[i] !== null) {
				marker[i].addListener('click', function() {
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
				marker[i].addListener('click', function() {
					// Oppdatert infoWindow hos marker (Ø.J)
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
				marker[i].addListener('click', function() {
					// Oppdatert infoWindow hos marker (Ø.J)
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
