/**
 * Script for sending a http request to the server so that
 * we can read and write to the JSON file dokart.json as an
 * javascript object.
 * Author (Øyvind Johannessen)
 * Version (0.1)
**/
var myJson=fetch('https://hotell.difi.no/api/json/bergen/dokart?')
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    console.log(myJson);
		console.log(myJson.entries[1].plassering);
 });

 function fetch(){
 $http.get("https://hotell.difi.no/api/json/bergen/dokart?" + $scope.search + "&perpage=25000")
 .success(function(response){
 $scope.songs = [];
 $scope.details = response;

 for(var i=0; i < response.entries.length; i++){


   var allTracks = {
     latitude: response.entries[i].track_id,
     longitude: response.entries[i].label_fk,
     plassering: response.entries[i].album_num,
     img: imgUrl,
     url: resultUrl
   };

   $scope.songs.push(allTracks);
   }
   });
 }


var xmlhttp = new XMLHttpRequest(),
     dokart;

 xmlhttp.onreadystatechange = function() {
   if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {
     dokart = JSON.parse(xmlhttp.responseText);
   }
 }
 xmlhttp.open('GET', 'js/dokart.json', true);
 xmlhttp.send();
