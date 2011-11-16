Ext.ns('org.systemsbiology.pages.apis.menus');

org.systemsbiology.pages.apis.menus.AddMenu = function(menuSpec) {
    // TODO : Fire events on selection?
    
    var tpl = '<li>';
    if (menuSpec.cls) {
        tpl += '<a href="{uri}" class="{cls}">{label}</a>';
    } else {
        tpl += '<a href="{uri}">{label}</a>';
    }
    if (menuSpec.items && menuSpec.items.length) {
        tpl += '<ul>';
        tpl += '<tpl for="items">';
        tpl += '<li><a href="index.html?URI={uri}">{label}</a></li>';
        tpl += '</tpl>';
        tpl += '</ul>';
    }

    Ext.DomHelper.append("ul-containermenu", new Ext.XTemplate(tpl).apply(menuSpec));
    $('#ul-containermenu').xBreadcrumbs();
};