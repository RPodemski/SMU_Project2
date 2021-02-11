$(document).ready(function() {
    makeMap();

    $(window).resize(function() {
        makeMap();
    });
});

function makeMap() {
    var queryUrl = "https://www.dallasopendata.com/resource/vcg4-5wum.json?"

    $.ajax({
        type: "GET",
        url: queryUrl,
        data: {
            "$limit": 100, // change the # of inspections viewed.
            "$$app_token": SODA_APP_TOKEN,
        },
        success: function(data) {
            // console.log(data);
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

    var averages = [];
    zipCodes.forEach(function(zip) {
        var filterData = data.filter(x => x.zip_code == zip);
        var zip_scores = filterData.map(x => +x.inspection_score)
        var avg = zip_scores.reduce((a, b) => a + b, 0) / filterData.length
        averages.push({ "zipcode": zip, "avg_score": avg });
    });

    averages = averages.sort(function(a, b) {
        return a.avg_score - b.avg_score;
    });

    var northED = ["75230", "75216", "75224"];
    var southED = ["75208"];
    var northWD = ["75212"];
    var southWD = ["75241"];


    var colors = [];
    averages.forEach(function(i) {
        if (northED.includes(i.zipcode) == true) {
            colors.push("green");
        } else if (southED.includes(i.zipcode) == true) {
            colors.push("blue");
        } else if (northWD.includes(i.zipcode) == true) {
            colors.push("purple");
        } else if (southWD.includes(i.zipcode) == true) {
            colors.push("pink");
        } else {
            colors.push("black");
        }
    });

    var barPlot = [{
        x: averages.map(x => x.zipcode),
        y: averages.map(x => x.avg_score),
        type: 'bar',
        marker: {
            color: colors
        }
    }];

    var layout = {
        title: "Average Inspection Score per Zip Code",
        xaxis: {
            type: "category",
            tickangle: -60
        },
        yaxis: { title: "Inspection Scores" }
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
            colors2.push("green");
        } else if (i.reason == "Follow-up") {
            colors2.push("blue");
        } else if (i.reason == "Complaint") {
            colors2.push("purple");
        } else {
            colors2.push("black");
        }
    });

    var barPlot = [{
        x: averages2.map(x => x.reason),
        y: averages2.map(x => x.avg_score),
        type: 'bar',
        marker: {
            color: colors2,
        }
    }];

    var layout = {
        title: "Average Inspection Score per Type of Inspection",
        xaxis: {
            type: "category"
        },
        yaxis: { title: "Inspection Scores" }
    }

    Plotly.newPlot('bar2', barPlot, layout);
}