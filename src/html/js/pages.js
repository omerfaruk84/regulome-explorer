Ext.ns('org.systemsbiology.pages.apis.containers');

org.systemsbiology.pages.apis.containers.Containers = [];

org.systemsbiology.pages.apis.containers.Register = function(container) {
    console.log("Register(" + container + ")");
    org.systemsbiology.pages.apis.containers.Containers.push(container);
    eval(container + "({})");
};

org.systemsbiology.pages.apis.containers.Bootstrap = function(jsonConfig) {
    console.log("Bootstrap(" + jsonConfig + ")");
    if (jsonConfig.scripts) {
        Ext.each(jsonConfig.scripts, function(script) {
            console.log("Bootstrap(): dom+" + script);
            Ext.DomHelper.append(Ext.getHead(), { tag: 'script', src: script,  type: "text/javascript" });
        });
    }
};
