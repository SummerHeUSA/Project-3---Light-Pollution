//map center

var mymap = L.map("map", {
  center: [39.7452, -104.9922],
  zoom: 11

});
mymap.doubleClickZoom.disable();


L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.high-contrast',
  accessToken: API_KEY
}).addTo(mymap)


d3.json("imageserver.geojson", function (data) {

  // L.geoJson function is used to parse geojson file and load on to map
  L.geoJson(data).addTo(mymap)

});

// get destination on click 
mymap.on('click', function(ev){
  var latlng = mymap.mouseEventToLatLng(ev.originalEvent);
  console.log(latlng.lat + ', ' + latlng.lng);
  lat = latlng.lat
  lng = latlng.lng
 
 
  des_link = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDC8qJSgf_e-ZSRb8c-I4j_Ucyf0R0t9Hk`
 
  d3.json(des_link, function (data) {
    console.log(data)
    addressTemp_dest = data["results"][0]["formatted_address"]
    d3.select("#to_places").attr("value", `${addressTemp_dest}`)
 
  });
 
 });

// get current location 
var x = document.getElementById("demo");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);

  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  x.innerHTML = "Latitude: " + position.coords.latitude +
    "<br>Longitude: " + position.coords.longitude;
  current_lat = position.coords.latitude
  current_lng = position.coords.longitude

  // Transfer  origin lat lng to physical address

  link = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${current_lat},${current_lng}&key=AIzaSyDC8qJSgf_e-ZSRb8c-I4j_Ucyf0R0t9Hk`

  d3.json(link, function (data) {
    console.log(data)
    addressTemp = data["results"][0]["formatted_address"]
    d3.select("#from_places").attr("value", `${addressTemp}`)

  });


  // Click the map -- get the location 

  var circle = L.circle([current_lat, current_lng], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 800
  }).addTo(mymap);
  // // Binding a pop-up to our marker
  circle.bindPopup("Hello There!");
}



// function for filter

function renderMap(filter_condition) {


  // clear out the map
  var container = L.DomUtil.get('map');
  if (container != null) {
    container._leaflet_id = null;
  }

  navigator.geolocation.getCurrentPosition(function (lation) {
    // async

    var current_loc = new L.LatLng(lation.coords.latitude, lation.coords.longitude)

    var mymap = L.map('map').setView(current_loc, 13)
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: API_KEY
    }).addTo(mymap)



    var x = document.getElementById("demo");

    function getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);

      } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
      }
    }

    function showPosition(position) {
      x.innerHTML = "Latitude: " + position.coords.latitude +
        "<br>Longitude: " + position.coords.longitude;
      current_lat = position.coords.latitude
      current_lng = position.coords.longitude

      var circle = L.circle([current_lat, current_lng], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
      }).addTo(mymap);

      // // Binding a pop-up to our marker
      circle.bindPopup("Hello There!");
    }


    // end here

    d3.json("imageserver.geojson", function (data) {
      L.geoJson(data, {
        filter: function (feature, layer) {
          return feature.properties.limitingmag == filter_condition;
        }
      }).addTo(mymap)
    });
  }); // end navigator request

} // end render map


//  filter based on limiting mag

d3.select('#filter_dropdown').on('change', function () {
  userin = d3.select(this).property('value');
  // re-render my Map
  renderMap(userin)
  console.log(userin)
})


// google map location

$(function () {
  // add input listeners
  google.maps.event.addDomListener(window, 'load', function () {
    var from_places = new google.maps.places.Autocomplete(document.getElementById('from_places'));
    var to_places = new google.maps.places.Autocomplete(document.getElementById('to_places'));
    google.maps.event.addListener(from_places, 'place_changed', function () {
      var from_place = from_places.getPlace();
      var from_address = from_place.formatted_address;
      $('#origin').val(from_address);
    });
    google.maps.event.addListener(to_places, 'place_changed', function () {
      var to_place = to_places.getPlace();
      var to_address = to_place.formatted_address;
      $('#destination').val(to_address);
    });
  });

  function callback(response, status) {
    if (status != google.maps.DistanceMatrixStatus.OK) {
      $('#result').html(err);
    } else {
      var origin = response.originAddresses[0];
      var destination = response.destinationAddresses[0];
      if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
        $('#result').html("Better get on a plane. There are no roads between " + origin + " and " + destination);
      } else {
        var distance = response.rows[0].elements[0].distance;
        var duration = response.rows[0].elements[0].duration;
        console.log(response.rows[0].elements[0].distance);
        var distance_in_kilo = distance.value / 1000; // the kilom
        var distance_in_mile = distance.value / 1609.34; // the mile
        var duration_text = duration.text;
        var duration_value = duration.value;
        $('#in_mile').text(distance_in_mile.toFixed(2));
        $('#in_kilo').text(distance_in_kilo.toFixed(2));
        $('#duration_text').text(duration_text);
        $('#duration_value').text(duration_value);
        $('#from').text(origin);
        $('#to').text(destination);
      }
    }
  }
  // calculate distance
  function calculateDistance() {
    var origin = $('#origin').val();
    var destination = $('#destination').val();
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
      origins: [origin],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING,
      // we can change later https://developers.google.com/maps/documentation/javascript/distancematrix#travel_modes
      unitSystem: google.maps.UnitSystem.IMPERIAL, // miles and feet.
      // unitSystem: google.maps.UnitSystem.metric, // kilometers and meters.
      avoidHighways: false,
      avoidTolls: false
    }, callback);
  }
  // get distance results
  function callback(response, status) {
    if (status != google.maps.DistanceMatrixStatus.OK) {
      $('#result').html(err);
    } else {
      var origin = response.originAddresses[0];
      var destination = response.destinationAddresses[0];
      if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
        $('#result').html("Better get on a plane. There are no roads between " + origin + " and " + destination);
      } else {
        var distance = response.rows[0].elements[0].distance;
        var duration = response.rows[0].elements[0].duration;
        console.log(response.rows[0].elements[0].distance);
        var distance_in_kilo = distance.value / 1000; // the kilom
        var distance_in_mile = distance.value / 1609.34; // the mile
        var duration_text = duration.text;
        var duration_value = duration.value;
        $('#in_mile').text(distance_in_mile.toFixed(2));
        $('#in_kilo').text(distance_in_kilo.toFixed(2));
        $('#duration_text').text(duration_text);
        $('#duration_value').text(duration_value);
        $('#from').text(origin);
        $('#to').text(destination);
      }
    }
  }
  // print results on submit the form
  $('#distance_form').submit(function (e) {
    e.preventDefault();
    calculateDistance();
  });
});