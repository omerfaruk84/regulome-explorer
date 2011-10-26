Ext.namespace('org.systemsbiology.pages.util');

org.systemsbiology.pages.util.Scripts = [];

org.systemsbiology.pages.util.ScriptLoad = function(url) {
    if (org.systemsbiology.pages.util.Scripts.indexOf(url) == -1) {
        if (document.createElement && document.childNodes) {
            var scriptElem = document.createElement('script');
            scriptElem.setAttribute('src', url);
            scriptElem.setAttribute('type', 'text/javascript');
            document.getElementsByTagName('head')[0].appendChild(scriptElem);
            org.systemsbiology.pages.util.Scripts.push(url);
        } else {
            alert('Your browser is not W3C DOM compliant.');
        }
    }
};
