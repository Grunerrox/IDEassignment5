//Width and height
var width = window.innerWidth, height = window.innerHeight;
width = 1000, height = 1000;

//Define map projection (zoom in on san francisco)
var projection = d3.geoMercator()
    .center([-122.4337, 37.7677])
    .scale(280000)
    .translate([width / 2, height / 2]);

// Set scaling
var scale = d3.scaleLinear()
    .range([0, width])
    .domain([0, 1000]);

//Define path generator
var path = d3.geoPath().projection(projection);

//Create SVG element
var svg = d3.select("div.map")
    .append("svg")
    .attr("width", 1000)
    .attr("height", height);

var margin = {top: 20, right: 20, bottom: 200, left: 40},
    width = 950 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svgBar = d3.select(".barplot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g");

var tooltipBar = d3.select("body").append("div")
    .attr("class", "tooltipBar")
    .style("opacity", 0);

//Load in GeoJSON data
d3.json("https://wouterboomsma.github.io/ide2016/assignments/assignment5/sfpd_districts.geojson", function (data) {
    loadMap(data, "#fff");
});

//add selection option show all
var crimes = ["All crimes"]

//Insert crimes into array
function getCategory(crime) {
    crimes.push(crime.properties.Category);
}

//add selection option show all
var years = [];

function getYears(element) {
    //console.log(date);
    var year = convertDateToYear(element.properties.Dates);
    years.push(year);
    element.properties['Year'] = year.toString();
    return element;
}

d3.json("https://wouterboomsma.github.io/ide2016/assignments/assignment5/sf_crime.geojson", function (data) {
    // get all categories of crimes, and remove duplicates
    data.features.forEach(getCategory);
    crimes = crimes.filter(function (item, index, inputArray) {
        return inputArray.indexOf(item) == index;
    });

    data.features.forEach(getYears);
    //console.log(data);
    years = years.filter(function (item, index, inputArray) {
        return inputArray.indexOf(item) == index;
    }).sort();
    years = ["All years"].concat(years);

    // Create selection filters
    selections(data);

    // plot the data
    plot(data);
    barChart(data);
});


function updateBarplot(data){
    d3.selectAll("rect.bar").remove();
    d3.selectAll(".barchart.axis--x").remove();
    d3.selectAll(".barchart.axis--y").remove();
    barChart(data);
}

// Plot crimes
function plot(data) {
    loadCrime(data, "#fff");
}

// Update changes in data in the plot
function updatePlot(data) {
    d3.selectAll("path.crime").remove();
    plot(data);
}

function selections(data) {
    var filters = { years: { name: 'Year', selected: 'All years' }, crimes: { name: 'Category', selected: 'All crimes' } };

    var selectCrime = d3.select("div.select")
        .append("select")
        .attr("class", "form-control crime")
        .on('change', function () { filters.crimes.selected = getSelectedValue(this); onchange(); });

    var selectYear = d3.select("div.selectYear")
        .append("select")
        .attr("class", "form-control year")
        .on('change', function () { filters.years.selected = getSelectedValue(this); onchange(); });


    // Selections
    loadSelection(crimes, selectCrime);
    loadSelection(years, selectYear);

    // On seletion change
    function onchange() {
        // Cheating way of copying an object
        var newData = JSON.parse(JSON.stringify(data));

        // Get the filters and ... filter
        Object.keys(filters).forEach(filterKey => {
            newData.features = filterData(newData.features, filters[filterKey].selected, filters[filterKey].name);
            //console.log(newData);
        });
        updatePlot(newData);
        updateBarplot(newData);
    }
}

// Filter the data
function filterData(array, filterId, filterType) {
    if (filterId == 'All years' || filterId == 'All crimes')
        return array;
    //console.log(filterId, filterType);
    array = array.filter(function (elem, i, array) {
        return array[i].properties[filterType] === filterId
    }
    );
    return array;
}

function getSelectedValue(selector) {
    return d3.select(selector).property('value')
}

//Add selection options given array of crimes
function loadSelection(data, option) {
    option.selectAll("option")
        .data(data)
        .enter()
        .append("option")
        .attr("value", function (d) {
            return d;
        })
        .html(function (d) { return d });
}

