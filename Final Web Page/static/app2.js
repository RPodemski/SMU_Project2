$(document).ready(function() {
    onInit();

    $(window).resize(function() {
        buildPlot();
    });
});

var restaurantsOnInit = ["CHIPOTLE MEXICAN GRILL", "OLIVE GARDEN"]

SODA_APP_TOKEN = "afgp8F50YbvDm9F5BPyQfdpuH"


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
            success: function(data, i) {
                data = data.sort((a, b) => new Date(b.inspection_date) - new Date(a.inspection_date))
                    //console.log(data);
                buildPlot(data, i);
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
    console.log(restaurantInput);

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

            //var myPlot = document.getElementById('plot'),
            if (typeof newTrace !== 'undefined') {
                Plotly.deleteTraces('plot', -1)
            }

            data2 = data2.sort((a, b) => new Date(b.inspection_date) - new Date(a.inspection_date))
                //console.log(data2)
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
            console.log(newTrace);
            Plotly.addTraces('plot', newTrace)

            //buildPlot(newTrace);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}

function buildPlot(data, i) { // , newTrace




    // colors = ['rgba(0, 145, 110, 1)', 'rgba(254, 239, 229, 1)', 'rgba(255, 207, 0, 1)', 'rgba(250, 3, 63, 1)']

    trace = {
        x: data.map(x => x.inspection_date),
        y: data.map(x => x.inspection_score),
        mode: 'lines+markers',
        name: restaurantsOnInit[i], // NOT WORKING
        text: data.map(x => x.zip_code),
        marker: {
            opacity: 0.5,
            size: 5
        },
        line: {
            width: .3,
            //color: colors[i]
        }

    }



    lines = [trace]

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
            // tickwidth: 2,
            // ticklen: 5,
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

    //console.log(lines)
    Plotly.plot('plot', lines, layout);
    //Plotly.deleteTraces('plot', [-2, -1])

}

// var restaurantInput = "WHATABURGER"; // default
// newRestaurant(restaurantInput);

// function handleSubmit() {
//     // Prevent the page from refreshing
//     Plotly.d3.event.preventDefault();

//     // Select the input value from the form
//     var restaurantInput = Plotly.d3.select("#restaurantInput").node().value;
//     restaurantInput = restaurantInput.toUpperCase()
//     console.log(restaurantInput)

//     // clear the input value
//     Plotly.d3.select("#restaurantInput").node().value = "";
//     console.log(restaurantInput)
//         // Build the plot with the new stock
//     newRestaurant(restaurantInput);
// }

// Plotly.d3.select("#submit").on("click", handleSubmit);