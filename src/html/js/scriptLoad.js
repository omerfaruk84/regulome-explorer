Ext.namespace('org.systemsbiology.pages.util');

org.systemsbiology.pages.util.Scripts = [];
org.systemsbiology.pages.util.Pending = [];

org.systemsbiology.pages.util.ScriptLoad = function(urls) {
    if (urls && urls.length) {
        Ext.each(urls, function(url) {
            if (org.systemsbiology.pages.util.Scripts.indexOf(url) == -1) {
                org.systemsbiology.pages.util.Pending.push(url);
            }
        });
        org.systemsbiology.pages.util.IndividualLoad();
    }
};

org.systemsbiology.pages.util.IndividualLoad = function() {
    var pending = org.systemsbiology.pages.util.Pending;
    if (pending.length > 0) {
        var url = pending.shift();
        if (document.createElement && document.childNodes) {
            var scriptElem = document.createElement('script');
            scriptElem.setAttribute('src', url);
            scriptElem.setAttribute('type', 'text/javascript');
            Ext.EventManager.on(scriptElem, "load", org.systemsbiology.pages.util.IndividualLoad);
            document.getElementsByTagName('head')[0].appendChild(scriptElem);
            org.systemsbiology.pages.util.Scripts.push(url);
        } else {
            alert('Your browser is not W3C DOM compliant.');
        }
    }
};
