const degreePerBaseTile = 360 / 512; // 844/1201
const dem3Size = 1201;
const size = Math.floor(degreePerBaseTile * dem3Size);

///////////////////////////////////////////////////////////

function getLatPixels(lat) {
	let retLat = 90 - lat;
	return retLat * dem3Size;
}
function getLngPixels(lng) {
	let retLng = 180 + lng;
	return retLng * dem3Size;
}
function getTilePixels(y) {
	return y * 256;
}
function getTileNumber(y) {
	return Math.floor(y / 512);
}
function getTileY(lat, zoom) {
	let latPx = getLatPixels(lat);
	let y = Math.floor(latPx / size);
	return y;
}
function getTileX(lng, zoom) {
	let lngPx = getLngPixels(lng);
	let x = Math.floor(lngPx / size);
	return x;
}
function getLat(y, zoom) {
	let d = Math.pow(2, 9 - zoom);
	let lat = 90 - (y * degreePerBaseTile);
	return lat;
}
function getLng(x, zoom) {
	let d = Math.pow(2, 9 - zoom);
	let lng = (x * degreePerBaseTile) - 180;
	return lng;
}

///////////////////////////////////////////////////////////

L.CRS.custom = L.extend({}, L.CRS.EPSG4326, {
    project: function (latlng) { // (LatLng) -> Point
        let x = getTileX(latlng.lng, 9);
        let y = getTileY(latlng.lat, 9);
        let myPoint = L.point(getTilePixels(x), getTilePixels(y));
        console.log("latlng : "+latlng.lat+", "+latlng.lng+"  |  "+myPoint.x+", "+myPoint.y);
        return L.point(x, y);
    },
    unproject: function (p) { // (Point) -> latLng
        let latlng = this.projection.unproject(p);
        let mylatlng = L.latLng(90 - p.y * degreePerBaseTile, p.x * degreePerBaseTile - 180);
        console.log("point : "+p.x+", "+p.y+"  |  "+mylatlng.lat+", "+mylatlng.lng);
        return mylatlng;
    }
});

let a = L.CRS.custom.project(L.latLng(44, -2));
L.CRS.custom.unproject(a);

let mymap = L.map( 'mapid', {
	crs: L.CRS.EPSG4326,
	center: [0, 0],
	minZoom: 0,
	maxZoom: 8,
	zoom: 8
});

/*let markers = new L.FeatureGroup();
mymap.addLayer(markers);*/

/*let p = L.CRS.custom.project(L.latLng(44, -2), 9);
console.log("Project 44, -2 : " + Math.floor(p.y) + ", " + Math.floor(p.x));
let unp = L.CRS.custom.unproject(L.point(p.x, p.y), 9);
console.log("Unproject p : " + unp);*/

L.TileLayer.custom = L.TileLayer.extend({
	crs: L.CRS.EPSG4326,
	center: [0, 0],
	minZoom: 0,
	maxZoom: 8,
	zoom: 8,
    getTileUrl: function(coords) {
        console.log("COORDS : " + coords.x + ", " + coords.y);
        let url = "http://localhost:3000/tile/" + coords.z + "/" + coords.x + "/" + coords.y + ".png";
        console.log("URL "+url);
        return url;
    }
});

L.tileLayer.custom = function() {
    return new L.TileLayer.custom();
}

L.tileLayer.custom().addTo(mymap);

let ZoomViewer = L.Control.extend({
	onAdd: function(){
		let gauge = L.DomUtil.create('div');
		gauge.style.width = '200px';
		gauge.style.background = 'rgba(255,255,255,0.5)';
		gauge.style.textAlign = 'left';
		mymap.on('zoomstart zoom zoomend', function(ev){
			gauge.innerHTML = 'Zoom level: ' + mymap.getZoom();
		})
		return gauge;
	}
});

(new ZoomViewer).addTo(mymap);

mymap.setView([44, -1.5], mymap.getMaxZoom());
//mymap.setView([26, 86], mymap.getMaxZoom());

