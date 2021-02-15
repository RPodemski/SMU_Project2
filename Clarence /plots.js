var mydata;
// Reading Data From CSV
d3.csv('new_rest.csv').then(function(data) {
    mydata = data;
    //console.log(mydata)
    inspection_score = mydata.map(x => x.Inspection_Score);
    violation_total = mydata.map(x => x.vp_total);
    console.log(inspection_score);
    console.log(violation_total);

    // Create our first trace
    var trace1 = {
        x: inspection_score,
        y: violation_total,
        mode: "markers",
        marker: { color: 'red' },
        type: "scatter"
    };
    var layout = {
        title: "Inspection Score vs Violations Scatter Plot",

        xaxis: {
            autotick: false,
            range: [42, 105],
            title: "Inspection Score"
        },
        yaxis: {
            title: "Number of Violations"
        }

    };
    // The data array consists of one traces
    var data = [trace1];

    // Note that we omitted the layout object this time
    // This will use default parameters for the layout
    Plotly.newPlot("plot", data, layout);
})