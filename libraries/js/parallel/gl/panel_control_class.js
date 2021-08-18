var panel_control_ob
panel_control_class=function(){
	var _self=this
	this.setup=function(){
		
		$("#panel_control").bind("click",function(){
			if($("#panel_control").hasClass("open")){
				$("#panel_control").removeClass("open").addClass("closed")	
				$(".overlay:not(#panel_control)").addClass("hidden")
			}else{
				$("#panel_control").removeClass("closed").addClass("open")	
				$(".overlay:not(#panel_control)").removeClass("hidden")
			}
		})
	}
}
function create_panel_control_ob(){
	panel_control_ob=new panel_control_class()
	panel_control_ob.setup()
}
$(document).ready(function(){
	if($("#panel_control").length>0){
		create_panel_control_ob()
	}
	
})