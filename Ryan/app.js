var restaurantsOnInit = ["CHIPOTLE MEXICAN GRILL", "OLIVE GARDEN"];

SODA_APP_TOKEN = "afgp8F50YbvDm9F5BPyQfdpuH";

var initData = [];

$(document).ready(function() {
    onInit();

});



function onInit() {

    var queryUrl = "https://www.dallasopendata.com/resource/vcg4-5wum.json?"
        // Perform a GET request to the query URL

    for (i = 0; i < restaurantsOnInit.length; i++) {

        $.ajax({
            type: "GET",
            url: queryUrl,
            data: {
                "$limit": 55000, // change the # of inspections viewed.
                "$$app_token": SODA_APP_TOKEN,
                "program_identifier": restaurantsOnInit[i],
                // "inspection_date": ''
                // "zip_code": '75238'
            },
            success: function(data) {
                data = data.sort((a, b) => new Date(b.inspection_date) - new Date(a.inspection_date))
                initData.push(data);

                if (initData.length == restaurantsOnInit.length) {
                    buildPlot();
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert("Status: " + textStatus);
                alert("Error: " + errorThrown);
            }
        });
    }

}

function newRestaurant() {

    var restaurantInput = $('#restaurantInput').val().toUpperCase();

    var queryUrl = "https://www.dallasopendata.com/resource/vcg4-5wum.json?";
    // Perform a GET request to the query URL
    $.ajax({
        type: "GET",
        url: queryUrl,
        data: {
            "$limit": 500, // change the # of inspections viewed.
            "$$app_token": SODA_APP_TOKEN,
            "program_identifier": `${restaurantInput}`
                // "inspection_date": ''
                // "zip_code": '75238'
        },
        success: function(data2) {

            if (data2 === 'undefined' || data2.length == 0) {
                alert("Restaurant can not be found.");
            }

            if (typeof newTrace !== 'undefined') {
                Plotly.deleteTraces('plot', -1)
            }

            data2 = data2.sort((a, b) => new Date(b.inspection_date) - new Date(a.inspection_date))

            newTrace = {
                x: data2.map(x => x.inspection_date),
                y: data2.map(x => x.inspection_score),
                mode: 'lines+markers',
                name: restaurantInput,
                text: data2.map(x => x.zip_code),
                marker: {
                    opacity: 1,
                    size: 7
                },
                line: {
                    color: 'rgba(0, 145, 110, 2)'
                }
            }

            Plotly.addTraces('plot', newTrace)
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}

function buildPlot() { // , newTrace
    var lines = [];

    for (i = 0; i < initData.length; i++) {
        var data = initData[i];

        colors = ['#EE6123', '#FA003F']

        trace = {
            x: data.map(x => x.inspection_date),
            y: data.map(x => x.inspection_score),
            mode: 'lines+markers',
            name: restaurantsOnInit[i],
            text: data.map(x => x.zip_code),
            marker: {
                opacity: 0.5,
                size: 5
            },
            line: {
                color: colors[i],
                width: .5,
            }

        }

        lines.push(trace);
    }

    var layout = {
        title: 'Inspection Scores Over Time',
        hovermode: "closest",
        xaxis: {
            title: 'Date',
            titlefont: {
                family: 'Arial',
                size: 22,
                color: 'rgb(82, 82, 82)'
            },
            showline: true,
            showgrid: false,
            linecolor: 'rgb(204,204,204)',
            linewidth: 2,
            ticks: 'outside',
            tickcolor: 'rgb(204,204,204)',
            tickfont: {
                family: 'Arial',
                size: 12,
                color: 'rgb(82, 82, 82)'
            }

        },
        yaxis: {
            title: 'Inspection Score',
            titlefont: {
                family: 'Arial',
                size: 22,
                color: 'rgb(82, 82, 82)'
            },
        }
    };

    Plotly.plot('plot', lines, layout);

}