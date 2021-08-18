function map_config(minValue,maxValue,heightFactor,exponentialValue){
	return {
		
		
		"popup_options":{
			"hover":"all",
			"click":"all"	
		},
		
		"popup_template":"envirosense/resources/templates/popup.html",
		"info_template":"envirosense/resources/templates/info.html",
		"defaults":{
			"stack_steps":12,
			"stack_radius_metres":20,
			"maxHeight":3000,
			"exponentialValue":1
		},
		"default_value":"TotalVoc",
		"columns":{
			"entity":"Entity Name",
			"timestamp":"Timestamp",
			"lat":"latitude",
			"lng":"longitude",
			"values":[
				"CO2_SVM" ,
				"Ethenol" ,
				"H2" ,
				"Humidity",
				"Part025" ,
				"Part100",
				"Temperature",
				"TotalVoc"
			]
			
			
		},
		"colours":["blue","green","yellow","brown","red"],
		
		"values":[
			{"name":"CO2_SVM","thresholds":[0,250,1001,2001,5000]} ,
			{"name":"Ethenol" },
			{"name":"H2"} ,
			{"name":"Humidity","thresholds":[0,30,50,70,86],"maxHeight":1000},
			{"name":"Part025" ,"thresholds":[0,11,16,21]},
			{"name":"Part100","thresholds":[0,21,26,31]},
			{"name":"Temperature","thresholds":[-40,0,21,31,36],"maxHeight":1000},
			{"name":"TotalVoc","thresholds":[0,101,151,201]}
		],
		
		"map_styles":{
			"point-data-circle":{
				'id': 'point-data-circle',
				'type': 'circle',
				'source': 'point-data',
				'layout': {
					'visibility': 'none'
				},
				'paint': {
					'circle-radius': [
						"interpolate",
						["linear"],
						["zoom"],
						8.9,
						4,
						16,
						8
					],
					'circle-color': [
						"case",
						["has", "Value"],
						["interpolate",
						["exponential", exponentialValue],
						["get", "Value"],
						minValue,
						"thistle",
						maxValue,
						"indigo"
						],
						"#fbf5f1"
					],
					'circle-opacity': 0.8,
					'circle-stroke-width': 1.2,
					'circle-stroke-color': '#333',
					'circle-pitch-alignment': 'map'
				}
			},
			"stack-circle":{
				'id': 'stack-circle',
				'type': 'line',
				'source': 'stacks',
				'layout': {},
				'paint': {
					'line-width': [
						"interpolate",
						["linear"],
						["zoom"],
						9,
						0.5,
						13,
						1.5
					],
					'line-color': 'indigo',
					'line-offset': [
						"interpolate",
						["linear"],
						["zoom"],
						9,
						-0.5,
						12,
						-2
					]
				}
			},

			"stack-extrusion":{
				'id': 'stack-extrusion',
				'type': 'fill-extrusion',
				'source': 'stacks',
				'layout': {},
				'paint': {
					'fill-extrusion-color': [
						"case",
						["has", "Value"],
						["interpolate",
						["exponential", exponentialValue],
						["get", "Value"],
						minValue,
						"thistle",
						maxValue,
						"indigo"
						],
						"grey"
					],
					'fill-extrusion-opacity': 0.8,
					'fill-extrusion-base': 1,
					'fill-extrusion-height': [
					"*",
					['to-number',[
						"get",
						"Value"
					]],
					heightFactor
				]
				}
			},

			"stack-extrusion-top":{
				'id': 'stack-extrusion-top',
				'type': 'fill-extrusion',
				'source': 'stacks',
				'layout': {
					//'visibility': 'none'
				},
				'paint': {
					'fill-extrusion-color': [
						"case",
						["==",["feature-state", "hover"], true],
						"#000",
						[
							"case",
							["has", "Value"],
							["interpolate",
							["exponential", exponentialValue],
							["get", "Value"],
							minValue,
							"thistle",
							maxValue,
							"indigo"
							],
							"grey"
						]
					],
					'fill-extrusion-opacity': 0.2,
					'fill-extrusion-base': 1,
					'fill-extrusion-height': [
						"*",
						['to-number',[
							"get",
							"Value"
						]],
						heightFactor
					]
				}
			},

			"point-data-label":{
				"id": "point-data-label",
				"type": "symbol",
				"source": "point-data",
				'min-zoom': 10.9,
				//'filter':["!has","Name"],
				"layout": {
					"text-field": ["get", "Name"],
					//"text-font": ["Open Sans Bold", "Arial Unicode MS Regular"],
					"text-font": ["Arial Bold"],
					"text-size": 9.6,
					//'text-allow-overlap': true,
					//'text-ignore-placement': true,
					//'icon-allow-overlap': true,
					//'icon-ignore-placement': true,
					//'text-anchor':'top',
					'text-variable-anchor': [
						"top",
						"bottom",
						"right",
						"left",
						//"bottom-right",
						//"bottom-left",
						//"top-right",
						//"top-left"
					],
					'text-radial-offset': [
						"interpolate",
						["linear"],
						["zoom"],
						10.9,
						0.8,
						13,
						0.8  //2
					],
					'text-line-height': 1.1
				},
				"paint": {
					"text-halo-color": "white",
					"text-halo-width": 1.2,
					"text-opacity": [
						"interpolate",
						["linear"],
						["zoom"],
						10.9,
						0,
						11,
						1
					],
					"text-color": 'indigo',
				}
			}
		}

	}
}

function spinner_options(){
	return  {
	  lines: 11, // The number of lines to draw
	  length: 38, // The length of each line
	  width: 17, // The line thickness
	  radius: 45, // The radius of the inner circle
	  scale: 0.7, // Scales overall size of the spinner
	  corners: 1, // Corner roundness (0..1)
	  speed: 1, // Rounds per second
	  rotate: 0, // The rotation offset
	  animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
	  direction: 1, // 1: clockwise, -1: counterclockwise
	  color: '#ffffff', // CSS color or array of colors
	  fadeColor: 'transparent', // CSS color or array of colors
	  top: '50%', // Top position relative to parent
	  left: '50%', // Left position relative to parent
	  shadow: '0 0 1px transparent', // Box-shadow for the lines
	  zIndex: 2000000000, // The z-index (defaults to 2e9)
	  className: 'spinner', // The CSS class to assign to the spinner
	  position: 'absolute', // Element positioning
	};	
}