var map
var map_control={



	templates:{},
	

	/**
	 * create map
	 * call init when map loaded
	 * @function setup
	 */
	setup:function(params){
		$.extend(this,params)
		this.baseUrl="https://parallel.co.uk/"
		if(typeof Spinner!="undefined"){
			var opts=spinner_options()

			spinner = new Spinner(opts).spin();

			$(spinner.el).appendTo("body")
		}

		mapboxgl.accessToken = 'pk.eyJ1IjoicGFyYWxsZWwiLCJhIjoiY2phOXhjYmIxMGx6aTJxbmlzamExbXpnciJ9.BmsCrHoleI1xtpNchSAq5A'; //parallel

		var OSapiKey = 'FDVNWSS32qGrLqS79ANjZ7gC05a24e5f'; //parallel
		var OSserviceUrl = 'https://api.os.uk/maps/vector/v1/vts';

		map = new mapboxgl.Map({
		container: 'map',
		
		style: 'resources/os_map_styles/OS_VTS_3857_Greyscale.json',

		center: [-0.341,51.5476],
		zoom: 9.8,
		minZoom: 8,
		maxZoom: 15.9,
		maxBounds: [[-8.7, 49.8], [1.95, 60.9]],  // UK bounds - W,S,E,N
		hash: true,
		attributionControl: false,

		transformRequest: function(url){
			if(url.indexOf('api.os.uk') > -1){
				if(! /[?&]key=/.test(url) ) url += '?key=' + OSapiKey
					return {
						url: url + '&srs=3857'
					}
				} else {
					return {
						url: url
					}
		  	}
		}
	});

	var att=new mapboxgl.AttributionControl({position: 'bottom-right'})

	att._updateAttributions=function(){
		this._container.innerHTML="&copy; <a href=\"https://technocommconsulting.com\" target=\"_blank\" rel=\"noopener\">Technocomm</a> | <a href=\"https://parallel.co.uk\" target=\"_blank\" rel=\"noopener\">parallel</a> | OS OpenData | <a href=\"http://www.mapbox.com\" target=\"_blank\" rel=\"noopener\">Mapbox</a>"
	}
	map.addControl(att);
		
	map.addControl(new mapboxgl.NavigationControl({
		visualizePitch: true
	}));
	map.addControl(new mapboxgl.FullscreenControl());

	map.addControl(new mapboxgl.ScaleControl({position: 'bottom-right'}));

	map.addControl(new mapboxgl.GeolocateControl({
		showUserLocation: true,
		positionOptions: {
			enableHighAccuracy: true
		}
	}));
	map.on('load', $.proxy(function() {
		
		this.draw_layers()
		//$.when(load_map_images()).then($.proxy(function(d){
			$.when(this.init()).then($.proxy(function(d){

			
				//var hover_arr=["points","trail_points"]
				
				//setup_hover(hover_arr)
			
				if(typeof Spinner!="undefined"){
					spinner.stop()
				}
				$("#map_loading_div").remove()
			},this));
		//},this));
	},this));


	},
	draw_layers:function(){
		map.addSource('mapbox-dem', {
			'type': 'raster-dem',
			'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
			'tileSize': 512,
			'maxzoom': 14
		});
		map.addSource('mapbox-dem-raster', {
			'type': 'raster-dem',
			'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
			'tileSize': 512,
			'maxzoom': 14
		});

		map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
		
		map.setFog({
			  'range': [1, 12],
			  'color': 'white',
			  'horizon-blend': 0.8
		});

		map.addLayer({
			'id': 'sky',
			'type': 'sky',
			'paint': {
				// set up the sky layer to use a color gradient
				'sky-type': 'gradient',
				// the sky will be lightest in the center and get darker moving radially outward
				// this simulates the look of the sun just below the horizon
				'sky-gradient': [
				'interpolate',
				['linear'],
				['sky-radial-progress'],
				0.8,
				'rgba(135, 206, 235, 1.0)',
				1,
				'rgba(0,0,0,0.1)'
				],
				'sky-gradient-center': [0, 0],
				'sky-gradient-radius': 90,
				'sky-opacity': [
				'interpolate',
				['exponential', 0.1],
				['zoom'],
				5,
				0,
				22,
				1
				]
			}
		});
		
		map.addLayer({
			"id": "hillshading",
			"source": "mapbox-dem-raster",
			"type": "hillshade",
			"paint": {
				'hillshade-exaggeration': {
					'stops': [[8,0.8],[16,0.6]]
				}
			},
		}, 'OS/District_buildings/1');

		map.addLayer({
			"id": "OS/TopographicArea_1/Building/1_3D",
			"type": "fill-extrusion",
			"source": "esri",
			"source-layer": "TopographicArea_1",
			"filter": [
				"==",
				"_symbol",
				33
			],
			'minzoom': 15,
			"layout": {},
			"paint": {
				"fill-extrusion-color": "#cccccc",
				"fill-extrusion-height": [ "get", "RelHMax" ],
				"fill-extrusion-opacity": 0.68
			}
		},'OS/Names/Local/Hamlet (Local)');
		
		//adjust base style with water colours
		
	//	map.setPaintProperty('background', 'background-color', watercolour);
//		map.setPaintProperty('OS/Surfacewater/Regional/1', 'fill-color', watercolour);
//		map.setPaintProperty('OS/Surfacewater/Local', 'fill-color', watercolour);
		
		map.setPaintProperty('OS/Foreshore/1', 'fill-opacity', 0.25);
		map.setPaintProperty('OS/Foreshore/1', 'fill-outline-color', 'rgba(255,255,255,0)');
		map.setPaintProperty('OS/Waterlines/MLW', 'line-opacity', 0);

	},
	/**
	 * get config
	 * load templates
	 * get_site_geojson
	 * draw info_template
	 * @function init
	 */
	init:function(){
		return $.Deferred($.proxy(function(dfd){

			if(null!=map){
				this.map=map
			}

			this.config=$.extend(this.config,map_config())
			this.values_db=TAFFY(map_config().values)
			
			
			
			$.when(this.get_template("popup_template"),this.get_template("info_template")).then($.proxy(function(){
				this.setup_interface()
				 setup_hover("stack-extrusion-top")
				dfd.resolve()
			},this))
		},this)).promise()
	},
	setup_interface:function(){
		var template=this.templates["info_template"].toString()
		var params={"main":1}
		var str=Mustache.render("{{=[[ ]]=}}"+template,params)
		$(str).appendTo($("#info").removeClass("close"))
		
		var template=this.templates["info_template"].toString()
		var params={"input_template":1}
		this.input_template=Mustache.render("{{=[[ ]]=}}"+template,params)
		//create_search_control({"container":".search_box","autocomplete_position":{"my": "left top", "at": "left bottom"}});
		
		
			
		
		$(".option-toggle.switch").bind("click",function(e){option_toggle_click(e)})
		$(".option-toggle.left").bind("click",function(e){option_toggle_click(e)})
		$(".option-toggle.right").bind("click",function(e){option_toggle_click(e)})
		
		start_pitch_checker_when_ready()
		this.get_data()
	},
	get_data:function(){
		$.when(this.load_json()).then($.proxy(function(d){
			this.json=d
			this.prepare_data()
			this.draw_data()
		},this))
	},
	redraw_data:function(){
		this.prepare_data()
		this.draw_data()
	},
	clear_data:function(){
		reset_pitch_checker()
		if(null!=map.getSource("point-data")){
			map.getSource("point-data").setData({"type":"FeatureCollection","features":[]})
		}
		if(null!=map.getSource("stacks")){
			map.getSource("stacks").setData({"type":"FeatureCollection","features":[]})
		}
		if(null!=map.getLayer("point-data-circle")){
				map.removeLayer("point-data-circle")
		}
		if(null!=map.getLayer("point-data-label")){
				map.removeLayer("point-data-label")
		}
		if(null!=map.getLayer("stack-circle")){
				map.removeLayer("stack-circle")
		}
		if(null!=map.getLayer("stack-extrusion")){
				map.removeLayer("stack-extrusion")
		}
		if(null!=map.getLayer("stack-extrusion-top")){
				map.removeLayer("stack-extrusion-top")
		}

		
		
	},
	draw_data:function(){
		this.clear_data()
		
		if(null==map.getSource("point-data")){
			map.addSource('point-data', {
				type: "geojson",
				data:this.fc_points

			});
		}else{
			map.getSource("point-data").setData(this.fc_points)
		}
		
		if(null==map.getSource("stacks")){
			map.addSource('stacks', {
				type: "geojson",
				data:this.fc_circles

			});
		}else{
			map.getSource("stacks").setData(this.fc_circles)
		}
		//var max_bounds=map.getMaxBounds()
//		var max_bbox=[max_bounds._ne.lng,max_bounds._ne.lat,max_bounds._sw.lng,max_bounds._sw.lat]
//		var max_poly=turf.bboxPolygon(max_bbox)
//		max_bbox=turf.bbox(max_poly)
//		var bbox=turf.bbox(this.fc_points)
//		//map.fitBounds(bounds)
//		var bbox_poly=turf.bboxPolygon(bbox)
//		
//		var clipped=turf.bboxClip(bbox_poly, max_bbox);
//		bbox=turf.bbox(clipped)
//		
//		map.addSource('box', {
//				type: "geojson",
//				data:clipped
//
//			});
//		map.addLayer({
//				'id': 'box',
//				'type': 'line',
//				'source': 'box',
//				'layout': {},
//				'paint': {
//					'line-width': 10,
//					'line-color': 'red'
//					
//				}
//			})
//		var bounds=[[bbox[0],bbox[1]],[bbox[2],bbox[3]]]
//			var camera=map.cameraForBounds(bounds)
//			if(camera.zoom-0.5>=map.getMinZoom()){
//				camera.zoom=camera.zoom-0.5	
//			}
//			map.flyTo(camera)
		
		
		var styles=map_config(this.min_value,this.max_value,this.heightFactor,this.exponentialValue).map_styles
		var d=JSON.stringify(styles)
		d=d.split('"Name"').join('"__name"')
		d=d.split('"Value"').join('"__value"')
		styles=JSON.parse(d)
		
		var value_column=$(".value_holder select").val()	
		
	
		var matching=this.values_db({"name":value_column}).get()
			
		if(null!=matching[0].thresholds){
			
			var thresholds=matching[0].thresholds
			var colours=map_config().colours
			var expr=[].concat(styles["stack-extrusion"].paint["fill-extrusion-color"])
			
			var new_inter=[expr[2][0],expr[2][1],expr[2][2]]
			
			
			$.each(thresholds,function(index,item){
				new_inter.push(item)
				if(thresholds.length==colours.length){
					new_inter.push(colours[index])
				}else{
					new_inter.push(colours[index+1])
				}
			})
			expr[2]=new_inter
			styles["stack-extrusion"].paint["fill-extrusion-color"]=expr
			styles["stack-extrusion-top"].paint["fill-extrusion-color"][3]=expr
			styles["point-data-circle"].paint["circle-color"]=expr
			styles["point-data-label"].paint["text-color"]=expr
			styles["stack-circle"].paint["line-color"]=expr
			//[
//						"case",
//						["has", "Value"],
//						["interpolate",
//						["exponential", exponentialValue],
//						["get", "Value"],
//						minValue,
//						"thistle",
//						maxValue,
//						"indigo"
//						],
//						"grey"
//					]
		}
		
		map.addLayer(styles["point-data-circle"])
		map.addLayer(styles["point-data-label"])
		map.addLayer(styles["stack-circle"])
		map.addLayer(styles["stack-extrusion"])
		map.addLayer(styles["stack-extrusion-top"])
		
		fill_extrusion=null
	
		start_pitch_checker_when_ready()
	},
	prepare_data:function(){
		var get_lookups=0
		if(null==this.data_lookups){
			get_lookups=1
			this.data_lookups={
				"entity":[],
				"value":map_config().columns.values	
			}
		}
		var defaults=map_config().defaults
		var columns=map_config().columns
		var lat=columns.lat
		var lng=columns.lng
		var fc={"type":"FeatureCollection","features":[]}
		var fc_circles={"type":"FeatureCollection","features":[]}
		var min_value
		var max_value
		var exponentialValue=1
		
		var value_column=map_config().default_value
		
		if($(".value_holder select").length>0){
			value_column=$(".value_holder select").val()	
		}
		
		var name_column=value_column
		var entity_column=columns.entity
		
		var entity="0000000000002003"
		if($(".entity_holder select").length>0){
			entity=$(".entity_holder select").val()	
		}
		var self=this
		$.each(this.json,function(index,item){
			var properties=item
			if(get_lookups==1){
				if(self.data_lookups.entity.indexOf(properties[entity_column])==-1){
					self.data_lookups.entity.push(	properties[entity_column])
				}
			}
			if(properties[entity_column]==entity){
				if(null!=properties[lat]){
					if(null!=properties[name_column]){
						properties.__name=properties[name_column]
					}
					if(null!=properties[value_column]){
						properties.__value=properties[value_column]*1
					
						if(null==min_value){
							min_value=properties.__value
						}else{
							if(properties.__value<min_value){
								min_value=properties.__value
							}
						}
						if(null==max_value){
							max_value=properties.__value
						}else{
							if(properties.__value>max_value){
								max_value=properties.__value
							}
						}
					}
					var feature={"type":"Feature","id":index,"properties":item,"geometry":{"type":"Point","coordinates":[+item[lng],+item[lat]]}}
					fc.features.push(feature)
					var center = [].concat(feature.geometry.coordinates);
					var radius = defaults.stack_radius_metres/1000.0 ///0.125;
					var options = {steps: defaults.stack_steps, units: 'kilometers', properties: item};
					var circle_feature = turf.circle(center, radius, options);
					circle_feature.properties=item
		
					circle_feature.id=index
					fc_circles.features.push(circle_feature)
				}
			}

		})
		if(fc_circles.features.length>0){
			this.min_value=min_value
			this.max_value=max_value
			if(this.max_value==this.min_value){
				this.max_value=this.max_value+1	
			}
			this.fc_points=fc
			this.fc_circles=fc_circles
			var maxHeight=defaults.maxHeight
			
			
			var matching=this.values_db({"name":value_column}).get()
			
			if(null!=matching[0].maxHeight){
				maxHeight=matching[0].maxHeight
			}
			
			this.heightFactor=maxHeight/max_value
			this.exponentialValue=defaults.exponentialValue
			
			if(get_lookups==1){
				var template=this.input_template.toString()
				var params={"items":this.data_lookups.entity}
				var str=Mustache.render(template,params)	
				$(str).appendTo(".entity_holder")
				
				var template=this.input_template.toString()
				var params={"items":this.data_lookups.value}
				var str=Mustache.render(template,params)	
				$(str).appendTo(".value_holder")
				
				$(".entity_holder select").val(entity)
				$(".value_holder select").val(value_column)
				$("select.lookup").bind("change",$.proxy(function(){
					this.redraw_data()
				},this))
			}
		}
		
	},
	load_json:function(){
		return $.Deferred($.proxy(function(dfd){
			pth=this.cache_bust_url(this.baseUrl+"envirosense/resources/data/envirosense_data.json")
			$.ajax(pth,{
				"dataType":"json"
			}).done($.proxy(function(d){
			
				dfd.resolve(d)
			},this))
		},this)).promise()
	},
	/**
	 * load mustache template by template name set in config
	 * get_template
	 */
	get_template:function(template_name){

		return $.Deferred($.proxy(function(dfd){

			if(null==this.templates[template_name]){
				var pth=this.config[template_name]
				if(template_name=="popup_template"){
					this.base_template_path=pth.split("?")[0]
				}
				if(pth.indexOf("/resources")>-1){
					pth="/resources"+pth.split("/resources")[1]
				}else{
					if(pth.indexOf("/dev_resources")>-1){
						pth="/dev_resources"+pth.split("/dev_resources")[1]
					}
				}
				pth=this.cache_bust_url(this.baseUrl+"envirosense/resources/get/get_template.php?pth="+pth)
				$.ajax(pth,{
					"dataType":"text"
				}).done($.proxy(function(d){
					this.templates[template_name]=d.toString()
					dfd.resolve(d)
				},this))
			}else{
				dfd.resolve(this.templates[template_name].toString())
			}
		},this)).promise()

	},
	urldecode:function(url) {
	  return decodeURIComponent(url.replace(/\+/g, ' '));
	},
	cache_bust_url:function(url){
		var stamp=(new Date()).getTime()
		if(null!=url){
			if(url.indexOf("?")==-1){
				url+="?"
			}else{
				url+="&"
			}
			url+=stamp

			return url
		}else{
			return stamp
		}
	}
}
//
//var fill_extrusion
//var pitch_check_timer
//var previous_pitch
//var pitch_checker
//
//
//function start_pitch_checker_when_ready(){
//	start_pitch_checker()
//
//	previous_pitch=map.getPitch()-10
//	
//}
function check_pitch_buildings(){
	console.log("check_pitch")
	if(map.getPitch()==0){
		$(".option-toggle-holder.right").removeClass("right").addClass("left")
		
		map.setPaintProperty("OS/TopographicArea_1/Building/1_3D","fill-extrusion-height",1)
	}else{
		$(".option-toggle-holder.left").removeClass("left").addClass("right")
		map.setPaintProperty("OS/TopographicArea_1/Building/1_3D","fill-extrusion-height",[ "get", "RelHMax" ])
	}
}
//function start_pitch_checker(){
//	stop_pitch_checker()
//
//	check_pitch()
//	map.on("pitch",check_pitch)
//}
//function stop_pitch_checker(){
//	map.off("pitch",check_pitch)
//}
//function option_toggle_click(e){
//	stop_pitch_checker()
//	console.log(e)
//	var holder=$(e.target).parent()
//	var new_state
//	var old_state
//	var changed=0
//	if($(e.target).hasClass("switch")==true){
//		changed=1
//		if($(holder).hasClass("right")){
//			$(holder).removeClass("right").addClass("left")
//		}else{
//			$(holder).removeClass("left").addClass("right")
//		}
//	}else{
//		if($(e.target).hasClass("left")==true){
//			if($(holder).hasClass("left")==false){
//				$(holder).removeClass("right").addClass("left")
//				changed=1
//			}
//		}else{
//			if($(e.target).hasClass("right")==true){
//				if($(holder).hasClass("right")==false){
//					$(holder).removeClass("left").addClass("right")
//					changed=1
//				}
//			}
//		}
//	}
//	if(changed==1){
//		var val=get_option_toggle_value().toString()
//		console.log(val)
//
//		switch(val){
//			case "2d":
//				if(map.getPitch()>0){
//					map.once("pitchend",start_pitch_checker)
//					map.easeTo({"pitch":0})
//				}
//			break;
//			case "3d":
//				if(map.getPitch()==0){
//					var params={"pitch":40}
//					//if(map.getZoom()>10){
////						params.zoom=10
////					}
//					map.once("pitchend",start_pitch_checker)
//					map.easeTo(params)
//				}
//			break;
//
//		}
//		//displayBy(year)
//	}else{
//		start_pitch_checker()
//	}
//}
//function get_option_toggle_value(){
//	var ob=$(".option-toggle.switch")
//	var val=""
//	if($(ob).parent().hasClass("right")){
//		val=$(ob).attr("data-toggle-right")
//	}else{
//		val=$(ob).attr("data-toggle-left")
//	}
//	return val
//}



