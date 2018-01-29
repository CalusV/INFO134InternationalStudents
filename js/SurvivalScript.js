/**
 * Function for showing and hiding subNav elements
 * Author: Øyvind Johannessen
**/
var currentSelection = getElementById("description-text");
function hideMe(value) {
    showOrHideDescriptionText();
    var x = document.getElementById(value);

    if(typeof currentSelection !== 'undefined') {
        currentSelection.style.display = "none";
    }

          x.style.display === "block";
      if (x.style.display === "block") {
          x.style.display = "none";
          /*x.style.color = "blue";*/
      } else {
          x.style.display = "block";
          /*x.style.color= "red";*/
    }
    currentSelection = x;
}

/**
 * Function for hiding the description intro text for survival page.
 * Author: Øyvind Johannessen
**/
function showOrHideDescriptionText() {
  var dt = document.getElementById("description-text");
  if(dt.style.display === "block") {
    dt.style.display = "none";
  }
  else {
    dt.style.display = "none";
  }
}
