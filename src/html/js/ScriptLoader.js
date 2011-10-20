/*
 * Extending from http://httpexplorer.googlecode.com/svn/trunk/js/ux/Ext.ux.ScriptLoader.js
 */

Ext.namespace('org.systemsbiology.pages.util');

org.systemsbiology.pages.util.ScriptLoader = function() {
    this.scripts = [];
};

org.systemsbiology.pages.util.ScriptLoader.prototype = {
    load: function(scripts, callback) {
        var fnScripts = new Array();
        Ext.each(scripts, function(script) {
            if (this.scripts.indexOf(script) == -1) {
                fnScripts.push(script);
            } else {
                console.log("script already loaded=" + script);
            }
        }, this);

        if (scripts && scripts.length) {
            Ext.each(scripts, function(url) {
                Ext.Ajax.request({
                    url: url,
                    method: "GET",
                    success: function(o) {
                        fnScripts.remove(o.argument.url);
                        if (fnScripts.length == 0) {
                            this.scripts.push(script);
                            callback();
                        }
                    },
                    failure: function() {
                        console.log('org.systemsbiology.pages.util.ScriptLoader: Script library could not be loaded');
                    },
                    scope: this,
                    argument: {
                        'url': url
                    }
                });
            });
        }
    }
};

org.systemsbiology.pages.util.ScriptMgr = new org.systemsbiology.pages.util.ScriptLoader();