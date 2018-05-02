/**
 * Function for showing and hiding subNav elements
**/
var currentSelection = document.getElementById("description-text");
function hideMe(value) {
    showOrHideDescriptionText();
    var x = document.getElementById(value);

    console.log(currentSelection);
    if(currentSelection != null) {
        currentSelection.style.display = "none";
    }

          x.style.display === "flex";
      if (x.style.display === "flex") {
          x.style.display = "none";
          /*x.style.color = "blue";*/
      } else {
          x.style.display = "flex";
          /*x.style.color= "red";*/
    }
    currentSelection = x;
}

/**
 * Function for hiding the description intro text for survival page.
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
