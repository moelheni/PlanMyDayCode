/*
*
* TODO : add acounts
* 
*/

Places = new Mongo.Collection("places");
console.log(Places.find());
thePlan = [];
DeletedAct = [];
Markers = [];

image = {};

if (Meteor.isClient) {
  Meteor.startup(function() {
       
      var handleFileSelect = function(evt) {
          var files = evt.target.files;
          var file = files[0];
          console.log(file);
          if (files && file) {
              var reader = new FileReader();

              reader.onload = function(readerEvt) {
                  var binaryString = readerEvt.target.result;
                  console.log(readerEvt);
                  image = "data:"+file.type+";base64,"+btoa(binaryString);
              };

              reader.readAsBinaryString(file);
          }
      };

      if (window.File && window.FileReader && window.FileList && window.Blob) {
          document.getElementById('filePicker').addEventListener('change', handleFileSelect, false);
      } else {
          alert('The File APIs are not fully supported in this browser.');
      }



    GoogleMaps.load();
  });
  Template.body.helpers({
    exampleMapOptions: function() {
        // Make sure the maps API has loaded
        if (GoogleMaps.loaded()) {
          google.maps.Map.prototype.markers = new Array();

          google.maps.Map.prototype.addMarker = function(marker) {
              this.markers[this.markers.length] = marker;
          };

          google.maps.Map.prototype.getMarkers = function() {
              return this.markers
          };

          google.maps.Map.prototype.clearMarkers = function() {
              for(var i=0; i<Markers.length; i++){
                  Markers[i].setMap(null);
              }
          };
          // Map initialization options
          X=Geolocation.latLng().lat;
          Y=Geolocation.latLng().lng;
          return {
            center: new google.maps.LatLng(X, Y),
            zoom: 16
          };
        }
      },
      plans : function(){
        return Session.get("thePlan");
      },
      actToShow : function(){
        return Session.get("theAct");
      }
  });
  Template.body.onCreated(function() {
  // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('exampleMap', function(map) {
      
      var marker = new google.maps.Marker({
              position: {lat: X, lng: Y}
            });
            var icon = new google.maps.MarkerImage(
                    "http://www.iconsdb.com/icons/preview/moth-green/circle-xl.png", //url
                    new google.maps.Size(50, 50), //size
                    new google.maps.Point(0,0), //origin
                    new google.maps.Point(0, 0) //anchor 
            );

            marker.setMap(GoogleMaps.maps.exampleMap.instance);
            marker.setTitle("Your position");
            marker.setIcon(icon);


      map.instance.addListener('rightclick', function(event) {
        console.log("clicked map");
        document.getElementById("lat").value = event.latLng.J;
        document.getElementById("lng").value = event.latLng.M;
        document.getElementById("addPlaceFormHolder").style.display = "block";
      });
    });
  });
  Template.act.events({
    "click .delete" : function(){
      thePlan = [];
      GoogleMaps.maps.exampleMap.instance.clearMarkers();
      var $this = this;
       var places = [];
        var p = Places.find();
        p.forEach(function(e){
          console.log($this);
          DeletedAct.push($this._id);
          if(DeletedAct.indexOf(e._id) == -1) 
            places.push(e);
        })
       showPlan(places);
    }
  })
  Template.body.events({
    "submit #addPlaceForm": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      
      console.log(image);
      // Get value from form element
      var placeName = event.target.placeName.value;
      var disc      = event.target.disc.value;
      var time      = event.target.time.value;
      var sport     = event.target.sport.value;
      var music     = event.target.music.value;
      var cinema    = event.target.cinema.value;
      var theater   = event.target.theater.value;
      var food      = event.target.food.value;
      var x         = event.target.lat.value;
      var y         = event.target.lng.value;
 
      // Insert a task into the collection
      Places.insert({
        placeName: placeName,
        disc: disc,
        time: time,
        image:image,
        sport: sport,
        music: music,
        cinema: cinema,
        theater: theater,
        food: food,
        x:x,
        y:y,
        createdAt: new Date() // current time
      });
      $(".popup").fadeOut();
    },
    "click #planMyDayButton" : function(event) {
       document.getElementById("planMyDayHolder").style.display = "block";
    },
    "click .closePopups" : function(){
      $(".popup").fadeOut();
    },
    "submit #planMyDayForm" : function(event){
        event.preventDefault();
        start = 8;
        end   = 22;

        GoogleMaps.maps.exampleMap.instance.clearMarkers();
        thePlan = [];
        DeletedAct = [];

        sport     = event.target.sport.value;
        music     = event.target.music.value;
        cinema    = event.target.cinema.value;
        theater   = event.target.theater.value;
        food      = event.target.food.value;
        var places = [];
        var p = Places.find();
        p.forEach(function(e){
          places.push(e);
        });
        showPlan(places);
       
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}



function showPlan(places){
   console.log(places);
        for (var i = places.length - 1; i >= 0; i--) {
          place = places[i];
          note = 0;
          note += 10 / Math.sqrt(Math.pow(place.x-X,2) + Math.pow(place.x-X,2)); 
          note += 10 - Math.abs(place.sport - sport);
          note += 10 - Math.abs(place.music - music);
          note += 10 - Math.abs(place.cinema - cinema);
          note += 10 - Math.abs(place.theater - theater);
          note += 10 - Math.abs(place.food - food);
          places[i].note = note;
        };

        console.log(places);
       places.sort(function(a, b) {
          return parseFloat(b.note) - parseFloat(a.note);
      });

        console.log(places);
        var t = start;
        var i = 0;
        
        while(t<end && i<places.length){
          if(t+parseInt(places[i].time)<=end){
            thePlan.push(places[i]);
            t += parseInt(places[i].time);
            //TODO : add period of time to go from last place to the new one
          }
          i++;
        }

        console.log(thePlan);
        var t = start;
        for(var i=0;i<thePlan.length;i++){
            var marker = new google.maps.Marker({
              position: {lat: parseFloat(thePlan[i].x), lng: parseFloat(thePlan[i].y)}
            });
            var icon = new google.maps.MarkerImage(
                    thePlan[i].image, //url
                    new google.maps.Size(50, 50), //size
                    new google.maps.Point(0,0), //origin
                    new google.maps.Point(0, 0) //anchor 
            );

            marker.setMap(GoogleMaps.maps.exampleMap.instance);
            marker.setTitle(thePlan[i].placeName+" : " + t +" -> " + (t+parseInt(thePlan[i].time)));
            marker.setIcon(icon);
            marker.setClickable(true);
            Markers.push(marker);

            (function($thisPlan){
              marker.addListener("click",function(){
                console.log("mm");
                Session.set("theAct",[$thisPlan]);
                $("#oneActShow").fadeIn();
              });
            })(thePlan[i]);
            console.log(marker);
            thePlan[i].period = t +" -> " + (t+parseInt(thePlan[i].time));
            t = t+parseInt(thePlan[i].time);

        }
        Session.set("thePlan",thePlan);
         $(".popup").hide(0,function(){
            $("#PlanHolder").show(0);
         });
}