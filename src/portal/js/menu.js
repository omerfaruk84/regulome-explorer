$(function(){
	$(".tab").each(function(){
		var a=$(this).children(".submenu");
		if(a.length>0){
			if($.browser.msie){
			a.prepend("<iframe style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; filter:Alpha(Opacity='0');\"></iframe>")
			}
			$(this).hover(function(){
				a.show()
			},function(){
				a.hide()
			});
			a.click(function(){
				a.hide()
			}
		)}
	}	)
});