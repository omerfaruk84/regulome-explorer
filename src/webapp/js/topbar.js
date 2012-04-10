var topbar_div = [
    '    <div class="navbar topbar" id="topbar" style="display:none">',
    '        <div class="navbar-inner">',
    '            <div class="container-fluid">',
    '                <a class="pull-left topbar-toggle"><i class="icon-arrow-up icon-white"></i></a>',
    '                <a class="pull-right topbar-toggle"><i class="icon-arrow-up icon-white"></i></a>',
    '                <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">',
    '                    <span class="icon-bar"></span>',
    '                    <span class="icon-bar"></span>',
    '                    <span class="icon-bar"></span></a>',
    '                    <p class="navbar-text pull-right"><a href="#">Login</a></p>',
    '                <a class="pull-left brand topbar-toggle" href="#">RE</a>',
    '                <div class="nav-collapse">',
    '                    <ul class="nav">',
    '                        <li class="data dropdown">',
    '                            <a href="#"',
    '                               class="dropdown-toggle"',
    '                               data-toggle="dropdown">',
    '                                Data',
    '                                <b class="caret"></b>',
    '                            </a>',
    '                            <ul class="dropdown-menu">',
    '                                <li><a href="#">Browse</a></li>',
    '                                <li>By</li>',
    '                                <li><a href="#">Disease</a></li>',
    '                                <li><a href="#">Analysis</a></li>',
    '                                <li><a href="#">Patients</a></li>',
    '                                <li class="divider"></li>',
    '                                <li><a href="#">Favorites</a></li>',
    '                                <li><a href="#">Shared</a></li>',
    '                            </ul>',
    '                        </li>',
    '                        <li class="queries dropdown">',
    '                            <a href="#"',
    '                               class="dropdown-toggle"',
    '                               data-toggle="dropdown">',
    '                                Queries',
    '                                <b class="caret"></b>',
    '                            </a>',
    '                            <ul class="dropdown-menu">',
    '                                <li><a href="#">Most Recent</a></li>',
    '                                <li><a href="#">Favorites</a></li>',
    '                                <li><a href="#">History</a></li>',
    '                            </ul>',
    '                        </li>',
    '                        <li class="results dropdown">',
    '                            <a href="#"',
    '                               class="dropdown-toggle"',
    '                               data-toggle="dropdown">',
    '                                Results',
    '                                <b class="caret"></b>',
    '                            </a>',
    '                            <ul class="dropdown-menu">',
    '                                <li><a href="#">Most Recent</a></li>',
    '                                <li><a href="#">Favorites</a></li>',
    '                                <li><a href="#">History</a></li>',
    '                            </ul>',
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
    '    </div>',
    '    <div id="topbar-btn" class="hide"><i class="pull-left icon-arrow-down"></i>',
    '    <i class="pull-right icon-arrow-down"></i></div>'
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
        $('#topbar').slideUp( 800,'easeInQuad',function(){
            $('#topbar-btn').show();
            $('#topbar').height(topbar_height);
        });
    });
    $('#topbar-btn').click(function() {
        $('#topbar').slideDown( 800,'easeInQuad',function(){
            $('#topbar-btn').hide();
            $('#topbar').height('auto');
        });
    });


});