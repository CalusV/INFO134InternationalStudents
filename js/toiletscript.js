/**
 * Script for sending a http request to the server so that
 * we can read and write to the JSON file dokart.json as an
 * javascript object. 
 * Author (Øyvind Johannessen)
 * Version (0.1)
**/
var xmlhttp = new XMLHttpRequest(),
    dokart;

xmlhttp.onreadystatechange = function() {
  if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {
    dokart = JSON.parse(xmlhttp.responseText);
  }
}
xmlhttp.open('GET', 'js/dokart.json', true);
xmlhttp.send();
