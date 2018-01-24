/* Foreløpig er alt under stjålet fra Øyvind. Skal endres til å passe survival-siden, hvis det er behov for det. -TRL*/

/**
 * Javascript for a visible Google map
 * As Default the map centers at Norway/Bergen/University of Bergen (60.387819, 5.321563)
 * ID: map
 * Author: (Øyvind Johannessen)
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
 * Author (Øyvind Johannessen)
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


/* Show/Hide */
function hideMe(value) {
    var x = document.getElementById(value);
    if (x.style.display === "none") {
        x.style.display = "block";
        /*x.style.color = "blue";*/
    } else {
        x.style.display = "none";
        /*x.style.color= "red";*/
    }
}