var fill_extrusion
	var pitch_check_timer
	var previous_pitch
	var pitch_checker


	function start_pitch_checker_when_ready(){
		pitch_check_timer=setInterval(function(){
			if(null!=map.getLayer("stack-extrusion")){
				if(null!=map.getLayer("stack-extrusion-top")){
					if(null!=map.getLayer("point-data-label")){
						clearInterval(pitch_check_timer)
						pitch_check_timer=null
						if(null==fill_extrusion){
							fill_extrusion=map.getPaintProperty("stack-extrusion","fill-extrusion-height")
						}

						start_pitch_checker()
					map.setFilter("point-data-label",["has","Name"])
						previous_pitch=map.getPitch()-10
						check_pitch_opacity()
						pitch_checker=setInterval(function(){check_pitch_opacity()},20)
					}
				}
			}
		},20)
	}
	function reset_pitch_checker(){
		stop_pitch_checker()
		if(null!=pitch_check_timer){
			clearInterval(pitch_check_timer)
			pitch_check_timer=null
		}
		if(null!=pitch_checker){
			clearInterval(pitch_checker)
			pitch_checker=null
		}
	}
	function check_pitch(){

		if(map.getPitch()==0){
			$(".option-toggle-holder.pitch.right").removeClass("right").addClass("left")
		}else{
			$(".option-toggle-holder.pitch.left").removeClass("left").addClass("right")
		}
	}
	function start_pitch_checker(){
		stop_pitch_checker()

		check_pitch()
		map.on("pitch",check_pitch)
	}
	function stop_pitch_checker(){
		map.off("pitch",check_pitch)
	}
	function option_toggle_click(e){
		stop_pitch_checker()

		var holder=$(e.target).parent()
		var new_state
		var old_state
		var changed=0
		if($(e.target).hasClass("switch")==true){
			changed=1
			if($(holder).hasClass("right")){
				$(holder).removeClass("right").addClass("left")
			}else{
				$(holder).removeClass("left").addClass("right")
			}
		}else{
			if($(e.target).hasClass("left")==true){
				if($(holder).hasClass("left")==false){
					$(holder).removeClass("right").addClass("left")
					changed=1
				}
			}else{
				if($(e.target).hasClass("right")==true){
					if($(holder).hasClass("right")==false){
						$(holder).removeClass("left").addClass("right")
						changed=1
					}
				}
			}
		}
		if(changed==1){
			var val=get_option_toggle_value().toString()


			switch(val){
				case "2d":
					if(map.getPitch()>0){
						map.once("pitchend",start_pitch_checker)
						map.easeTo({"pitch":0})
					}
				break;
				case "3d":
					if(map.getPitch()==0){
						var params={"pitch":40}
						if(map.getZoom()>10){
						//	params.zoom=10
						}
						map.once("pitchend",start_pitch_checker)
						map.easeTo(params)
					}
				break;

			}
			//displayBy(year)
		}else{
			start_pitch_checker()
		}
	}
	function get_option_toggle_value(){
	var ob=$(".option-toggle.switch")
	var val=""
	if($(ob).parent().hasClass("right")){
		val=$(ob).attr("data-toggle-right")
	}else{
		val=$(ob).attr("data-toggle-left")
	}
	return val
}
	/**
	 * Toggle certain layers when moving between 2D and 3D
	 * In 2D show area-outline, pwc-value and pwc-value-detail
	 * @function
	 */
	function check_pitch_opacity(){

		var new_hash=document.location.hash.toString()
		var new_pitch=map.getPitch()
		var layers="city,town,village,hamlet suburbs".split(",")
		if(new_pitch!=previous_pitch){
			previous_pitch=new_pitch

			if(previous_pitch >=5){
				//fade
				$.each(layers,function(index,item){
					if(null!=map.getLayer(item)){
						map.setPaintProperty(item, 'text-opacity',0);
						map.setPaintProperty(item, 'icon-opacity',0);
					}
				})
				if(typeof popup_control!="undefined"){
					 if(null!=popup_control.popup){
						 popup_control.clear_popup_cancel_freeze()
					 }
				 }
				if(null!=fill_extrusion){
					requestAnimationFrame(function(){
						console.log("requestAnimationFrame:1")
						map.setPaintProperty("stack-extrusion","fill-extrusion-height",fill_extrusion)
						map.setPaintProperty("stack-extrusion-top","fill-extrusion-height",fill_extrusion)
					})
				//map.setFilter("area-outline",["!has","msoa11cd"])
//				map.setFilter("pwc-value",["!has","msoa11cd"])
//				map.setFilter("pwc-value-detail",["!has","msoa11cd"])

				}
				map.setFilter("point-data-label",["!has","Name"])
				
			}else{
				 $.each(layers,function(index,item){
					if(null!=map.getLayer(item)){
						map.setPaintProperty(item, 'text-opacity',1);
						map.setPaintProperty(item, 'icon-opacity',1);
					}
				})
				requestAnimationFrame(function(){

					map.setPaintProperty("stack-extrusion","fill-extrusion-height",1)
					map.setPaintProperty("stack-extrusion-top","fill-extrusion-height",1)
				})
//				map.setFilter("area-outline",["has","msoa11cd"])
//				map.setFilter("pwc-value",["has","msoa11cd"])
//				map.setFilter("pwc-value-detail",["has","msoa11cd"])
				map.setFilter("point-data-label",["has","Name"])
				
				
			}
			check_pitch_buildings()
		}
		
	}