//Width and height
var width = window.innerWidth, height = window.innerHeight;


//Define map projection (zoom in on san francisco)
var projection = d3.geoMercator()
    .center([-122.333701, 37.767683])
    .scale(280000)
    .translate([width / 2, height / 2]);


var scale = d3.scaleLinear()
    .range([0, width])
    .domain([0,1000]);

//Define path generator
var path = d3.geoPath().projection(projection);

//Create SVG element
var svg = d3.select("div.map")
    .append("svg")
    .attr("width", 1000)
    .attr("height", height);

var select = d3.select("div.select")
    .append("select")
    .on('change',onchange);

//Load in GeoJSON data
d3.json("https://wouterboomsma.github.io/ide2016/assignments/assignment5/sfpd_districts.geojson", function(data) {
    loadMap(data,"#fff");
});

//add selection option show all
var crimes = ["Show All"]

//Insert crimes into array
function getCategory(crime) {
    crimes.push(crime.properties.Category);
}

d3.json("https://wouterboomsma.github.io/ide2016/assignments/assignment5/sf_crime.geojson", function(data) {
    // get all categories of crimes, and remove duplicates
    data.features.forEach(getCategory);
    crimes = crimes.filter( function( item, index, inputArray ) {
        return inputArray.indexOf(item) == index;
    });
    loadSelection(crimes);
    loadCrime(data,"#fff");
});

//Add selection options given array of crimes
function loadSelection(crimes) {
    select.selectAll("option")
        .data(crimes)
        .enter()
        .append("option")
        .attr("value", function(d) {
            return d;
        })
        .html(function(d){return d});
}

// Selection onchange filter
function onchange() {
    selectValue = d3.select('select').property('value');
    if (selectValue == "Show All") {
        d3.selectAll("path.crime").attr("hidden",null);
    } else {
        filterCrime(selectValue)
    }
};

function filterCrime(crime) {
    d3.selectAll("path.crime").attr("hidden",true);
    d3.selectAll("path.crime").each(function(d) {
        category = d3.select(this).attr("category");
        if (category == crime){
            d3.select(this).attr("hidden",null);
        }
    });
}


function loadCrime(data) {
    var div = d3.select("body").append("div")
        .attr("class", "tooltipCrime")
        .style("opacity", 0);

    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class","crime")
        .attr("d", path)
        //.style("fill", "white")
        //attr("hidden",true)
        .attr("category", function(d){
            return d.properties.Category;
        })
        .style("opacity", 0.5)
        .on("mouseover", function (d) {
            console.log(d);
            d3.select(this).style("fill", "grey");
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Crime: <b>" + d.properties.Category + "</b>")
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

function loadMap(data,color) {
    var div = d3.select("body").append("div")
        .attr("class", "tooltipMap")
        .style("opacity", 0);

    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class","map")
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