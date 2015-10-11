var Ps=new Mongo.Collection("pls"),Pln=Da=Markers=[],image={},start=8,end=22;
if (Meteor.isClient) {
    Meteor.startup(function () {
        document.getElementById('filePicker').addEventListener('change', function (evt) {
            var f = evt.target.files;
            if (f && f[0]) {
                var rd = new FileReader();
                rd.onload = function (r) { image = "data:" + f[0].type + ";base64," + btoa(r.target.result) };
                rd.readAsBinaryString(f[0]);
            }
        }, false);
        GoogleMaps.load();
    });
    Template.body.helpers({
        exampleMapOptions: function () {
            if (GoogleMaps.loaded()) {
                google.maps.Map.prototype.clearMarkers = function () {
                    for (var i = 0; i < Markers.length; i++) Markers[i].setMap(null);
                };
                X = Geolocation.latLng().lat; Y = Geolocation.latLng().lng;
                return { center: new google.maps.LatLng(X, Y), zoom: 16 };
            }
        }, plans : function () { return Session.get("Pln") },
        actToShow: function () { return Session.get("theAct") }
    });
    Template.body.onCreated(function () {
        GoogleMaps.ready('exampleMap', function (map) {
            MAP=map.instance;
            map.instance.addListener('rightclick', function (event) {
                document.getElementById("lat").value = event.latLng.J;
                document.getElementById("lng").value = event.latLng.M;
                document.getElementById("addPlaceFormHolder").style.display = "block";
            });
        });
    });
    Template.act.events({"click .delete": function () {
      Pln = [];
      GoogleMaps.maps.exampleMap.instance.clearMarkers();
      var $this = this, places = [], p = Ps.find();
      p.forEach(function (e) {
        Da.push($this._id);
        if (Da.indexOf(e._id) == -1) places.push(e);
      });
      showPlan(places);
    }});
    Template.body.events({
        "submit #addPlaceForm": function (event) {
            event.preventDefault();
            var e = event.target;
            Ps.insert({
                placeName: e.placeName.value, disc: e.disc.value, time: e.time.value, image: image,
                sport: e.sport.value, music: e.music.value, cinema: e.cinema.value,
                theater: e.theater.value, food: e.food.value,
                x: e.lat.value, y: e.lng.value
            });
            $(".popup").fadeOut();
        }, "click #planMyDayButton": function (event) {$("#planMyDayHolder").fadeIn()},
           "click .closePopups": function () { $(".popup").fadeOut(); },
           "submit #planMyDayForm": function (event) {
              event.preventDefault();
              GoogleMaps.maps.exampleMap.instance.clearMarkers();
              Pln = Da = [];
              et = event.target;
              var places = [], p = Ps.find();
              p.forEach(function (e) { places.push(e); });
              showPlan(places, 2);
        }
    })
}
function showPlan(places) {
    for (var i = places.length - 1,m=Math; i >= 0; i--) {
            places[i].note=1000/m.sqrt(m.pow(places[i].x-X,2)+m.pow(places[i].x-X,2))+
                             6 * 10 - m.abs(places[i].sport - et.sport) - m.abs(places[i].music - et.music) -
                             m.abs(places[i].music - et.music) - m.abs(places[i].cinema - et.cinema) -
                             m.abs(places[i].theater - et.theater) - m.abs(places[i].food - et.food);
    };
    places.sort(function (a, b) { return parseFloat(b.note) - parseFloat(a.note) });
    var t=t1 = start, i = 0;
    while (t1 < end && i < places.length) {
        if (t1 + parseInt(places[i].time) <= end) {
            Pln.push(places[i]);
            t1 += parseInt(places[i].time);
        } i++; }
    for (var i = 0; i < Pln.length; i++) {
        var marker = new google.maps.Marker({
            position: { lat: parseFloat(Pln[i].x), lng: parseFloat(Pln[i].y) }
        });
        Markers.push(marker);
        (function ($thisPlan) {
            marker.setMap(MAP);marker.setClickable(true);marker.addListener("click", function () {
                Session.set("theAct", [$thisPlan]);
                $("#oneActShow").fadeIn();
            });
        })(Pln[i]);
        Pln[i].period = t + " -> " + (t + parseInt(Pln[i].time));
        t = t + parseInt(Pln[i].time);
    }
    Session.set("Pln", Pln);
    $(".popup").hide(0, function () { $("#PlanHolder").show(0); })
}