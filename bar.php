<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Extrude polygons for 3D indoor mapping</title>
<meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
<link href="https://api.mapbox.com/mapbox-gl-js/v2.4.0/mapbox-gl.css" rel="stylesheet">
<script src="https://api.mapbox.com/mapbox-gl-js/v2.4.0/mapbox-gl.js"></script>
<style>
body { margin: 0; padding: 0; }
#map { position: absolute; top: 0; bottom: 0; width: 100%; }
</style>
</head>
<body>
<div id="map"></div>
<script>
	mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kcmVpLTA4MjEiLCJhIjoiY2tpd2Q4bjloM2k2NDJ2cWpqYWlraGp3NCJ9.wMnGsCCwvQv8kXTwQUmuGA';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-87.61694, 41.86625],
        zoom: 15.99,
        pitch: 40,
        bearing: 20,
        antialias: true
    });

    map.on('load', () => {
        map.addSource('floorplan', {
            'type': 'geojson',
            /*
             * Each feature in this GeoJSON file contains values for
             * `properties.height`, `properties.base_height`,
             * and `properties.color`.
             * In `addLayer` you will use expressions to set the new
             * layer's paint properties based on these values.
             */
            'data': './bar.geojson'
        });
        map.addLayer({
            'id': 'room-extrusion',
            'type': 'fill-extrusion',
            'source': 'floorplan',
            'paint': {
                // Get the `fill-extrusion-color` from the source `color` property.
                'fill-extrusion-color': ['get', 'color'],

                // Get `fill-extrusion-height` from the source `height` property.
                'fill-extrusion-height': ['get', 'height'],

                // Get `fill-extrusion-base` from the source `base_height` property.
                // 'fill-extrusion-base': ['get', 'base_height'],

                // Make extrusions slightly opaque to see through indoor walls.
                'fill-extrusion-opacity': 0.9
            }
        });
    });
</script>

</body>
</html>