$(document).ready(function() {
    makeGraph();

    $(window).resize(function() {
        makeGraph();
    });
});

function makeGraph() {
    var queryUrl = "https://www.dallasopendata.com/resource/vcg4-5wum.json?"

    $.ajax({
        type: "GET",
        url: queryUrl,
        data: {
            "$limit": 500, // change the # of inspections viewed.
            "$$app_token": SODA_APP_TOKEN,
        },
        success: function(data) {
            buildBarZip(data);
            buildBarReason(data);

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}

function restuarantFilter() {

    var restaurantInput = $('#restaurantInput').val().toUpperCase();

    var queryUrl = "https://www.dallasopendata.com/resource/vcg4-5wum.json?"

    $.ajax({
        type: "GET",
        url: queryUrl,
        data: {
            "$limit": 500, // change the # of inspections viewed.
            "$$app_token": SODA_APP_TOKEN,
            "program_identifier": `${restaurantInput}`
        },
        success: function(data) {
            buildBarZip(data);
            buildBarReason(data);

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}

function buildBarZip(data) {

    var zipCodes = data.map(x => x.zip_code);
    zipCodes = [...new Set(zipCodes)];

    //pull zipcodes and avg inspection scores into array
    var averages = [];
    zipCodes.forEach(function(zip) {
        var filterData = data.filter(x => x.zip_code == zip);
        var zip_scores = filterData.map(x => +x.inspection_score)
        var avg = zip_scores.reduce((a, b) => a + b, 0) / filterData.length
        averages.push({ "zipcode": zip, "avg_score": avg });
    });

    //sort avg inspection scores lowest to highest
    var averages = averages.sort(function(a, b) {
        return a.avg_score - b.avg_score;
    });

    var colors = [];
    averages.forEach(function(i) {
        if (i.avg_score >= 90) {
            colors.push("#00916E"); //green
        } else if (i.avg_score >= 80) {
            colors.push("#FFCF00"); //yellow
        } else if (i.avg_score >= 70) {
            colors.push("#EE6123"); //orange
        } else if (i.avg_score <= 69) {
            colors.push("#FA003F"); //red
        } else {
            colors.push("black"); //error check
        }
    });

    var barPlot = [{
        x: averages.map(x => x.zipcode),
        y: averages.map(x => x.avg_score),
        type: 'bar',
        name: 'North East Dallas',
        marker: {
            color: colors
        }
    }];

    var layout = {
        title: "Average Inspection Score per Zip Code",
        xaxis: {
            type: "category",
            tickangle: -60,

        },
        yaxis: {
            title: "Average Inspection Scores"
        }
    }

    Plotly.newPlot('bar', barPlot, layout);
}



function buildBarReason(data) {

    var reason = data.map(x => x.inspection_type);
    reason = [...new Set(reason)];

    var averages2 = [];
    reason.forEach(function(type) {
        var filterData2 = data.filter(x => x.inspection_type == type);
        var inspType = filterData2.map(x => +x.inspection_score)
        var avg = inspType.reduce((a, b) => a + b, 0) / filterData2.length
        averages2.push({ "reason": type, "avg_score": avg });
    });

    averages2 = averages2.sort(function(a, b) {
        return a.avg_score - b.avg_score;

    });

    var colors2 = [];
    averages2.forEach(function(i) {
        if (i.reason == "Routine") {
            colors2.push("#00916E");
        } else if (i.reason == "Follow-up") {
            colors2.push("#FFCF00");
        } else if (i.reason == "Complaint") {
            colors2.push("#FA003F");
        } else {
            colors2.push("black");
        }
    });

    var barPlot = [{
        x: averages2.map(x => x.reason),
        y: averages2.map(x => x.avg_score),
        type: 'bar',
        marker: {
            color: colors2
        }
    }];

    var layout = {
        title: "Average Inspection Score per Type of Inspection",
        xaxis: {
            type: "category"
        },
        yaxis: { title: "Average Inspection Scores" }
    }

    Plotly.newPlot('bar2', barPlot, layout);
}