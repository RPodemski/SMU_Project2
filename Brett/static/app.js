//global
var greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    shadowSize: [41, 41]
});

var orangeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    shadowSize: [41, 41]
});

var redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var start_date = '2020-01-01';
var end_date = '2020-12-31';

var west_bound = -97.05; // Coords greater than this
var east_bound = -96.58; // Coords less than this
var north_bound = 32.90; // Coords less than this
var south_bound = 32.58; // Coords greater than this


$(document).ready(function() {
    makeMap();

    // EVENT LISTENERS //

});

var date_filter_url = `https://www.dallasopendata.com/resource/vcg4-5wum.json?$where=inspection_date between '${start_date}' and '${end_date}'`

function makeMap() {
    var queryUrl = `https://www.dallasopendata.com/resource/vcg4-5wum.json?`

    // GET request
    $.ajax({
        type: "GET",
        url: date_filter_url,
        data: {
            "$limit": 2000, // change the # of inspections viewed.
            "$$app_token": SODA_APP_TOKEN,
            // "program_identifier": "STARBUCKS",
            // "inspection_date": ''
            // "zip_code": '75238'
        },
        success: function(data) {
            console.log(data);

            buildMap(data);

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);

        }
    });
}

function buildMap(data) {
    var dark_mode = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/dark-v10",
        accessToken: API_KEY
    });

    var light_mode = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    // INIT MAP
    var myMap = L.map("map-id", {
        center: [32.7767, -96.7970],
        zoom: 11,
        layers: [light_mode, dark_mode]
    });

    var marker_list = [];
    var heatmap_list = [];
    data.filter(d => d.lat_long.latitude).forEach(function(inspection) {
        var lat = +inspection.lat_long.latitude;
        var lng = +inspection.lat_long.longitude;
        var inspection_score = +inspection.inspection_score; // Converting Inspectoin Score to //#

        if (inspection_score < 70) {
            var inspection_score = 40
        } else if (inspection_score < 85) {
            var inspection_score = 5
        } else {
            var inspection_score = 0.1
        };

        /////////////// INSPECTION SCORE < 80 ///////////////////
        if ((inspection.inspection_score < 80) & (lng > west_bound) & (lng < east_bound) & (lat < north_bound) & (lat > south_bound)) {
            var marker = L.marker([lat, lng], {
                draggable: false,
                icon: redIcon,
            });
            marker.bindPopup(`<h3>Inspection Score: ${inspection.inspection_score}</h3>
        <hr>
        <h3>Name: ${inspection.program_identifier}</h3>
        <hr><h3>Violation: ${inspection.violation1_description}</h3>`)

            /////////////// SEND MARKER TO MAP /////////////////////
            marker_list.push(marker)
            heatmap_list.push([lat, lng, inspection_score]) // Heatmap [Lat, Long, Weight]
        } else if ((inspection.inspection_score < 90) & (lng > west_bound) & (lng < east_bound) & (lat < north_bound) & (lat > south_bound)) {
            var marker = L.marker([lat, lng], {
                draggable: false,
                icon: orangeIcon,
            });
            marker.bindPopup(`<h3>Inspection Score: ${inspection.inspection_score}</h3>
        <hr>
        <h3>Name: ${inspection.program_identifier}</h3>
        <hr><h3>Violation: ${inspection.violation1_description}</h3>`)

            /////////////// SEND MARKER TO MAP /////////////////////
            marker_list.push(marker)
            heatmap_list.push([lat, lng, inspection_score]); // Heatmap [Lat, Long, Weight]

            /////////////// INSPECTION SCORE 90+ ///////////////////
        } else if ((lng > west_bound) & (lng < east_bound) & (lat < north_bound) & (lat > south_bound)) {
            var marker = L.marker([lat, lng], {
                draggable: false,
                icon: greenIcon,
            });
            marker.bindPopup(`<h3>Inspection Score: ${inspection.inspection_score}</h3>
        <hr>
        <h3>Name: ${inspection.program_identifier}</h3>`)

            /////////////// SEND MARKER TO MAP /////////////////////
            marker_list.push(marker)
            heatmap_list.push([lat, lng, inspection_score]); // Heatmap [Lat, Long, Weight]
        };
    });

    ////////////////////// CLUSTER BOIS ////////////////////////

    cluster_markers = L.markerClusterGroup({
        iconCreateFunction: function(cluster) {
            return L.divIcon({ html: '<b>' + cluster.getChildCount() + '</b>' });
        },
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,

    });

    for (let i = 0; i < heatmap_list.length; i++) {
        var test = heatmap_list[i];
        cluster_markers.addLayer(L.marker([test[0], test[1]]));
    };



    myMap.addLayer(cluster_markers);
    ///////////// UGLY ///////////////////////////////////

    var marker_group = L.layerGroup(marker_list);
    var heat_layer = L.heatLayer(heatmap_list, {
        radius: 20,
        blur: 15,
        minOpacity: 0.25,
        gradient: { 0.4: 'lime', 0.65: 'pink', 1: 'red' },
    });
    heat_layer.addTo(myMap);


    // marker_group.addTo(myMap);

    var baseMaps = {
        "Light Mode": light_mode,
        "Dark Mode": dark_mode
    };

    var overlayMaps = {
        "Markers": marker_group,
        "Heatmap": heat_layer
    };

    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Set up the legend
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");


        // Add min & max
        var legendInfo = "<h3 style=text-align:center;margin-top:0>Inspection Scores</h3>" +
            "<div>" +
            "<div style=display:inline-block;margin-right:5px>Min</div>" +
            "<div class=grad style=display:inline-block;height:10px;width:100px;>      </div>" +
            "<div style=display:inline-block;margin-left:5px;>Max </div>" +
            "</div>";

        div.innerHTML = legendInfo;

        return div
    }

    legend.addTo(myMap);

}