$(function() { 
	var masthead = '<div id="background"></div>\
        <div id="masthead">\
        <div style="position: relative; right: -50%; float: left; text-align: center;">\
        <table class="tab-group" border="0" cellspacing="0" style="position: relative; right: 50%;">\
            <tr>\
            <td class="tab data active" style=""><a target="_parent" href="/data">Datasets</a></td>\
            <td class="tab analysis" style=""><a target="_parent" href="/analysis">Analysis</a>\
                <div class="submenu">\
                     <ul>\
    	                    <li><a target="_blank" href="http://pubcrawl.googlecode.com/">Semantic Distance</a></li>\
                            <li><a target="_blank" href="http://rf-ace.googlecode.com/">Random Forest</a></li>\
                            <li><a target="_blank" href="/pairwise/">Pairwise (COAD)</a></li>\
                     </ul>\
                </div>\
            </td>\
            <td class="tab vis" style=""> <a target="_parent" href="/vis">Visualization</a>\
                <div class="submenu">\
                    <ul>\
                        <li><a target="_blank" href="http://pubcrawl.systemsbiology.net">Semantic Distance/Network</a></li>\
                        <li><a target="_blank" href="/re/">Random Forest/Circular</a></li>\
                        <li><a target="_blank" href="/pairwise/">Pairwise (COAD)/Circular</a></li>\
                    </ul>\
                </div>\
            </td>    \
            <td class="tab help" style=""><a target="_parent" href="/help">Help</a>\
                <div class="submenu">\
                    <ul>\
                       <li><a target="_blank" href="/help/analyses/">Description of Analyses</a></li>\
                       <li><a target="_blank" href="/help/re/">Regulome Explorer</a></li>\
                    </ul>\
                </div>\
            </td>\
        </tr>\
    </table>\
    </div>    \
    <div class="title" style="position: absolute; top: 0; left: 0;">\
        <a href="/">\
        <img border="0" src="/images/icons/circle_logo.png" style="height: 26px; vertical-align: top;">Regulome Explorer</a>\
    </div>\
    <div class="green-dots-container">   \
        <div class="green-dots">   \
            <img border="0" src="/images/icons/green.png" style="height: 26px;">            \
        </div>\
    </div>\
    </div>';
	$("#everything").prepend(masthead);
});

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

function activateTab(className) {
	$("#masthead").ready(function() {
			$(".tab.active").removeClass("active");
			$(".tab."+className).addClass("active");
	});
}