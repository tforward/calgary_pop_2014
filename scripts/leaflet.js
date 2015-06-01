/* global L */ // JS Hint

"use strict";

var map;
var lat = 51.0204;
var lng = -114.0505;
var zoom = 11;
var geojson;
var lastClickedLayer;


var OpenStreetMap_BaW = L.tileLayer("http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png", {
    minZoom: 11,
    attribution: "<a href=\"https://www.linkedin.com/in/tristanforward\">Creator</a>&nbsp|&nbsp<a href=\"https://data.calgary.ca/OpenData/Pages/DatasetDetails.aspx?DatasetID=PDC0-99999-99999-00737-P%28CITYonlineDefault%29\">Metadata</a>&nbsp&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
});

function initmap() {
    // set up the map
    map = new L.Map("map");

    // Lock the map
    var maxBoundsSouthWest = new L.LatLng(50.665131428416146, -114.62310791015625);
    var maxBoundsNorthEast = new L.LatLng(51.37349493730543, -113.477783203125);
    var maxBoundsArea = new L.LatLngBounds(maxBoundsSouthWest, maxBoundsNorthEast);
    map.setMaxBounds(maxBoundsArea);

    map.setView(new L.LatLng(lat, lng), zoom);
    map.addLayer(OpenStreetMap_BaW);
}

initmap();

//STYLE
function getColor(d) {
    return d > 7000  ? "#084081" :
        d > 6000 	 ? "#0868ac" :
        d > 5000 	 ? "#2b8cbe" :
        d > 4000 	 ? "#4eb3d3" :
        d > 3000 	 ? "#7bccc4" :
        d > 2000 	 ? "#a8ddb5" :
        d > 1000     ? "#ccebc5" :
        d > 1        ? "#e0f3db" :
        			   "#f7fcf0";
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.DENSITY),
        weight: 2,
        opacity: 0.7,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.4
    };
}

//MOUSE
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: "#666",
        dashArray: "",
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

function clickHighlightFeature(e) {
    if (lastClickedLayer) {
        geojson.resetStyle(lastClickedLayer);
    }
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: "#666",
        dashArray: "",
        fillOpacity: 0.7
    });

    info.update(layer.feature.properties);
    lastClickedLayer = layer;
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: clickHighlightFeature
    });
}

geojson = L.geoJson(calgary_neighbourhoods, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

//TitleCase Function
function toTitleCase(str) {
    return str.replace(/([^\W_]+[^\s/]*) */g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

//INFO
var info = L.control();

info.onAdd = function() {
    this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function(props) {
    this._div.innerHTML = "<h4>Calgary 2014</h4><h4>Population Density</h4> " + (props ?
        "<strong>" + toTitleCase(props.NAME) + "</strong>" + "<br><strong>" + props.DENSITY + " Calgarians / km<sup>2</sup>" + "</strong>" : "Select a community");
};

info.addTo(map);

//LEGEND
var legend = L.control({
    position: "bottomright"
});

legend.onAdd = function() {

    var div = L.DomUtil.create("div", "info legend"),
        grades = [0, 1, 1000, 2000, 3000, 4000, 5000, 6000, 7000];
        
    // loop through our density intervals and generate a label with a coloured square for each interval
    div.innerHTML += "<strong>Calgarians / km<sup>2</sup></strong><br>";
    for (var i = 0; i < grades.length; i++) {
        if (grades[i] === 0){
            div.innerHTML += "<i style=\"background:" + getColor(grades[i] + 1) + "\"></i> " + grades[i] + (grades[i + 1] ? "<br>" : "+");
        }
        else{
            div.innerHTML += "<i style=\"background:" + getColor(grades[i] + 1) + "\"></i> " + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        }
    return div;
};

legend.addTo(map);
