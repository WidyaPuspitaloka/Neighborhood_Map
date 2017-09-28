// Hardoced location
var museumLocations = [{
    name: 'Van Gogh Museum',
    location: {
      lat: 52.358416,
      lng: 4.881076
    }
  },
  {
    name: 'Anne Frank House',
    location: {
      lat: 52.375218,
      lng: 4.883977
    }
  },
  {
    name: 'Amsterdam Museum',
    location: {
      lat: 52.369983,
      lng: 4.889972
    }
  },
  {
    name: 'Micropia',
    location: {
      lat: 52.366908,
      lng: 4.912576
    }
  },
  {
    name: 'Moco Museum - Banksy Amsterdam',
    location: {
      lat: 52.35871,
      lng: 4.881902
    }
  },
  {
    name: 'Stedelijk Museum',
    location: {
      lat: 52.358011,
      lng: 4.879756
    }
  },
  {
    name: 'Rijksmuseum',
    location: {
      lat: 52.359998,
      lng: 4.885219
    }
  },
  {
    name: 'NEMO Science Museum',
    location: {
      lat: 52.374211,
      lng: 4.912339
    }
  },
  {
    name: 'EYE Filmmuseum',
    location: {
      lat: 52.384328,
      lng: 4.900809
    }
  },
  {
    name: 'Tropenmuseum',

    location: {
      lat: 52.362656,
      lng: 4.922299
    }
  }
];



var Museum = function(data) {
  this.name = ko.observable(data.name);
  this.visible = ko.observable(true);
  this.location = ko.observable(data.location);
  this.marker = data.marker;

} // close var Museum


var map;

function initMap() {

// Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 52.359998,
      lng: 4.885219
    },
    zoom: 13,
  });

  var infoWindow;
  var largeInfowindow = new google.maps.InfoWindow();


  // Style the markers a bit. This will be our listing marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');
  var bounds = new google.maps.LatLngBounds();


  for (var i = 0; i < museumLocations.length; i++) {
    // Get the position from the location array.
    var position = museumLocations[i].location;
    var name = museumLocations[i].name;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      name: name,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i,
    });

    var markers = [];

    markers.push(marker);
    museumLocations[i].marker = marker;

    // Extend boundary
    bounds.extend(marker.position);
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });

    map.fitBounds(bounds);
  }


runApp();

} // close initmap function

function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.setMarker = null;
    });


    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.name + ' &format=json&callback=wikiCallBack';
    $.ajax({
      url: wikiUrl,
      dataType: 'jsonp',
      success: function(data) {
        var articleDesc = data[2][0];
        if (articleDesc.length > 0) {
          infowindow.setContent('<div>' + marker.name + '</div>' + articleDesc)
        } else {
          infowindow.setContent('<div> There is no wikipedia description for this Spot </div>');
        }
      }
      // Fallback for failed request to get an article
    }).fail(function() {
      infowindow.setContent('<div>There is something wrong; No Desciption Could be Loaded' + '</div>');
    });

  } // close if

}  // close function populateinfowindow



function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21, 34));
  return markerImage;
}

var ViewModel = function() {
  var self = this;

  this.Query = ko.observable('');
  this.museumList = ko.observableArray([]);

  this.currentMuseum = ko.observable(null);

  museumLocations.forEach(function(museumItem) {
    self.museumList.push(new Museum(museumItem));

  });
  this.setMuseum = function(clickedMuseum) {
    console.log(clickedMuseum.marker); // clickedMuseum.marker
    self.currentMuseum(clickedMuseum);
  };


};

    // Places that should be visible, based on user input.
    self.filteredMuseums = ko.observableArray();

    // Create empty variable, which will give us the user's search
    self.query = ko.observable('');

    // Function to filter
    self.filter = function () {

        // First we remove everything from the visible list
        self.filteredMuseums.removeAll();

        // For each of the items in our allPlaces array...
        self.museumLocations.forEach(function(museumItem) {

            // First we remove the marker
            museumItem.marker.setVisible(false);

            // Then we compare the name of the place in the array, with the name in our search
            if (museumItem.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0) {

                // If its the same, we push the place in the visible array (which we cleared)
                self.filteredMuseums.push(museumItem);
            }
        });

        // Now we have the list of all the visible places, based on our query search
        self.filteredMuseums().forEach(function(museumItem) {

            // And we put the markers visible for these places
            museumItem.marker.setVisible(true);
        });
    };

function runApp() {
  ko.applyBindings(new ViewModel());
}