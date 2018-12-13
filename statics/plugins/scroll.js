// --- plugins ---

$(document).ready(function(){
	$(document).scroll(function(){
		var scroll = $(window).scrollTop();
		if(scroll >= 150){
			$(".header").addClass("fixed-top")
		}else if(scroll < 150){
			$(".header").removeClass("fixed-top");
		}
	}).hover(function(){
		$("#button-menu").click(function(){
			$(".main-sidebar").removeClass("desktop").addClass("mobile-sidebar")
		})

		$(".overlay").click(function(){
			$(".main-sidebar").addClass("desktop")
		})
	})
})