// convert a date to year
function convertDateToYear(date) {
    var d = new Date(date);
    return d.getFullYear();
}

function loadCrime(data) {
    var div = d3.select(".map").append("div")
        .attr("class", "tooltipCrime")
        .style("opacity", 0);
    var divSelect = d3.select(".map").append("div")
        .attr("class", "tooltipCrimeSelected")
        .style("opacity", 0);

    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class", "crime")
        .attr("d", path)
        //.style("fill", "white")
        //attr("hidden",true)
        .attr("category", function (d) {
            return d.properties.Category;
        })
        .attr("year", function (d) {
            return convertDateToYear(d.properties.Dates);
        })
        .style("opacity", 0.5)
        .on("mouseover", function (d) {
            //console.log(d);
            d3.select(this).style("fill", "#009688");
            divSelect.style("opacity", "0")
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Crime: <b>" + d.properties.Category + "</b><br/>" +
                "Address: <b>" + d.properties.Address + "</b><br/>" +
                "Week day: <b>" + d.properties.DayOfWeek + "</b><br/>" +
                "Resolution: <b>" + d.properties.Resolution + "</b><br/>")
                //.style("left", (d3.event.pageX) + "px")
                //.style("top", (d3.event.pageY) + "px")
                .attr("position", "absolute")
                .style("left", "10px")

                .style("top", "10px");
        })
        .on("mouseleave", function () {
            d3.select(this).style("fill", "white");
            div.transition()
                .duration(500)
                .style("opacity", 0);
            divSelect.style("opacity", 1);
        })
        .on("click", function (d) {
            d3.selectAll("path.crime")
                .classed("selected", false);
            d3.select(this).classed("selected", true);
            divSelect.html("Crime: <b>" + d.properties.Category + "</b><br/>" +
                "Address: <b>" + d.properties.Address + "</b><br/>" +
                "Week day: <b>" + d.properties.DayOfWeek + "</b><br/>" +
                "Resolution: <b>" + d.properties.Resolution + "</b><br/>" +
                "District: <b>" + d.properties.PdDistrict + "</b><br/>" +
                "Year: <b>" + convertDateToYear(d.properties.Dates))
                .style("opacity", 1);
        });
}

function loadMap(data, color) {
    var div = d3.select("body").append("div")
        .attr("class", "tooltipMap")
        .style("opacity", 0);

    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class", "map")
        .attr("d", path)
        .style("fill", function (d) {
            return color;
        })
        .on("mouseover", function (d) {
            d3.select(this).style("fill", "grey");
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("District: <b>" + d.properties.PdDistrict + "</b>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
        })
        .on("mouseleave", function () {
            d3.select(this).style("fill", "white");
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

function filterJSON(json, key, value) {
    var result = {};
    for (var explosionIndex in json) {
        if (json[explosionIndex][key] === value) {
            result[explosionIndex] = json[explosionIndex];
        }
    }
    return result;
}

function barChart(data) {
    //console.log(data)
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 200, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    svgBar
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Creating object with category and number of frequency
    data = data.features;
    var obj = [{}]
    var dict = {}
    data.forEach((d) => {
        key = d.properties.Category;
        if (key in dict){
            dict[key] = dict[key]+1;
        } else {
            dict[key] = 1;
        }
    });

    var i = 0;
    for (var category in dict) {
        obj[i] = {x : category, y: dict[category]};
        i++;
    }

    x.domain(obj.map(function(d) { return d.x; }));
    y.domain([0, d3.max(obj, function(d) { return d.y; })]);

    // append the rectangles for the bar chart
    svgBar.selectAll(".bar")
        .data(obj)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.x);})
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.y); })
        .attr("height", function(d) { return height - y(d.y); })
        .on("mouseover", function (d) {
            tooltipBar.transition()
                .duration(200)
                .style("opacity", .9);
            tooltipBar.html("Number: <b>" +d.y + "</b>")
                .style("left", (d3.event.pageX - 28) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltipBar.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // add the x Axis
    svgBar.append("g")
        .attr("class", "barchart axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 5)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    // add the y Axis
    svgBar.append("g")
        .attr("class", "barchart axis--y")
        .call(d3.axisLeft(y).ticks(10, "r"))
}
