
// All global variables
var doKart;
var toiletEntries;
var query;
var map = "";
var markers = [];

// Laster inn fullTable slik at var doKart har verdi som markørene kan utnytte til å hente nødvendig data
loadTable();

/*
		KODEDEL FRA Roy

		loadTable() = Laster en ny liste med toaletter fra JSON-filen. Kan knyttes til API om nødvendig.
			* DET ER DENNE VI PUTTER INN I HTML

		searchQuery() = PROTOTYPEN for query-objekter som brukes til å søke.
						- searchString[STRING] er fritekstsøket som kan brukes med rege
						- toiletName[STRING] er toalettets navn på listen. Kan brukes med regex og fritekst.
						- toiletAddress[STRING] er toalettets adresse, kan brukes med regex og fritekst.
						- toiletDate[DATE(dd.mm.yyyy)] dato der man ønsker å gå på toalettet. Kan fjernes om vi ikke har tid.
												> Om vi skal fjerne dato må vi legge til "dag" som i ukedag istedet.
						- toiletHour[NUMBER(0-23)] Klokkeslett som kan sjekkes mot åpningstidene.
						- toiletMinute[NUMBER(0-59)] Minuttviser på klokkeslett.
						- toiletOpenNow[BOOLEAN] Enkel boolean for å se om toalettet er åpent nå.
											> Kan bli vanskelig å implementere.
						- toiletAccess[BOOLEAN] Enkel boolean for om toalettet har handicaptilgang
						- toiletMaxPrice[NUMBER] Tallverdi for makspris i NOK
						- toiletFREE[BOOLEAN] Enkel boolean for om toalettet er gratis eller ikke
						- toiletMale[BOOLEAN] om toalettet har fasiliteter for menn
						- toiletFemale[BOOLEAN] om toalettet har fasiliteter for kvinner
						- toiletBaby[BOOLEAN] om toalettet har stellerom for baby
		clearTable() = Brukes til å tømme et table, slik at det ikke holder på gamle søk om man søker flere ganger uten å refreshe siden.
		populateTable() = Brukes til å generere listene over toaletter.
		generateSearch() = Lager et searchQuery-objekt basert på data fra HTML-skjema.
		UFERDIG - executeSearch() = Genererer en mindre liste avhengig av søkekriterier.
	*/

	/*
	  JSON parse
	*/
	// Parse the JSON-file
	function loadTable() {
		console.log("Loading table");
	  var xmlhttp = new XMLHttpRequest();
		var url = "https://hotell.difi.no/api/json/bergen/dokart?";
	  xmlhttp.onreadystatechange = function() {
	      if (this.readyState == 4 && this.status == 200) {
					if(doKart !== undefined) {
						deleteMarkers();
					}

	      var myObj = JSON.parse(this.responseText);
	      var searchTable = document.getElementById("searchTable");

				console.log("Updating table from search.");
	      doKart = executeSearch(myObj.entries);
				console.log(doKart);
	      toiletEntries = doKart.length;

	            clearTable(searchTable); // Denne var tidligere searchTable
	            populateTable();
							generateAndReturnMarkers();
							for(i = 0; i < markers.length; i++) {
								if(markers[i] !==  null) {
									markers[i].setMap(map);
								}
							}
							generateInfoWindow(markers);
						}
	  };
	  xmlhttp.open("GET", url, true);
	  xmlhttp.send();
	}
	/*
	    SEARCH QUERY FUNCTIONALITY
	*/
	//Build a constructor object for a search query
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

	/*
	  FULL TABLE LIST FUNCTIONALITY
	    Populates a table from the gathered collection.
	    Some table values are mapped to other values depending on content.
	*/
	function clearTable(table) {
	  var tableHeaderRowCount = 1;
	  var clearingTable = table;

	  //If table is already built, delete table and rebuild.
	    var rowCount = clearingTable.rows.length;
	    for (var i=tableHeaderRowCount; i < rowCount; i++){
	      searchTable.deleteRow(tableHeaderRowCount);
	    }
	}

	function populateTable() {
	  //Construct new table
	  for (i = 0; i < toiletEntries; i++) {
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

	    //Unique identifier
	    firstCell.innerHTML = doKart[i].id + ".";

	    //Location
	    locCell.innerHTML = doKart[i].place;
	    adrCell.innerHTML = doKart[i].adresse;

	    //Opening times
	    wDayCell.innerHTML = doKart[i].tid_hverdag;

	    if (doKart[i].tid_lordag == "NULL"){
	      satCell.innerHTML = "Closed";
	    } else {
	      satCell.innerHTML = doKart[i].tid_lordag;
	    }

	    if (doKart[i].tid_sondag == "NULL"){
	      sunCell.innerHTML = "Closed";
	    } else {
	      sunCell.innerHTML = doKart[i].tid_sondag;
	    }

	    //Gender availability
	    var genderString = "";
	    if (doKart[i].herre == "1") {
	      genderString += "M";
	    }
	    if (doKart[i].dame == "1"){
	      genderString += "F";
	    }
	    if (doKart[i].herre != "1" || doKart[i].dame != "1") {
	      genderString += "NA";
	    }

	    genderCell.innerHTML = genderString;

	    //Wheelchair-accessibility
	    if (doKart[i].rullestol == "1") {
	      wChairCell.innerHTML = "Yes";
	    } else {
	      wChairCell.innerHTML = "No";
	    }

	    //Changing room for baby
	    if (doKart[i].stellerom == "1") {
	      babyCell.innerHTML = "Yes";
	    } else {
	      babyCell.innerHTML = "No";
	    }

	    //Price
	    if (doKart[i].pris == 0){
	      priceCell.innerHTML = "FREE";
	    }

	    else if (doKart[i].pris == "NULL"){
	      priceCell.innerHTML = "Unknown";
	    } else {
	      priceCell.innerHTML = doKart[i].pris + "Kr";
	    }

	  }
	}

	function generateSearch(){
	  var freeInput = document.getElementById('searchInput');
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

		/*
				If the user has selected a time and date, we will process this into usable variables.
				If the user has selected "open now?" we take the current date and time to process that.
		*/
			var qParamOpenEveryday = "";
			var qParamOpenSaturday = "";
			var qParamOpenSunday = "";

			//USER DEFINED DATE AND TIME
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

			//CURRENT DATE AND TIME
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


		//HANDICAP ACCESS
	  var qParamAccess = (advInputAccess.checked === true)?"1":"0";

		//MAX PRICE FOR TOILET USE
	  var qParamMaxPrice = advInputMaxPrice.value;

		//FREE TOILET?
		if (advInputFree.checked === true){
			qParamMaxPrice = "Free";
		}

		//Process boolean true/false values into binary values for comparison.
	  var qParamMale = (advInputMale.checked === true)?"1":"0";
	  var qParamFemale = (advInputFemale.checked === true)?"1":"0";
	  var qParamBaby = (advInputBaby.checked === true)?"1":"0";

		/*
			HANDLING FREE SEARCH LAST AS IT MIGHT OVERWRITE OTHER VALUES
		*/

		var qParamFreeSearch = freeInput.value;

		if (advSearchInput.value){
			qParamFreeSearch = advSearchInput.value;
		}
		var freeInputOpen = false;
		var freeSearchDefined = false;

		if(qParamFreeSearch){
			var inputString = qParamFreeSearch;
			var stringArray = inputString.split(" "); //Splitting at space to check for other written parameters
			console.log(stringArray);

			//HANDLING ANY HANDWRITTEN PARAMETERS
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

					if(paramRegex.test(stringArray[i])){ //If the search follows rule of parameters, run through checks
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

		//Generate the query
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
		freeSearchDefined = false; //Swap the free search toggle back for the next search

		return query;
	}

	/*
		EXECUTE SEARCH FUNCTION
		This is our search engine
		It takes the full list and the search object, and starts picking it apart to find matching objects.
	*/
	function executeSearch(fullCollection) {
	  var newQuery = generateSearch();	//The search object
	  var toiletCollection = fullCollection; //The full toilet list
		var results = []; //Our new result list
		var params = Object.keys(newQuery); //List of parameters in the search object
		var searchOccurred = false; //Boolean to check if a search has happened or not, used for markers.

		for (i=0; i< toiletCollection.length; i++){ //For each object in the toilet list
			var definedParameters = 0; //Define a counter for defined parameters
			var matchingParameters = 0; //Define a counter for matching parameters
			console.log("Checking toilet #" + (i+1));
			for (x=0; x < params.length; x++) { // For each parameter in the object
				if(newQuery[params[x]] != (undefined || false)){ //If the parameter is not undefined, false, or null
					definedParameters++; //Add +1 to the defined counter
					searchOccurred = true;
					console.log("Collection parameter: " + toiletCollection[i][params[x]] + " is being compared to search parameter: " + newQuery[params[x]]);

					/*FREETEXT SEARCH WITH REGEX.
							Any word not preceded by a : will be interpreted as free text search
					*/
					if(newQuery[params[x]] === newQuery["search"]){
						//ALLOWING SINGLE LETTER VOWELS TO BE SWAPPED FOR SCANDIANVIAN ONES
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
						if(matchString.test(toiletCollection[i]["plassering"]) || matchString.test(toiletCollection[i]["place"]) || matchString.test(toiletCollection[i]["adresse"])){
							matchingParameters++;
						}
					}
					/*
					 	HANDLING DATES AND TIMES IN THE SEARCH ENGINE
					*/

					if((newQuery[params[x]] === (newQuery["tid_hverdag"]||newQuery["tid_lordag"]||newQuery["tid_sondag"])) && (toiletCollection[i]["tid_hverdag"]||toiletCollection[i]["tid_hverdag"]||toiletCollection[i]["tid_hverdag"]) === "ALL"){
						matchingParameters++;
					}

					else if(((newQuery[params[x]] === newQuery["tid_hverdag"]) && toiletCollection[i]["tid_hverdag"]) && (toiletCollection[i]["tid_hverdag"] != "ALL")){ //If we're investigating opening times on a weekday
						var weekdayTimeSplit = toiletCollection[i]["tid_hverdag"].split(" - ");
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

					else if(((newQuery[params[x]] === newQuery["tid_lordag"]) && toiletCollection[i]["tid_lordag"]) && (toiletCollection[i]["tid_lordag"] != "ALL")){ //If we're investigating opening times on a saturday
						var saturdayTimeSplit = toiletCollection[i]["tid_lordag"].split(" - ");
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

					else if(((newQuery[params[x]] === newQuery["tid_sondag"]) && toiletCollection[i]["tid_sondag"]) && (toiletCollection[i]["tid_sondag"] != "ALL")){ //If we're investigating opening times on a sunday
						var sundayTimeSplit = toiletCollection[i]["tid_sondag"].split(" - ");
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

					//Because the general comparison will only accept exact values, this hack accepts less than values for prices.
					if(((newQuery[params[x]] === newQuery["pris"]) > toiletCollection[i]["pris"]) && (newQuery["pris"] != "Free")){
						matchingParameters++;
					} else if (((newQuery[params[x]] === newQuery["pris"]) === 0) && (toiletCollection[i]["pris"] == "0")){
						matchingParameters++;
					} else if (((newQuery[params[x]] === newQuery["pris"]) === "Free") && (toiletCollection[i]["pris"] === "0")){
						matchingParameters++;
					}

					/*
						GENERAL COMPARISON FOR ALL OTHER VALUES
					*/
					if((toiletCollection[i][params[x]] === newQuery[params[x]]) && (toiletCollection[i][params[x]] != "NULL")){ //If the parameter matches the search
						matchingParameters++; //Add +1 to the matching counter
					}
				}
			}
			console.log("Defined: " + definedParameters + "| Matching: " + matchingParameters);
			if ((definedParameters === matchingParameters) && definedParameters != 0){ //If the counters match
				results.push(toiletCollection[i]); //Push the item to the result collection
			}
		}

		if (searchOccurred){ //If there are items in the result collection
			console.log("Returning new list");
			searchOccurred = false;
			return results; //Return result collection

		}
		else {
			console.log("Returning full list");
			return toiletCollection;
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
		for (i = 0; i < doKart.length; i++) {
				var marker = new google.maps.Marker({
				position: new google.maps.LatLng(doKart[i].latitude, doKart[i].longitude),
				label: doKart[i].id,
				placement: doKart[i].plassering,
				address: doKart[i].adresse,
				ladies: (doKart[i].dame === "1")?"Yes":"No",
				gentlemen: (doKart[i].herre === "1")?"Yes":"No",
				price: doKart[i].pris,
				wheelchair: (doKart[i].rullestol === "1")?"Yes":"No",
				weekday: doKart[i].tid_hverdag,
				saturday: doKart[i].tid_lordag,
				sunday: doKart[i].tid_sondag,
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
function generateInfoWindow(marker) {
	for(i = 0; i < doKart.length; i++) {
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
