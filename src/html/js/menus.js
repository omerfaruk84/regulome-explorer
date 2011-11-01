Ext.ns('org.systemsbiology.pages.apis.menus');

org.systemsbiology.pages.apis.menus.homemenu = {
    cls: "home",
    caption: "Home",
    items: [
        {
            caption: "New workspace",
            uri: "#"
        }
    ]
};

org.systemsbiology.pages.apis.menus.viewmenu = {
    cls: "",
    caption: "View",
    items: [
        {
            caption: "Add tool",
            uri: "#"
        }
    ]
};

org.systemsbiology.pages.apis.menus.filtermenu = {
    cls: "",
    caption: "Filter",
    items: [
        {
            caption: "Filter by ...",
            uri: "#"
        }
    ]
};

org.systemsbiology.pages.apis.menus.GetMenuHtml = function(data, menu_style, menu_id) {
    data.menu_style = menu_style;
    data.menu_id = menu_id;

    var tpl = new Ext.XTemplate(
        '<li id="{menu_id}">' +
        '<tpl if="cls==\'\'"><a href="#">{caption}</a></tpl>' +
        '<tpl if="cls"><a href="#" class="{cls}">{caption}</a></tpl>' +
            '<tpl if="items">' +
            '<ul class="{menu_style}">' +
            '<tpl for="items">' +
                '<li><a href="index.html?URI={uri}">{caption}</a></li>' +
            '</tpl>' +
            '</ul>' +
        '</tpl>' +
        '</li>'
    );

    return tpl.apply(data);
};
