// Marker variables for different destinations
// University Of Bergen
var uib = {lat: 60.387819, lng: 5.321563}; // University of Bergen (default)
var sc = {lat: 60.386707, lng: 5.323128}; // Student Center
var uph = {lat: 60.388475, lng: 5.323440}; // Ulrikke Pihls Hus
var scf = {lat: 60.388504, lng: 5.324376}; // Social Science Faculty
var fol = {lat: 60.390179, lng: 5.314818}; // Faculty of Law
// Bars And Clubs
var taq = {lat: 60.389852, lng: 5.322002}; // The Academic Quarter
var gar = {lat: 60.389602, lng: 5.323835}; // garage
var irc = {lat: 60.391549, lng: 5.321885}; // Inside Rock Cafe
var lan = {lat: 60.389776, lng: 5.326544}; // Landmark
// Culture
var bry = {lat: 60.397724, lng: 5.324560}; // Bryggen
var vvi = {lat: 60.381437, lng: 5.329186}; // VilVite
var olb = {lat: 60.418828, lng: 5.309405}; // Old Bergen
// Hikes
var flø = {lat: 60.399246, lng: 5.345766}; // Fløyen
// Stores
var lqs = {lat: 60.389458, lng: 5.333208}; // Liquor Store

// Adjustable marker position depending on user input
var markerPosition = uib;

/**
 * Function for adjusting the lat and lng to users request
 * Param: String input
 * 
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
 * Javascript for a visible Google map
 * As Default the map centers at Norway/Bergen/University of Bergen (60.387819, 5.321563)
 * ID: map
 *
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
 * Function getRequestedTable shows and hides html code depending on what
 * dropdown menu item is selected
 * Param: String value
 *
**/
// variable currentSelection is used to hide previous selection, when a new selection is made.
var currentSelection;
function getRequestedTable(value) {
  // x is whatever value it gets from dropdown meny
  var x = document.getElementById(value);
  // Checks if currentSelection is defined. If it is defined, it will set display to "none"
  // and make room for a new selection to be visible
  if(typeof currentSelection !== 'undefined') {
      currentSelection.style.display = "none";
  }
      // Sets the newest table list display to none.
      x.style.display = "none";
  // if x's style display is set to none, which it now always will be, then instead set it to block (show)
  if (x.style.display === "none") {
      x.style.display = "block";
  }
  // Update currentSelection to the same value as x
  currentSelection = document.getElementById(value);
}
