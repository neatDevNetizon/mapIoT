var popup
var popup_template
var popup_fixed=0
var popup_layer
var popup_feature
var popup_feature_next
function setup_hover(pl){
	popup_layer=pl
	popup_template=map_control.templates.popup_template
				
	let hovered = [];
		window.addEventListener('mousemove', function(e) {
		//	if(popup_fixed!=0){
//				return	
//			}
popup_feature_next=null
			if(null==map.getLayer(popup_layer)){
				return
			}
			e.point = new mapboxgl.Point(e.clientX, e.clientY);
			const features = map.queryRenderedFeatures(e.point, { layers: [popup_layer] });

			map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

			for (const feature of hovered) {
				map.setFeatureState(feature, {
					'hover': false
				});
			}

			const seen = {};
			hovered = features;
			if(hovered.length==0){
				if(popup_fixed==0){
					map.getCanvas().style.cursor=""
					remove_popup()	
				}
				//popup_control.popup_extrusion_event(e)
			}
			let i = 0;
			for (const feature of hovered) {
				if (seen[feature.id]) continue;

				seen[feature.id] = true;
				map.setFeatureState(feature, {
					'hover': i === 0 ? true : false
				});
				if(i===0){
					if(popup_fixed==0){
					show_popup(e,feature,"hover")
					}else{
						popup_feature_next=feature
					}
					//popup_control.popup_extrusion_event(e,feature)
				}
				i++;
			}
		});
		
	// map.on('mouseenter', function (e) {
//		map.getCanvas().style.cursor = 'pointer';
//	});
//	map.on('mouseleave', 'victvs-locations', function (e) {
//		map.getCanvas().style.cursor = '';
//	});
//	map.on('click', 'victvs-locations', function (e) {
//		if(null==e.features[0].properties.cluster){
//
//			//this.select_point(e)
//			console.log(e.features[0].properties)
//			if(null!=popup){
//				popup.remove()
//			}
//			var props=[]
//			for(var p in e.features[0].properties){
//				if(p!="title"){
//				props.push("<br/>"+p+": "+e.features[0].properties[p])
//				}
//			}
//			var txt=map_control.popup_text(e.features[0].properties)
//			popup = new mapboxgl.Popup({ closeOnClick: false })
//.setLngLat(e.features[0].geometry.coordinates)
//.setHTML(txt)
//.addTo(map);
//		}
//	});	
}
function show_popup(e,feature,event_type){
	if(popup_fixed!=1){
		if(null!=map_control.config.popup_options[event_type]){
			var lnglat=map.unproject(e.point)
			var point=map.project(lnglat)
			var previous_h=null
			e={"point":point}
			if(null!=popup){
				if(popup_fixed==2){
					if(null!=popup._container){
						previous_h=popup._container.clientHeight*1	
					}else{
						previous_h=10	
					}
				}
				popup.remove()
			}
			var props={}
			var used_props=[]
			for(var p in feature.properties){
				if(null!=feature.properties[p]){
					
					if(feature.properties[p]!="null"){
						if(used_props.indexOf(p.toLowerCase())==-1){
							used_props.push(p.toLowerCase())
							if(p.indexOf("_arr")>-1 && typeof feature.properties[p]=="string"){
								props[p]=JSON.parse(feature.properties[p])
							}else{
								
								props[p]=feature.properties[p]
							}
						}
						
					}
				}
				
			}
			popup_feature=feature
			
			var txt=popup_text(props,map_control.config.popup_options[event_type])
			popup = new mapboxgl.Popup({ closeOnClick: false ,"maxWidth":"500px"})
			.setLngLat(lnglat)
			.setHTML(txt)
			.addTo(map);
			var popup_anchor=""
			if($(".mapboxgl-popup-anchor-top").length>0 || $(".mapboxgl-popup-anchor-top-left").length>0 || $(".mapboxgl-popup-anchor-top-right").length>0){
				if($(".mapboxgl-popup").position().top+$(".mapboxgl-popup").height()>$("#map").height()){
					if(e.point.x<$("#map").height()/2.0){
						popup_anchor="left"	
					}else{
						popup_anchor="right"	
					}
				}
			}
			if(popup_anchor!=""){
				popup.remove()
				popup = new mapboxgl.Popup({ closeOnClick: false ,"maxWidth":"500px","anchor":popup_anchor})
				.setLngLat(lnglat)
				.setHTML(txt)
				.addTo(map);
			}
			if(popup_fixed==2){
				$.when(map_control.load_slides()).then($.proxy(function(){
					previous_h=null
					if(null!=previous_h){
						check_popup_height(previous_h)
					}else{
					var popup_anchor=""
					if($(".mapboxgl-popup-anchor-top").length>0 || $(".mapboxgl-popup-anchor-top-left").length>0 || $(".mapboxgl-popup-anchor-top-right").length>0){
						if($(".mapboxgl-popup").position().top+$(".mapboxgl-popup").height()>$("#map").height()){
							if(e.point.x<$("#map").height()/2.0){
								popup_anchor="left"	
							}else{
								popup_anchor="right"	
							}
						}
					}
					if(popup_anchor!=""){
						popup.remove()
						popup = new mapboxgl.Popup({ closeOnClick: false ,"maxWidth":"500px","anchor":popup_anchor})
						.setLngLat(lnglat)
						.setHTML(txt)
						.addTo(map);
					}			
					}
				},this))
			}
										
			$(".mapboxgl-popup-close-button").bind("click",function(){
				popup_fixed=0
				remove_popup()
			})
			if(popup_fixed==2){
				popup_fixed=1	
				
			}else{
				map.once("click",fix_popup)	
			}
		}
	}
}
function check_popup_height(previous_h){
	if(null!=previous_h){
		var new_h=popup._container.clientHeight
		if(new_h>previous_h){
			if(new_h-previous_h>50){
				//reposition popup
				if(popup._container.clientHeight>500){
					$(".mapboxgl-popup-content").addClass("long")	
				}else{
					$(".mapboxgl-popup-content").removeClass("long")	
				}
				var px = map.project(popup.getLngLat()); // find the pixel location on the map where the popup anchor is
				px.y += popup._container.clientHeight/2 /// find the height of the popup container, divide by 2, subtract from the Y axis of marker location
				map.panTo(map.unproject(px),{animate: true}); // pan to new center
			}
		}
	}
}
function remove_popup(){
	if(popup_fixed==0){
		
		if(null!=popup){
			popup.remove()
		}
		map.once("off",fix_popup)
		popup_feature=null
		if(null!=popup_feature_next){
			popup_feature=popup_feature_next
			popup_feature_next=null
			fix_popup()
		}
		
	}
}
function popup_text(properties,type){
		var template=popup_template.toString()
		var params=properties
		
		switch(type){
			case "all":
				//to dump all
				var props=[]
				for(var p in properties){
					if(p.indexOf("__")!=0 && p!=map_config().columns.lat && p!=map_config().columns.lng){
						props.push({"name":p,"value":properties[p]})
						if(properties[p].toString().indexOf("http")==0){
							props[props.length-1].weblink=1
						}
					}
				}
				params[type]=props
			break;
			case "summary":
				params[type]=properties
			break
			case "detail":
				params[type]=properties
				if(null!=	params[type].WhatThreeWords){
					params[type].WhatThreeWords=params[type].WhatThreeWords.split("///").join("")
				}
				if(null!=params[type].Pictures){
					params[type].Has_Pictures=1
				}
			break
		}
		var str=Mustache.render(template,params)
			
			
		
		return str
	}
	function fix_popup(){
			popup_fixed=1
			map.once("click",function(){
				popup_fixed=0
				remove_popup()
				
			})
			if(null!=popup_feature){
				if(null!=map_control.load_site_detail){
					$.when(map_control.load_site_detail(popup_feature,"click")).then(function(f){
						popup_feature=f
						popup_fixed=2
						show_popup(null,popup_feature,"click")
					})
							
				}
			}
	}