/* 	Funksjon for å laste inn kart og befolke det med marker, samt å sette opp en nummerert
	liste over totalettplasseringene i en separat <ol>-tag*/
function initMap() {
	var bergen = {lat: 60.391, lng: 5.324};
	var map = new google.maps.Map(document.getElementById('map'), {
	  zoom: 14,
	  center: bergen
	});

	/* Lager element("ol") og legger det til <body> */
	var orderedList = document.createElement("ol");
	document.body.appendChild(orderedList);

<<<<<<< HEAD
=======

>>>>>>> c282283e00b37902007c7331d946094c16e83372
	/* Leter gjennom 'var dassPlasser' og plasserer en markør på kartet for hver entry i listen */
	for (i=0;i<dassPlasser.entries.length;i++) {
		var lat = dassPlasser.entries[i].latitude;
		var lng = dassPlasser.entries[i].longitude;
		var desc = dassPlasser.entries[i].plassering;
		var listElement = document.createElement("li");
		var txt = document.createTextNode(dassPlasser.entries[i].plassering);

		 //var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      //var labelIndex = i;


		/* Oppretter nytt LatLng-objekt med koordinater fra listen */
		var dassPos = new google.maps.LatLng(lat, lng);

		/* Oppretter nytt Marker-objekt og plasserer det på kartet basert på dassPos-koordinater */
		var marker = new google.maps.Marker({
			position: dassPos,
			map: map,
			label: dassPlasser.entries[i].id,

			//label: dassIndex++ % dassIndex.length,
<<<<<<< HEAD
			info: desc, 		//Når denne blir satt til var txt(se over) fjerner den entries i listen når bruker klikker på marker lol
			gender: "Mann"
=======
			info: desc 		//Når denne blir satt til var txt(se over) fjerner den entries i listen når bruker klikker på marker lol
>>>>>>> c282283e00b37902007c7331d946094c16e83372
		});

		var infoW = new google.maps.InfoWindow();
		marker.addListener('click', function() {
			infoW.setContent(this.info + "<br>" + this.gender);
			infoW.open(map, this);
			console.log(this.info);
			});

<<<<<<< HEAD
		/* Befolker listen med plasseringer fra dassPlasser */

=======
		/* Befolker listen med plasseringer fra dassPlasser
		*/
>>>>>>> c282283e00b37902007c7331d946094c16e83372
		orderedList.appendChild(listElement);
		listElement.appendChild(txt);
		}

<<<<<<< HEAD
	}


