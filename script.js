//Width and height
var width = window.innerWidth, height = window.innerHeight;


//Define map projection
/* var projection = d3.geoTransform({
    point: function(px, py) {
        this.stream.point(scale(px), scale(py));
    }
});*/

// var projection = d3.geoAlbersUsa()
//     .translate([width/2, height/2])
//     .scale([1000]);

var projection = d3.geoMercator()
    .center([-122.433701, 37.767683])
    .scale(200000)
    .translate([width / 2, height / 2]);


var scale = d3.scaleLinear()
    .range([0, width])
    .domain([0,1000]);

//Define path generator
var path = d3.geoPath().projection(projection);

//Create SVG element
var svg = d3.select("div.map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

console.log('test');
//Load in GeoJSON data
d3.json("https://raw.githubusercontent.com/alignedleft/d3-book/master/chapter_12/us-states.json", function(data) {
    //loadMap(data,"#ccc");
});

d3.json("https://wouterboomsma.github.io/ide2016/assignments/assignment5/sfpd_districts.geojson", function(data) {
    loadMap(data,"#fff");
});

function loadMap(data,color) {
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function (d) {
            console.log(d);
            return color;
        })
        .on("mouseover", function (d) {
            d3.select(this).style("fill", "grey");
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("District: <b>" + d.properties.district + "</b>")
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


function flash(name) {
    return function() {
        d3.select(this).append("text")
            .attr("class", name);
    };
}