//Width and height
var width = window.innerWidth, height = window.innerHeight;

//Define map projection
/* var projection = d3.geoTransform({
    point: function(px, py) {
        this.stream.point(scale(px), scale(py));
    }
});*/

var projection = d3.geoAlbersUsa()
    .translate([width/2, height/2])
    .scale([500]);

var scale = d3.scaleLinear()
    .range([0, width])
    .domain([0,1000]);

//Define path generator
var path = d3.geoPath()
    .projection(projection);

//Create SVG element
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);



//Load in GeoJSON data
d3.json("https://wouterboomsma.github.io/ide2016/assignments/assignment5/sfpd_districts.geojson", function(data) {
    console.log(data);

    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d) {
            return "#ccc";

        });
});