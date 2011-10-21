Ext.namespace('org.systemsbiology.pages.util');

org.systemsbiology.pages.util.Scripts = [];

org.systemsbiology.pages.util.ScriptLoad = function(urls) {
    var scripts = new Array();
    Ext.each(urls, function(s) {
        if (org.systemsbiology.pages.util.Scripts.indexOf(s) == -1) {
            scripts.push(s);
        }
    });

    Ext.each(scripts, function(url) {
        Ext.DomHelper.append(Ext.getHead(), { tag: 'script', src: url, type: "text/javascript" });
        org.systemsbiology.pages.util.Scripts.push(url);
    });
};

