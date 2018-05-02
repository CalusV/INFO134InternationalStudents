/**
* Funksjon for å vise og skjule subNav elementer
**/
var currentSelection = document.getElementById("description-text");

function hideMe(value) {
  showOrHideDescriptionText();
  var x = document.getElementById(value);

    if(currentSelection != null) {
        currentSelection.style.display = "none";
    }

  x.style.display === "flex";
  if (x.style.display === "flex") {
    x.style.display = "none";
  } else {
    x.style.display = "flex";
  }
  currentSelection = x;
}

/**
*Funksjon for å gjemme introteksten på survivalsiden. 
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
