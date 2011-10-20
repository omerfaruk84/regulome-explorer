/*
 * Extending from http://httpexplorer.googlecode.com/svn/trunk/js/ux/Ext.ux.ScriptLoader.js
 */

Ext.namespace('org.systemsbiology.pages.util');

org.systemsbiology.pages.util.Scripts = [];

org.systemsbiology.pages.util.ScriptLoad = function(scripts, callback) {
    Ext.each(org.systemsbiology.pages.apis.containers.Scripts, scripts.remove, scripts);
    Ext.each(scripts, function(url) {
        var elem = Ext.DomHelper.append(Ext.getHead(), {
            tag: 'script',
            src: url,
            type: "text/javascript"
            onload: function() {
                console.log("onload");
                scripts.remove(url);
                org.systemsbiology.pages.apis.containers.Scripts.push(script);
                if (scripts.length == 0) {
                    callback();
                }
            }
        }, true);
    });
};
