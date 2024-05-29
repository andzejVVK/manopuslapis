var map = L.map('map').setView([54.6872, 25.2797], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var marker1, marker2, polyline, backupPolyline;

map.on('click', function(e) {
    if (!marker1) {
        marker1 = L.marker(e.latlng).addTo(map);
    } else if (!marker2) {
        marker2 = L.marker(e.latlng).addTo(map);
        getRoute();
    } else {
        marker1.remove();
        marker2.remove();
        if (polyline) {
            polyline.remove();
        }
        if (backupPolyline) {
            backupPolyline.remove();
        }
        marker1 = L.marker(e.latlng).addTo(map);
        marker2 = null;
    }
});

document.getElementById('search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var query = document.getElementById('search-input').value;
    searchPlace(query);
});

function searchPlace(query) {
    fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query))
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data && data.length > 0) {
            var place = data[0];
            map.setView([place.lat, place.lon], 13);
            if (!marker1) {
                marker1 = L.marker([place.lat, place.lon]).addTo(map);
            } else if (!marker2) {
                marker2 = L.marker([place.lat, place.lon]).addTo(map);
                getRoute();
            } else {
                marker1.setLatLng([place.lat, place.lon]);
                getRoute();
            }
        } else {
            alert('No results found.');
        }
    })
    .catch(function(error) {
        console.log('Error:', error);
    });
}

function getRoute() {
    var latlngs = [marker1.getLatLng(), marker2.getLatLng()];
    var routingUrl = 'https://router.project-osrm.org/route/v1/driving/' + 
                     latlngs[0].lng + ',' + latlngs[0].lat + ';' + 
                     latlngs[1].lng + ',' + latlngs[1].lat + '?overview=full&alternatives=true&geometries=geojson';
    
    fetch(routingUrl)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        var routeGeometry = data.routes[0].geometry.coordinates.map(function(coord) {
            return [coord[1], coord[0]]; //[lat, lng]
        });

        var backupRouteGeometry = data.routes.length > 1 ? data.routes[1].geometry.coordinates.map(function(coord) {
            return [coord[1], coord[0]]; //[lat, lng]
        }) : null;

        if (polyline) {
            polyline.remove();
        }
        polyline = L.polyline(routeGeometry, {color: 'blue'}).addTo(map);

        if (backupPolyline) {
            backupPolyline.remove();
        }
        if (backupRouteGeometry) {
            backupPolyline = L.polyline(backupRouteGeometry, {color: 'red'}).addTo(map);
        }

        var distance = data.routes[0].distance / 1000; // km
        var duration = data.routes[0].duration; // sekundes

        var walkDuration = (distance / 5) * 3600; // 5 km/h
        var bikeDuration = (distance / 20) * 3600; // 20 km/h
        var carDuration = duration; // iskarto i sekundes pervedzia

        document.getElementById('result').innerHTML = 'Atstumas: ' + distance.toFixed(2) + ' km<br>' +
            'Laikas:<br>' +
            'Pesčiom: ' + formatDuration(walkDuration) + '<br>' +
            'Su Dvirku: ' + formatDuration(bikeDuration) + '<br>' +
            'Su mašina: ' + formatDuration(carDuration);
    })
    .catch(function(error) {
        console.log('Error:', error);
    });
}

function formatDuration(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    return hours + ' val ' + minutes + ' min';
}
