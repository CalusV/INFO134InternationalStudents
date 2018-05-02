// Marker variabler for forskjellige steder
// Universitetet i Bergen
var uib = {lat: 60.387819, lng: 5.321563}; // Universitetet i Bergen (default)
var sc = {lat: 60.386707, lng: 5.323128}; // Studentsenteret
var uph = {lat: 60.388475, lng: 5.323440}; // Ulrikke Pihls Hus
var scf = {lat: 60.388504, lng: 5.324376}; // SV-fakultetet
var fol = {lat: 60.390179, lng: 5.314818}; // Juridisk fakultetet
// Barer og klubber
var taq = {lat: 60.389852, lng: 5.322002}; // Det akademiske kvarter
var gar = {lat: 60.389602, lng: 5.323835}; // Garage
var irc = {lat: 60.391549, lng: 5.321885}; // Inside Rock Cafe
var lan = {lat: 60.389776, lng: 5.326544}; // Landmark
// Kultur
var bry = {lat: 60.397724, lng: 5.324560}; // Bryggen
var vvi = {lat: 60.381437, lng: 5.329186}; // VilVite
var olb = {lat: 60.418828, lng: 5.309405}; // Gamle Bergen
// -Turer
var flø = {lat: 60.399246, lng: 5.345766}; // Fløyen
// Butikker
var lqs = {lat: 60.389458, lng: 5.333208}; // Vinmonopolet

//Justerbar makrer posisjon basert på brukerinput
var markerPosition = uib;

/**
* Funksjon for å justere lat og lng basert på brukerens ønske
* Param: String input
**/
function markerByInput(input) {
  if(input == "uib") {
    markerPosition = uib;
  }
  else if(input == "sc") {
    markerPosition = sc;
  }
  else if (input == "uph") {
    markerPosition = uph;
  }
  else if (input == "scf") {
    markerPosition = scf;
  }
  else if (input == "fol") {
    markerPosition = fol;
  }
  else if (input == "taq") {
    markerPosition = taq;
  }
  else if (input == "gar") {
    markerPosition = gar;
  }
  else if (input == "irc") {
    markerPosition = irc;
  }
  else if (input == "lan") {
    markerPosition = lan;
  }
  else if (input == "bry") {
    markerPosition = bry;
  }
  else if (input == "vvi") {
    markerPosition = vvi;
  }
  else if (input == "olb") {
    markerPosition = olb;
  }
  else if (input == "flø") {
    markerPosition = flø;
  }
  else if (input == "lqs") {
    markerPosition = lqs;
  }
  initMap();
}

/**
* Javascript for å synligjøre Google Map
* SOm Default sentrerer kartet på Norge/Bergen/Universitetet i Bergen (60.387819, 5.321563)
* ID: map
**/
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: markerPosition
  });
  var marker = new google.maps.Marker({
    position: markerPosition,
    map: map
  });
}

/**
* Function getRequestedTable viser og skjuler html code basert på hva
* dropdown menu element som er valgt
* Param: String value
**/
// Variabel currentSelection er brukt for å skjule gamle valg, når nye valg er tatt
var currentSelection;
function getRequestedTable(value) {
  // x verdien den får fra dropdown menyen
  var x = document.getElementById(value);
  // Sjekker om currentSelection er definert. om den er definert vil den sette display to "none"
  // og tillate at ny selektrering blir vist
  if(typeof currentSelection !== 'undefined') {
    currentSelection.style.display = "none";
  }
  // setter den nyeste tabelllisten til display none
  x.style.display = "none";
  //Hvis x-style display er satt til none, som den ikke alltid er, sett den heller til block(show)
  if (x.style.display === "none") {
    x.style.display = "block";
  }
  // Oppdater currentSelection til samme verdi som x
  currentSelection = document.getElementById(value);
}
