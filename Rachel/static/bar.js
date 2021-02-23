$(document).ready(function() {
    makeMap();

    $('#region').change(function() {
        regionFilter();
    })

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
            // createFilter()
            buildBarZip(data);
            buildBarReason(data);

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}

function regionFilter() {

    var region = $('#region').val();

    buildBarZip();

}

function createFilter() {
    var northWD = ["75075", "75093", "75080", "75252", "75287", "75007", "75248", "75001", "75006", "75019", "75240", "75254", "75244", "75234", "75063", "75251", "75230", "75229", "75225", "75220", "75205", "75209", "75235", "75219", "75021", "75280", "75044", "75024", "75221", "75081", "75244", "78254", "76244", "75057", "75056", "75281", "78216", "76092", "75289", "75038", "75082", "75250", "752203832", "75220-1314", "752302426", "752096384", "75201-2206", "75230-6114", "75720", "7229", "7520-1", "75013", "72535"];
    var southWD = ["75247", "75207", "75212", "75208", "75211", "75050", "75051", "75224", "75233", "75236", "75052", "75232", "75237", "75116", "75249", "75115", "75104", "75037", "75061", "78232", "75213", "75181", "752124029", "75212-4112", "15751"];
    var northED = ["75243", "75231", "75238", "75206", "75214", "75218", "75228", "75150", "75182", "75043", "75088", "75089", "75098", "75173", "75087", "75032", "75223", "75204", "75028", "75256", "75041", "75049", "75039", "77006", "75243-4217", "752435219", "75228-3007", "75228-6371", "752062802"];
    var southED = ["75203", "75216", "75241", "75215", "75210", "75227", "75217", "75180", "75253", "75159", "75126", "75201", "75202", "75226", "75246", "75261", "75270", "75030", "75239", "75149", "75034", "75042", "75146", "75217-2360", "75216-6751", "75236-1078", "75127", "752172042", "73253", "75134"];

    var regions = [
        { "North West Dallas": northWD },
        { "South West Dallas": southWD },
        { "North East Dallas": northED },
        { "South East Dallas": southED, }
    ]

    regions.forEach(function(i) {
        var nOption = `<option>${regions[i]}</option>`;
        $('#region').append(nOption);
        console.log(regions[3]);
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

    var northWD = ["75075", "75093", "75080", "75252", "75287", "75007", "75248", "75001", "75006", "75019", "75240", "75254", "75244", "75234", "75063", "75251", "75230", "75229", "75225", "75220", "75205", "75209", "75235", "75219", "75021", "75280", "75044", "75024", "75221", "75081", "75244", "78254", "76244", "75057", "75056", "75281", "78216", "76092", "75289", "75038", "75082", "75250", "752203832", "75220-1314", "752302426", "752096384", "75201-2206", "75230-6114", "75720", "7229", "7520-1", "75013", "72535"];
    var southWD = ["75247", "75207", "75212", "75208", "75211", "75050", "75051", "75224", "75233", "75236", "75052", "75232", "75237", "75116", "75249", "75115", "75104", "75037", "75061", "78232", "75213", "75181", "752124029", "75212-4112", "15751"];
    var northED = ["75243", "75231", "75238", "75206", "75214", "75218", "75228", "75150", "75182", "75043", "75088", "75089", "75098", "75173", "75087", "75032", "75223", "75204", "75028", "75256", "75041", "75049", "75039", "77006", "75243-4217", "752435219", "75228-3007", "75228-6371", "752062802"];
    var southED = ["75203", "75216", "75241", "75215", "75210", "75227", "75217", "75180", "75253", "75159", "75126", "75201", "75202", "75226", "75246", "75261", "75270", "75030", "75239", "75149", "75034", "75042", "75146", "75217-2360", "75216-6751", "75236-1078", "75127", "752172042", "73253", "75134"];

    var colors = [];
    averages.forEach(function(i) {
        if (northED.includes(i.zipcode) == true) {
            colors.push("#00916E"); //green
        } else if (southED.includes(i.zipcode) == true) {
            colors.push("#FFCF00"); //yellow
        } else if (northWD.includes(i.zipcode) == true) {
            colors.push("#EE6123"); //orange
        } else if (southWD.includes(i.zipcode) == true) {
            colors.push("#FA003F"); //red
        } else {
            colors.push("black"); //error check
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
        yaxis: { title: "Inspection Scores" }
    }

    Plotly.newPlot('bar2', barPlot, layout);
}