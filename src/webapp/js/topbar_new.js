var topbar_div = [
    '                <a class="btn btn-mini btn-info topbar-toggle" href="#"><i id="collapse_icon" class="icon-plus icon-white"></i></a>',
    '    <div class="navbar topbar" id="topbar" style="display:none">',
    '        <div class="navbar-inner">',
    '            <div class="container-fluid">',
 //   '                <a class="pull-right topbar-toggle"><i class="icon-arrow-up icon-white"></i></a>',
    '                <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">',
    '                    <span class="icon-bar"></span>',
    '                    <span class="icon-bar"></span>',
    '                    <span class="icon-bar"></span></a>',
    '                    <p class="navbar-text pull-right"><a href="#">Login</a></p>',
    '                <a class="brand " href="#">RE</a>',
    '                <div class="nav-collapse">',
    '                    <ul class="nav">',
    '                        <li class="data">',
    '                            <a href="http://features.cancerregulome.org"',
    '                                Features',
    '                                <b class="caret"></b>',
    '                            </a>',
    '                        </li>',
    '                        <li class="queries">',
    '                            <a href="http://analysis.cancerregulome.org"',
    '                                Analyses',
    '                                <b class="caret"></b>',
    '                            </a>',
    '                        </li>',
    '                        <li class="results">',
    '                            <a href="http://sets.cancerregulome.org',
    '                                mySets',
    '                                <b class="caret"></b>',
    '                            </a>',
    '                        </li>',
    '                       <li class="results">',
       '                            <a href="http://igraphs.cancerregulome.org"',
       '                                iGraphs',
       '                                <b class="caret"></b>',
       '                            </a>',
       '                        </li>',
    '                    </ul>',
    '',
    '                    <ul class="nav pull-right">',
    '                        <li class="queries dropdown">',
    '                            <a href="#"',
    '                               class="dropdown-toggle"',
    '                               data-toggle="dropdown">',
    '                                Settings',
    '                                <b class="caret"></b>',
    '                            </a>',
    '                            <ul class="dropdown-menu">',
    '                                <li><a href="#">Sharing</a></li>',
    '                                <li><a href="#">Vis</a></li>',
    '                                <li><a href="#">Export</a></li>',
    '                            </ul>',
    '                        </li>',
    '                    </ul>',
    '                    </ul>',
    '                </div><!--/.nav-collapse -->',
    '            </div>',
    '        </div>',
    '    </div>'
    //'    <div id="topbar-btn" class="hide"><i class="pull-left icon-arrow-down"></i>',
    //'    <i class="pull-right icon-arrow-down"></i></div>'
].join('');

$(document).ready(function() {

    var topbar_height = '40';
    $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '<meta name="description" content="">',
        '<meta name="author" content="">',
        '<link href="assets/css/bootstrap.css" rel="stylesheet">',
        '<link href="assets/css/topbar.css" rel="stylesheet">',
        '<link href="assets/css/bootstrap-responsive.css" rel="stylesheet">');

    $('body').prepend(topbar_div);
    $.getScript('assets/js/bootstrap.js',function(){
        $('#topbar').height(topbar_height);
        $('#topbar').slideDown( 800,'easeInQuad',function() {
            $('#topbar').height('auto');
        });
    });
     $('.topbar-toggle').click(function() {
        topbar_height = $('#topbar').outerHeight();

        if (!$('#collapse_icon').hasClass('icon-minus')) {
        $('#topbar').slideUp( 800,'easeInQuad',function(){
            $('#topbar').height(topbar_height);
            $('#collapse_icon').toggleClass('icon-minus');
        });

       } else {
            $('#topbar').slideDown( 800,'easeInQuad',function(){
            $('#topbar').height('auto');
            $('#collapse_icon').toggleClass('icon-minus');
            });
        }
    });

});