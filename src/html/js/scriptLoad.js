Ext.namespace('org.systemsbiology.pages.util');

org.systemsbiology.pages.util.Scripts = [];

org.systemsbiology.pages.util.ScriptLoad = function(urls) {
    Ext.each(urls, function(url) {
        if (org.systemsbiology.pages.util.Scripts.indexOf(url) == -1) {
            Ext.Ajax.request({
                url: url,
                method: "GET",
                success: function(o) {
                    org.systemsbiology.pages.util.Scripts.push(url);
                    eval(o.responseText);
                }
            });
        }
    });
};
