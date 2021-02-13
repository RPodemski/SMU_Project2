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

var west_bound = -97.05; // Coords greater than this
var east_bound = -96.58; // Coords less than this
var north_bound = 32.90; // Coords less than this
var south_bound = 32.58; // Coords greater than this
// end global

$(document).ready(function() {
    makeMap();

    // EVENT LISTENERS //
    $("#selector").change(function() {
        makeMap();
    });

});


function makeMap() {

    var timeframe = $("#selector").val();
    var timeframe_text = $("#selector option:selected").text();
    $("#maptitle").text(`Last 5,000 Health Inspections in the year ${timeframe_text}`);

    var date_filter_url = `https://www.dallasopendata.com/resource/vcg4-5wum.json?$where=inspection_date between '${timeframe}'`

    // GET request
    $.ajax({
        type: "GET",
        url: date_filter_url,
        data: {
            "$limit": 5000, // change the # of inspections viewed.
            "$$app_token": SODA_APP_TOKEN,
            // "program_identifier": "STARBUCKS",
            // "inspection_date": ''
            // "zip_code": '75238'
        },
        success: function(data) {
            // console.log(data);

            buildMap(data);

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);

        }
    });
}

function buildMap(data) {
    $("#mapcontainer").empty();
    $("#mapcontainer").append(`<div id="map-id"></div>`);

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
    var bads = [];
    var okays = [];
    var goods = [];

    data.filter(d => d.lat_long.latitude).forEach(function(inspection) {
        var lat = +inspection.lat_long.latitude;
        var lng = +inspection.lat_long.longitude;
        var inspection_score = +inspection.inspection_score;

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
            marker.bindPopup(`<h5>Inspection Score: ${inspection.inspection_score}</h5>
        <hr>
        <h5>Name: ${inspection.program_identifier}</h5>
        <hr><h5>Violation: ${inspection.violation1_description}</h5>`)

            /////////////// SEND MARKER TO MAP /////////////////////
            marker_list.push(marker);
            bads.push(marker);
            heatmap_list.push([lat, lng, inspection_score]) // Heatmap [Lat, Long, Weight]
        }

        /////////////// INSPECTION SCORE < 90 ///////////////////
        else if ((inspection.inspection_score < 90) & (lng > west_bound) & (lng < east_bound) & (lat < north_bound) & (lat > south_bound)) {
            var marker = L.marker([lat, lng], {
                draggable: false,
                icon: orangeIcon,
            });
            marker.bindPopup(`<h5>Inspection Score: ${inspection.inspection_score}</h5>
        <hr>
        <h5>Name: ${inspection.program_identifier}</h5>
        <hr><h5>Violation: ${inspection.violation1_description}</h5>`)

            /////////////// SEND MARKER TO MAP /////////////////////
            marker_list.push(marker);
            okays.push(marker);
            heatmap_list.push([lat, lng, inspection_score]); // Heatmap [Lat, Long, Weight]

            /////////////// INSPECTION SCORE 90+ ///////////////////
        } else if ((lng > west_bound) & (lng < east_bound) & (lat < north_bound) & (lat > south_bound)) {
            var marker = L.marker([lat, lng], {
                draggable: false,
                icon: greenIcon,
            });
            marker.bindPopup(`<h5>Inspection Score: ${inspection.inspection_score}</h5>
        <hr>
        <h5>Name: ${inspection.program_identifier}</h5>`)

            /////////////// SEND MARKER TO MAP /////////////////////
            marker_list.push(marker);
            goods.push(marker);
            heatmap_list.push([lat, lng, inspection_score]); // Heatmap [Lat, Long, Weight]
        };
    });

    ////////////////////// CLUSTER BOIS ////////////////////////
    cluster_markers = L.markerClusterGroup({
        iconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();
            var c = ' marker-cluster-';
            if (childCount < 10) {
                c += 'small';
            } else if (childCount < 100) {
                c += 'medium';
            } else {
                c += 'large';
            }

            return new L.DivIcon({
                html: '<div><span>' + childCount + '</span></div>',
                className: 'marker-cluster' + c,
                iconSize: L.Point(30, 30),
            });
        },
        showCoverageOnHover: true,
        polygonOptions: {
            fillColor: '#FEF3EB',
            color: '#FEEFE5',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.5
        },
    });

    for (let i = 0; i < marker_list.length; i++) {
        var test = marker_list[i];
        cluster_markers.addLayer(L.marker([test._latlng.lat, test._latlng.lng], {
            draggable: false,
            icon: test.options.icon,
        }));
    };

    myMap.addLayer(cluster_markers);

    var good_group = L.layerGroup(goods);
    var okay_group = L.layerGroup(okays);
    var bad_group = L.layerGroup(bads);

    var marker_group = L.layerGroup(marker_list);
    var heat_layer = L.heatLayer(heatmap_list, {
        radius: 20,
        blur: 15,
        minOpacity: 0.25,
        gradient: { 0.4: '#00D8A6', 0.65: '#FFDA33', 1: '#FF2F63' },
    });
    heat_layer.addTo(myMap);

    var baseMaps = {
        "Light Mode": light_mode,
        "Dark Mode": dark_mode
    };

    var overlayMaps = {
        "Markers": marker_group,
        "Heatmap": heat_layer,
        "Clusters": cluster_markers,
        "Good Inspections": good_group,
        "Average Inspections": okay_group,
        "Bad Inspections": bad_group,
    };

    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Set up the legend
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        // Add min & max

        var legendInfo = "<h5 style=text-align:center;margin-top:0>Inspection Scores</h5>" +
            "<div>" +
            "<div style=display:inline-block;margin-right:5px>< 70</div>" +
            "<div class=grad style=display:inline-block;height:10px;width:100px;>      </div>" +
            "<div style=display:inline-block;margin-left:5px;>100 </div>" +
            "</div>";

        div.innerHTML = legendInfo;

        return div
    }

    legend.addTo(myMap);

}