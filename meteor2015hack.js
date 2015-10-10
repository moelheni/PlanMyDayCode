Places = new Mongo.Collection("places");
console.log(Places.find());
thePlan = []

/* if (Navigator.geolocation) {
    Navigator.geolocation.getCurrentPosition(showPosition);
}else{*/
  X=30;
  Y=30;
/*}*/


function handlePos(pos){
  X = pos.coords.latitude;
  Y = pos.coords.longitude;
}


if (Meteor.isClient) {
  Meteor.startup(function() {
    GoogleMaps.load();
  });
  Template.body.helpers({
    exampleMapOptions: function() {
        // Make sure the maps API has loaded
        if (GoogleMaps.loaded()) {
          // Map initialization options
          return {
            center: new google.maps.LatLng(X, Y),
            zoom: 8
          };
        }
      },
      plans : function(){
        return Session.get("thePlan");;
      }
  });
  Template.body.onCreated(function() {
  // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('exampleMap', function(map) {
    
      map.instance.addListener('rightclick', function(event) {
        console.log("clicked map");
        document.getElementById("lat").value = event.latLng.J;
        document.getElementById("lng").value = event.latLng.M;
        document.getElementById("addPlaceFormHolder").style.display = "block";
      });
    });
  });
  Template.act.events({
    "click #delete" : function(){
      thePlan = [];
      var $this = this;
       var places = [];
        var p = Places.find();
        p.forEach(function(e){
          console.log($this);
          if(e._id != $this._id) 
            places.push(e);
        })
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
            marker.setMap(GoogleMaps.maps.exampleMap.instance);
            marker.setTitle(t +" -> " + (t+parseInt(thePlan[i].time)));
            thePlan[i].period = t +" -> " + (t+parseInt(thePlan[i].time));
            t = t+parseInt(thePlan[i].time);
        }
        Session.set("thePlan",thePlan);
    }
  })
  Template.body.events({
    "submit #addPlaceForm": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
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
        sport: sport,
        music: music,
        cinema: cinema,
        theater: theater,
        food: food,
        x:x,
        y:y,
        createdAt: new Date() // current time
      });
 
    },
    "click #planMyDayButton" : function(event) {
       document.getElementById("planMyDayHolder").style.display = "block";
    },
    "click .closePopups" : function(){
      $(".popup").fadeOut();
    },
    "submit " : function(event){
        event.preventDefault();
        start = 8;
        end   = 22;

        thePlan = [];


        sport     = event.target.sport.value;
        music     = event.target.music.value;
        cinema    = event.target.cinema.value;
        theater   = event.target.theater.value;
        food      = event.target.food.value;
        var places = [];
        var p = Places.find();
        p.forEach(function(e){
          places.push(e);
        })
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
            marker.setMap(GoogleMaps.maps.exampleMap.instance);
            marker.setTitle(t +" -> " + (t+parseInt(thePlan[i].time)));
            thePlan[i].period = t +" -> " + (t+parseInt(thePlan[i].time));
            t = t+parseInt(thePlan[i].time);
        }
        Session.set("thePlan",thePlan);
        $(".popup").fadeOut();
        document.getElementById("PlanHolder").style.display = "block";
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}