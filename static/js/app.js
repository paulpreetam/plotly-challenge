// Plotly Challenge - app.js
// select the user input field
var idSelect = d3.select("#selDataset");
var demographtable = d3.select("#sample-metadata");
var barchart = d3.select("#bar");
var bubblechart = d3.select("#bubble");
var gaugechart = d3.select("#gauge");

// create a function to initially populate dropdown menubar
function init() {
	resetData();
	d3.json("data/samples.json").then((data => {
		data.names.forEach((name => {
			var option = idSelect.append("option");
			option.text(name);
		})); // close for inner forEach
		var initId = idSelect.property("value");
		plotCharts(initId)
	})); // close for outer forEach then()
} // close for init function

// create a function to reset divs to prepare for the new data
function resetData() {
	// clear the data
	demographtable.html("");
	barchart.html("");
	bubblechart.html("");
	gaugechart.html("");
}	// close resetData()

// create a function to read JSON and plot chart
function plotCharts(id) {
	d3.json("data/samples.json").then((data => {
		var individualmetadata = data.metadata.filter(participant => participant.id == id)[0];
		var wfreq = individualmetadata.wfreq;
		Object.entries(individualmetadata).forEach(([key, value]) => {
			var newList = demographtable.append("ul");
			newList.attr("class", "list-group list-group-flush");
			var listItem = newList.append("li");
			listItem.attr("class", "list-group-item p-1 demo-text bg-transparent");
			listItem.text(`${key}: ${value}`);
		});	// close for inner forEach loop	
		
	// Retrieve data for Plotting Charts
	// filter the samples for the ID chosen
	var individual_sample = data.samples.filter(sample => sample.id == id)[0];
	// create empty arrarys to store sample data
	var otuIds = [];
	var otuLabels = [];
	var sampleValues = [];
	
	// iterate through each key and value in the sample to retrieve data for plotting
	Object.entries(individual_sample).forEach(([key, value]) => {
		switch (key) {
			case "otu_ids":
				otuIds.push(value);
				break;
			case "sample_values":
				sampleValues.push(value);
				break;
			case "otu_labels":
				otuLabels.push(value);
				break;
			default:
				break;
		}	// close switch statement
	});	// close for forEach Loop
	
	// slice/reverse the arrays to get the top 10 values/labels/IDs
	var topOtuIds = otuIds[0].slice(0, 10).reverse();
	var topOtuLabels = otuLabels[0].slice(0, 10).reverse();
	var topSampleValues = sampleValues[0].slice(0, 10).reverse();
	
	// use the map function to store the IDs with the "OUT" for labelling Y-Axis
	var topOtuIdsFormatted = topOtuIds.map(otuID => "OTU " + otuID);
	
	// Bar chart Plot
	// create trace
	var traceBar = {
		x: topSampleValues,
		y: topOtuIdsFormatted,
		text: topOtuLabels,
		type: 'bar',
		orientation: 'h',
		marker: {
			color: 'rgb(29,145,192)'
		}
	};
	
	// create the data array for plotting
	var dataBar = [traceBar];	
	// define the plot layout
	var layoutBar = {
		height: 500,
		width: 600,
		font: {
			family: 'Quicksand'
		},
		hoverlabel: {
			font: {
				family: 'Quicksand'
			}
		},
		title: {
			text: `<b>Top OTUs for Test Subject ${id}</b>`,
			font: {
				size: 18,
			color: 'rgb(34,94,168)'
			}
		},
		xaxis: {
			title: "<b>Sample Values</b>",
			color: 'rgb(34,94,168)'
		},
		yaxis: {
			tickfont: { size: 14 }
		}
	};
	
	// plot the bar char to the "bar" divs
	Plotly.newPlot("bar", dataBar, layoutBar);
	
	// PLOT BUBBLE CHART
	// create trace
	var traceBubble = {
		x: otuIds[0],
		y: sampleValues[0],
		text: otuLabels[0],
		mode: 'markers',
		marker: {
			size: sampleValues[0],
			color: otuIds[0],
			colorscale: 'Y1GnBu'
		}
	};
	
	// create the data array for the plot
	var dataBubble = [traceBubble];
	// define the plot layout
	var layoutBubble = {
		font: {
			family: 'Quicksand'
		},
		hoverlabel: {
			family: 'Quicksand'
		},
		xaxis : {
			title: "<b>OTU ID</b>",
			color: 'rgb(34,94,168)'
		},
		yaxis : {
			title: "<b>Sample Values</b>",
			color: 'rgb(34,94,168)'
		},
		showlegend: false
	};
	
	// plot the bubble chart to the app div
	Plotly.newPlot('bubble', dataBubble, layoutBubble);
	
	// PLOT GAUGE CHART
	// if wfreq has a null value, make it 0 for calculating pointer later
	if (wfreq == null) {
		wfreq = 0;
	}
	
	// create an indicator trace for the guage chart
	var traceGauge = {
		domain: { x: [0,1], y:[0,1]},
		value: wfreq,
		type: "indicator",
		mode: "guage",
		guage: {
			axis: {
				range: [0, 9],
				tickmode: 'linear',
				tickfont: {
					size: 15
				}
			},
			bar: { color: 'rgba(8, 29, 88, 0)' }, 
			steps: [
				{ range: [0, 1], color: 'rbg(255, 255, 217)' },
				{ range: [1, 2], color: 'rbg(237, 248, 217)' },
				{ range: [2, 3], color: 'rbg(199, 233, 180)' },
				{ range: [3, 4], color: 'rbg(127, 205, 187)' },
				{ range: [4, 5], color: 'rbg(65, 182, 196)' },
				{ range: [5, 6], color: 'rbg(29, 145, 192)' },
				{ range: [6, 7], color: 'rbg(34, 94, 168)' },
				{ range: [7, 8], color: 'rbg(37, 52, 148)' },
				{ range: [8, 9], color: 'rbg(8, 29, 88)' },
			]
		}
	};
	
	// determine the angle for each wfreq segment on the chart
	var angle = (wfreq / 9) * 180;
	// calculate the end points for the triangle pointer path
	var degrees = 180 - angle, radius = .8;
	var radians = degrees * Math.PI / 180;
	var x = radius * Math.cos(radians);
	var y = radius * Math.sin(radians);
	// path: to create needle shape (triangle)
	var mainPath = 'M -.0 -0.25 L .0 0.025 L ',
		cX = String(x),
		cY = String(y),
	pathEnd = ' z';
	var path = mainPath + cX + " " + cY + pathEnd;
	guageColors = [
		'rgb(8, 29, 88)',
		'rgb(37, 52, 148)',
		'rgb(34, 94, 168)',
		'rgb(29, 145, 192)',
		'rgb(65, 182, 196)',
		'rgb(127, 205, 187)',
		'rgb(99, 233, 180)',
		'rgb(237, 248, 217)',
		'rgb(255, 225, 217)',
		'white'
	]

	// create a trace to draw the circle where the needle is centered
	var traceNeedleCenter = {
		type: 'scatter',
		showlegend: false,
		x: [0],
		y: [0],
		marker: { size:35, color: '850000'},
		name: wfreq,
		hoverlabel: 'name'
	};
	
	// create a data array from the two traces
	var dataGauge = [traceGauge, traceNeedleCenter];
	// define a layout for the chart
	var layoutGauge = {
		// draw the needle pointer shape using path defined above
		shapes: [{
			type: 'path',
			path: path,
			fillcolor: '850000',
			line: {
				color: '850000'
			}
		}],
		font: {
			family: 'Quicksand'
		},
		hoverlabel: {
			font: {
				family: 'Quicksand',
				size: 16
			}
		},
		title: {
			text: `<b>Test Subject ${id}</b><br><b>Belly Button Washing Frequency</b><br><br>Scrubs per Week`,
			font: {
				size: 18,
				color: 'rgb(34, 94, 168)'
			},
		},
		height: 500,
		width: 500,
		xaxis: {
			zeroline: false,
			showticklabels: false,
			showgrid: false,
			range: [-1, 1],
			fixedrange: true // disable zoom
		},
		yaxis: {
			zeroline: false,
			showticklabels: false,
			showgrid: false,
			range: [-0.5, 1.5],
			fixedrange: true // disable zoom
		}
	};
	
	// plot the guage chart
	Plotly.newPlot('gauge', dataGauge, layoutGauge);
	}))	; // close for outer forEach then()
};	// close for plotCharts function

// if there is a change in the drop down select menu, this function is called with the ID as a parameter
function optionChanged(id) {
	// reset the data
	resetData();
	// plot the charts for this id
	plotCharts(id);
}; // close optionChanged function

// call the init() function for the default data
init();


