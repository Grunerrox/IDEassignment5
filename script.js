//Width and height
var width = window.innerWidth, height = window.innerHeight;
width = 1000, height = 1000;

//Define map projection (zoom in on san francisco)
var projection = d3.geoMercator()
    .center([-122.4337, 37.7677])
    .scale(280000)
    .translate([width / 2, height / 2]);


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

var select = d3.select("div.select")
    .append("select")
    .attr("class", "form-control crime")
    .on('change', () => onchange('select.crime'));

var selectYear = d3.select("div.selectYear")
    .append("select")
    .attr("class", "form-control year")
    .on('change', () => onchange('select.year'));

//Load in GeoJSON dataj
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

function getYears(date) {
    //console.log(date);
    var year = convertDate(date.properties.Dates);
    console.log(year);
    years.push(year);
}

d3.json("https://wouterboomsma.github.io/ide2016/assignments/assignment5/sf_crime.geojson", function (data) {
    // get all categories of crimes, and remove duplicates
    data.features.forEach(getCategory);
    crimes = crimes.filter(function (item, index, inputArray) {
        return inputArray.indexOf(item) == index;
    });

    data.features.forEach(getYears);
    years = years.filter(function (item, index, inputArray) {
        return inputArray.indexOf(item) == index;
    }).sort();
    years = ["All years"].concat(years);

    loadSelection(crimes, select);
    loadSelection(years, selectYear);
    loadCrime(data, "#fff");
});

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

// Selection onchange filter
function onchange(divClass) {
    console.log(divClass);
    selectValue = d3.select(divClass).property('value');

    if (divClass == 'select.year') {
        list = years
        if (selectValue == list[0]) {
            d3.selectAll("path.crime").attr("hidden", null);
        } else {
            filterYear(selectValue)
        }
    } else {
        list = crimes;
        if (selectValue == list[0]) {
            d3.selectAll("path.crime").attr("hidden", null);
        } else {
            filterCrime(selectValue)
        }
    }


};

function filterCrime(crime) {
    d3.selectAll("path.crime").attr("hidden", true);
    d3.selectAll("path.crime").each(function (d) {
        category = d3.select(this).attr("category");
        if (category == crime) {
            d3.select(this).attr("hidden", null);
        }
    });
}

function filterYear(selectedYear) {
    d3.selectAll("path.crime").attr("hidden", true);
    d3.selectAll("path.crime").each(function (d) {
        year = d3.select(this).attr("year");
        if (year == selectedYear) {
            d3.select(this).attr("hidden", null);
        }
    });
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
            return convertDate(d.properties.Dates);
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
                "Year: <b>" + convertDate(d.properties.Dates))
                .style("opacity", 1);
        });
}

function convertDate(date) {
    var d = new Date(date);
    return d.getFullYear();
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
