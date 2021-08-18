<html>
<head>
    <meta charset='utf-8' />
    <title>Display buildings in 3D</title>
    <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />
    <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.48.0/mapbox-gl.js'></script>
    <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.48.0/mapbox-gl.css' rel='stylesheet' />
    <script src='https://npmcdn.com/@turf/turf/turf.min.js'></script> 
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-csv/0.71/jquery.csv-0.71.min.js"></script>
    <link rel="stylesheet" type="text/css" href="./resources/css/styles.css">
    <style>
        select:focus-visible{
          outline: none;
        }
    </style>
</head>
<body>
<div id="filtering" style="">
  <label> Technical Filtering</label>
  <div>
    <label>Entity: </label>
    <select id="entity" onchange="console.log(this.value)">
    </select>
  </div>
  <div>
    <label>Value : </label>
    <select id="category">
      <option value="2">CO2_SVM</option>
      <option value="3">Ethenol</option>
      <option value="4">H2</option>
      <option value="5">Humidity</option>
      <option value="6">Part025</option>
      <option value="7">Part100</option>
      <option value="8">Temperature</option>
      <option value="9">TotalVoc</option>
    </select>
  </div>
  <div id="typeswitch">
    Map View: 2D
    <input type="checkbox" id="switch" onchange="console.log(this.checked)" />
    <label for="switch">Toggle</label>
    &nbsp; 3D
  </div>
  
</div>
<div id='map'></div>

<script>
var geoJson = [];
var colours = ["blue","green","yellow","brown","red"];
var wholeData = [];
var entities = {};


mapboxgl.accessToken = 'pk.eyJ1IjoicXVlMzIxNiIsImEiOiJjaWhxZmMxMDUwMDBzdXhsdWh0ZDkyMzVqIn0.sz3lHuX9erctIPE2ya6eCw';
// perc2color(50);
// getColorByTemp(0);
//************************* Calculating the color scheme by temperature with blue and red
function getColorByTemp (temp) {
  const maxTemp = 40;
  const minTemp = -20;
  const redVal = 255 / (maxTemp - minTemp) * (temp - minTemp);
  const blueVal = 255 / (maxTemp - minTemp) * (maxTemp - temp);
  color = "rgb("+redVal.toFixed(0)+', 0, ' + blueVal.toFixed(0) + ')';

  return color;
}

console.log(perc2color(25.3));
function perc2color(perc) {
  var r, g, b = 0;
  if(perc < 25) {
    g = 255;
    r = Math.round(10 * perc);
  }
  else {
    r = 255;
    g = Math.round(510 - 10* perc);
  }
  var h = r * 0x10000 + g * 0x100 + b * 0x1;
  color = '#' + ('000000' + h.toString(16)).slice(-6);
  return color;
}

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  center: [-0.7653, 51.6408],
  zoom: 16,
  pitch: 40,
  hash: true
});

const popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

$.ajax({
  type: "GET",  
  url: "./resources/data.csv",
  dataType: "text",       
  success: function(response)  
  {
    data = $.csv.toArrays(response);
    wholeData = [];

    for (x in data) {
      // if(x<2) break;
      array = data[x][0].split(';');
      entities[array[1]]= array[1];
      wholeData.push({
        date: array[0],
        entity: array[1],
        co2_svm: array[2],
        ethenol: array[3],
        h2: array[4],
        humidity: array[5],
        part025: array[6],
        part100: array[7],
        temperature: array[8],
        totalvoc: array[9],
        latitude: array[10],
        longitude: array[11]
      });

      if(array[10] === '') continue;
      if(array[11] === '') continue;
      coordinates = [array[11]*1, array[10]*1];

      datalist = {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": coordinates
        },
        "properties": {
          "height": (array[8])*1,
          "color" : perc2color(array[8]*1),
          "description": perc2color(array[8]*1)+array[8]
        }
      }
      geoJson.push(datalist);
    }

    entityOptions = "";
    for (key in entities) {
      entityOptions += "<option value = "+key+">"+key+"</option>";
    }
    $('#entity').html(entityOptions);

    map.on('load', function() {
      map.addLayer({
        'id': 'extrusion',
        'type': 'fill-extrusion',
        "source": {
          "type": "geojson",
          "data": {
            "type": "FeatureCollection",
            "features": []
          }
        },
        'paint': {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.9
        }
      });


      map.addLayer({
        "id": "total",
        'type': 'circle',
        'paint': {
          'circle-radius': {
            'base': 4,
            'stops': [
              [12, 2],
              [22, 180]
            ]
          },
          'circle-color': 'rgba(0,0,0,0)'
        },
        "source": {
          "type": "geojson",
          "data": {
            "type": "FeatureCollection",
            "features": geoJson
          }
        }
      });

      map.on('sourcedata', function(e) {
        if (e.sourceId !== 'total') return
        if (e.isSourceLoaded !== true) return

        var data = {
          "type": "FeatureCollection",
          "features": []
        }
        e.source.data.features.forEach(function(f) {
          var object = turf.centerOfMass(f);
          var center = object.geometry.coordinates
          var radius = 1;
          var options = {
            units: 'meters',
            properties: {
                height: f.properties.height,
                color: f.properties.color,
                description: f.properties.description
            }
          };
          data.features.push(turf.circle(center, radius, options))
        })
        map.getSource('extrusion').setData(data);
      })

//  Mouseover popup function
      

      map.on('mouseenter', 'extrusion', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;
         

        console.log(coordinates, description)
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
         
        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates).setHTML(description).addTo(map);
        });
         
        map.on('mouseleave', 'extrusion', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
        });
    });
  }   
});


// 3D Building display
setTimeout(function(){
  const layers = map.getStyle().layers;
  const labelLayerId = layers.find( (layer) => layer.type === 'symbol' && layer.layout['text-field']).id;

  map.addLayer({
    'id': 'add-3d-buildings',
    'source': 'composite',
    'source-layer': 'building',
    'filter': ['==', 'extrude', 'true'],
    'type': 'fill-extrusion',
    'minzoom': 15,
    'paint': {
      'fill-extrusion-color': '#aaa',
      'fill-extrusion-height': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15,
        0,
        15.05,
        ['get', 'height']
      ],
      'fill-extrusion-base': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15,
        0,
        15.05,
        ['get', 'min_height']
      ],
      'fill-extrusion-opacity': 0.6
      }
    },
    labelLayerId
  );
}, 2000)



</script>