/* Listen over toaletter. Skal kobles til online-version.
Kan denne overskrives dynamisk basert på online? Slik at den alltid er oppdatert?
Farlig med tanke på at den kan overskrives med tom liste etc etc*/
=======
	}

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

	            clearTable(searchTable);
	            populateTable();
	          }

	      }
	  };
	  xmlhttp.open("GET", "js/dokart.json", true);
	  xmlhttp.send();
	}
	/*
	    SEARCH QUERY FUNCTIONALITY
	*/
	//Build a constructor object for a search query
	function searchQuery (searchString, name, address, date, hour, minute, openNow, access, maxPrice, free, male, female, baby) {
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

	  var generatedQuery = new searchQuery(qParamFreeSearch,
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

/*
	SLUTT PÅ KODEDEL FRA ROY
*/

/* Listen over toaletter. Skal kobles til online-version.
Kan denne overskrives dynamisk basert på online? Slik at den alltid er oppdatert?
Farlig med tanke på at den kan overskrives med tom liste etc etc
*/
>>>>>>> c282283e00b37902007c7331d946094c16e83372
var dassPlasser = {
"entries":[
	{
		"herre":"1",
		"tid_sondag":"07.00 - 23.15",
		"pissoir_only":"NULL",
		"stellerom":"NULL",
		"latitude":"60.3879681",
		"tid_hverdag":"07.00 - 23.15",
		"plassering":"NONNESETER TERMINAL, SØR",
		"tid_lordag":"07.00 - 23.15",
		"rullestol":"1","adresse":"Lungegårdskaien",
		"pris":"12",
		"id":"1",
		"place":"NONNESETER TERMINAL, SOUTH",
		"dame":"1",
		"longitude":"5.334608"
	},
	{
		"herre":"1",
		"tid_sondag":"NULL",
		"pissoir_only":"NULL",
		"stellerom":"NULL",
		"latitude":"60.3884988",
		"tid_hverdag":"05.30 - 23.50",
		"plassering":"NONNESETER TERMINAL , NORD",
		"tid_lordag":"07.00 - 23.15",
		"rullestol":"1",
		"adresse":"Østre Strømkai",
		"pris":"12",
		"id":"2",
		"place":"NONNESETER TERMINAL , NORTH",
		"dame":"1",
		"longitude":"5.3345382"
	},
	{
		"herre":"1",
		"tid_sondag":"NULL",
		"pissoir_only":"NULL",
		"stellerom":"NULL",
		"latitude":"60.388868",
		"tid_hverdag":"09.00 - 17.00",
		"plassering":"SKYSS KUNDESENTER",
		"tid_lordag":"09.00 - 15.00",
		"rullestol":"1",
		"adresse":"Østre Strømkai",
		"pris":"12",
		"id":"3",
		"place":"SKYSS CUSTOMER CENTRE",
		"dame":"1","longitude":"5.3337597"
	},
	{
		"herre":"1",
		"tid_sondag":"07.00 - 23.00",
		"pissoir_only":"NULL",
		"stellerom":"NULL",
		"latitude":"60.39041",
		"tid_hverdag":"07.00 - 23.00",
		"plassering":"JERNBANESTASJONEN",
		"tid_lordag":"07.00 - 23.00",
		"rullestol":"NULL",
		"adresse":"Strømgaten 4",
		"pris":"10",
		"id":"4","place":"RAILWAY STATION",
		"dame":"1",
		"longitude":"5.332995"
	},
	{
		"herre":"1",
		"tid_sondag":"08.30 - 22.00",
		"pissoir_only":"NULL",
		"stellerom":"1",
		"latitude":"60.394554",
		"tid_hverdag":"09.00 - 23.00",
		"plassering":"MATHALLEN",
		"tid_lordag":"08.30 - 22.00",
		"rullestol":"1",
		"adresse":"Strandkaien 3",
		"pris":"10",
		"id":"5",
		"place":"FISH MARKET",
		"dame":"1",
		"longitude":"5.324099"
	},
	{
		"herre":"1",
		"tid_sondag":"08.00 - 18.00",
		"pissoir_only":"NULL",
		"stellerom":"",
		"latitude":"60.3951003",
		"tid_hverdag":"08.00 - 18.00",
		"plassering":"STRANDKAITERMINALEN",
		"tid_lordag":"08.00 - 18.00",
		"rullestol":"",
		"adresse":"Strandkaien",
		"pris":"10",
		"id":"6",
		"place":"STRANDKAI BOAT TERMINAL",
		"dame":"1",
		"longitude":"5.3220606"
	},
	{
		"herre":"1",
		"tid_sondag":"NULL",
		"pissoir_only":"NULL",
		"stellerom":"NULL",
		"latitude":"60.3913793",
		"tid_hverdag":"08.00 - 15.00",
		"plassering":"BERGEN KOMMUNE, INNBYGGERSERVICE",
		"tid_lordag":"NULL",
		"rullestol":"1",
		"adresse":"Kaigaten 4",
		"pris":"0",
		"id":"7",
		"place":"CITIZEN SERVICE CENTRE",
		"dame":"1",
		"longitude":"5.3290558"
	},
	{
		"herre":"1",
		"tid_sondag":"NULL",
		"pissoir_only":"NULL",
		"stellerom":"1",
		"latitude":"60.3891105",
		"tid_hverdag":"09.00 - 21.00",
		"plassering":"BERGEN STORSENTER",
		"tid_lordag":"09.00 - 18.00",
		"rullestol":"1",
		"adresse":"Strømgaten 8",
		"pris":"10",
		"id":"8",
		"place":"BERGEN STORSENTER",
		"dame":"1",
		"longitude":"5.3322315"
	},
	{
		"herre":"1",
		"tid_sondag":"NULL",
		"pissoir_only":"NULL",
		"stellerom":"1",
		"latitude":"60.392209",
		"tid_hverdag":"09.00 - 21.00",
		"plassering":"SUNDT MOTEHUS",
		"tid_lordag":"09.00 - 18.00",
		"rullestol":"1",
		"adresse":"Torgallmenningen 14",
		"pris":"10",
		"id":"9",
		"place":"SUNDT FASHION HOUSE",
		"dame":"1",
		"longitude":"5.324011"
	},
	{
		"herre":"1",
		"tid_sondag":"NULL",
		"pissoir_only":"NULL",
		"stellerom":"1",
		"latitude":"60.3927098",
		"tid_hverdag":"09.00 - 20.00",
		"plassering":"XHIBITION",
		"tid_lordag":"09.00 - 18.00",
		"rullestol":"1",
		"adresse":"Småstrandgaten 3",
		"pris":"10",
		"id":"10",
		"place":"XHIBITION",
		"dame":"1",
		"longitude":"5.3262019"
	},
	{
		"herre":"1",
		"tid_sondag":"NULL",
		"pissoir_only":"NULL",
		"stellerom":"1",
		"latitude":"60.3932345",
		"tid_hverdag":"09.00 - 21.00",
		"plassering":"GALLERIET",
		"tid_lordag":"09.00 - 18.00",
		"rullestol":"1",
		"adresse":"Torgallmenningen 8",
		"pris":"10",
		"id":"11",
		"place":"GALLERIET",
		"dame":"1",
		"longitude":"5.3252363"
	},
	{
		"herre":"1",
		"tid_sondag":"NULL",
		"pissoir_only":"NULL",
		"stellerom":"1",
		"latitude":"60.3944194",
		"tid_hverdag":"10.00 - 20.00",
		"plassering":"KLØVERHUSET",
		"tid_lordag":"10.00 - 18.00",
		"rullestol":"1",
		"adresse":"Strandgaten 13 -15",
		"pris":"10",
		"id":"12",
		"place":"KLØVERHUSET",
		"dame":"1",
		"longitude":"5.3205649"
	},
	{
		"herre":"1",
		"tid_sondag":"09.00 - 18.00",
		"pissoir_only":"NULL",
		"stellerom":"NULL",
		"latitude":"60.3975913",
		"tid_hverdag":"09.00 - 18.00",
		"plassering":"BRYGGEN BESØKSSENTER",
		"tid_lordag":"09.00 - 18.00",
		"rullestol":"1",
		"adresse":"Jacobsfjorden, Bryggen",
		"pris":"10",
		"id":"13",
		"place":"BRYGGEN VISITOR CENTRE",
		"dame":"1",
		"longitude":"5.3244317"
	},
	{
		"herre":"NULL",
		"tid_sondag":"ALL",
		"pissoir_only":"1",
		"stellerom":"NULL",
		"latitude":"60.3973581",
		"tid_hverdag":"ALL",
		"plassering":"C. SUNDTSGT",
		"tid_lordag":"ALL",
		"rullestol":"NULL",
		"adresse":"C. Sundts gt",
		"pris":"NULL",
		"id":"14",
		"place":"C. SUNDTSGT",
		"dame":"NULL",
		"longitude":"5.3132629"
	}
],
"page":1,
"pages":1,
"posts":14}
