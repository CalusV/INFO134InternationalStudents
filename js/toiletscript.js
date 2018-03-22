

/* Listen over toaletter. Skal kobles til online-version.
Kan denne overskrives dynamisk basert på online? Slik at den alltid er oppdatert?
Farlig med tanke på at den kan overskrives med tom liste etc etc*/


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
	var doKart;
	var toiletEntries;
	var query;

	/*
	  JSON parse
	*/
	// Parse the JSON-file
	function loadTable(tableType) {
	  var xmlhttp = new XMLHttpRequest();
		var url = "https://hotell.difi.no/api/json/bergen/dokart?";
	  xmlhttp.onreadystatechange = function() {
	      if (this.readyState == 4 && this.status == 200) {

	          var myObj = JSON.parse(this.responseText);
	          var fullTable = document.getElementById("fullTable");
	          var searchTable = document.getElementById("searchTable");

	          if (tableType == "full"){
	            doKart = myObj.entries;
	            toiletEntries = doKart.length;
	            var fullTable = document.getElementById("fullTable");
	            clearTable(fullTable);
	            populateTable();
	          }

	          else if (tableType == "search"){
	            doKart = executeSearch(myObj.entries);
	            toiletEntries = doKart.length;

	            clearTable(fullTable); // Denne var tidligere searchTable
	            populateTable();
	          }

	      }
	  };
	  xmlhttp.open("GET", url, true);
	  xmlhttp.send();
	}
	/*
	    SEARCH QUERY FUNCTIONALITY
	*/
	//Build a constructor object for a search query
	function SearchQuery (searchString, name, address, date, hour, minute, openNow, access, maxPrice, free, male, female, baby) {
	  this.searchString = searchString;
	  this.toiletName = name;
	  this.toiletAddress =  address;
	  this.toiletDate = date;
	  this.toiletHour = hour;
	  this.toiletMinute = minute;
	  this.toiletOpenNow = openNow;
	  this.toiletAccess = access;
	  this.toiletMaxPrice = maxPrice;
	  this.toiletFree = free;
	  this.toiletMale = male;
	  this.toiletFemale = female;
	  this.toiletBaby = baby;

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
	      fullTable.deleteRow(tableHeaderRowCount);
	    }
	}

	function populateTable() {
	  //Construct new table
	  for (i = 0; i < toiletEntries; i++) {
	    var newRow = fullTable.insertRow(i+1);
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
	    firstCell.innerHTML = i+1 + ".";

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
	  var advInputName = document.getElementById('advName');
	  var advInputAddress = document.getElementById('advAdr');
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

	  var qParamFreeSearch = freeInput.value;
	  console.log("Search returned: " + qParamFreeSearch);
	  var qParamName = advInputName.value;
	  console.log("Name returned: " + qParamName);
	  var qParamAddress = advInputAddress.value;
	  console.log("Address returned: " + qParamAddress);
	  var qParamDate = advInputDate.value;
	  console.log("Input Date returned: " + qParamDate);
	  var qParamHour = advInputHour.value;
	  console.log("Hour returned: " + qParamHour);
	  var qParamMinute = advInputMinute.value;
	  console.log("Minute returned: " + qParamMinute);
	  var qParamOpen = advInputOpen.checked;
	  console.log("Open returned: " + qParamOpen);
	  var qParamAccess = advInputAccess.checked;
	  console.log("Access returned: " + qParamAccess);
	  var qParamMaxPrice = advInputMaxPrice.value;
	  console.log("Max Price returned: " + qParamMaxPrice);
	  var qParamFree = advInputFree.checked;
	  console.log("Free returned: " + qParamFree);
	  var qParamMale = advInputMale.checked;
	  console.log("Male returned: " + qParamMale);
	  var qParamFemale = advInputFemale.checked;
	  console.log("Female returned: " + qParamFemale);
	  var qParamBaby = advInputBaby.checked;
	  console.log("Baby returned: " + qParamBaby);

	  var generatedQuery = new SearchQuery(qParamFreeSearch,
	                                      qParamName,
	                                      qParamAddress,
	                                      qParamDate,
	                                      qParamHour,
	                                      qParamMinute,
	                                      qParamOpen,
	                                      qParamAccess,
	                                      qParamMaxPrice,
	                                      qParamFree,
	                                      qParamMale,
	                                      qParamFemale,
	                                      qParamBaby);
	  query = generatedQuery;
	  return query;
	}

	function executeSearch(fullCollection) {
	  searchQuery = generateSearch();
	  toiletCollection = fullCollection;

	  return toiletCollection;
	}

	// Laster inn fullTable slik at var doKart har verdi som markørene kan utnytte til å hente nødvendig data
	loadTable('full');

	/**
	 * Funksjon for å laste inn kart og befolke det med marker
	**/
	function initMap() {
		var bergen = {lat: 60.391, lng: 5.324};
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 14,
			center: bergen
		});

		// Leter gjennom 'var doKart' og plasserer en markør på kartet for hver entry i listen
		for (i = 0; i < doKart.length; i++) {
			/* Oppretter nytt Marker-objekt og plasserer det på kartet basert på dassPos-koordinater */
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(doKart[i].latitude, doKart[i].longitude),
				map: map,
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

			// Legg til nytt infoWindow med riktig informasjon
			var infoW = new google.maps.InfoWindow();
			marker.addListener('click', function() {
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
