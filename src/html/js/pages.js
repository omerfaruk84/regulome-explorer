Ext.ns('org.systemsbiology.pages.apis.containers');

org.systemsbiology.pages.apis.containers.Scripts = [];

org.systemsbiology.pages.apis.containers.Bootstrap = function(jsonConfig) {
    console.log("org.systemsbiology.pages.apis.containers.Bootstrap(" + jsonConfig + ")");
    if (jsonConfig.scripts) {
        // TODO : Filter scripts that have already been loaded
        Ext.each(jsonConfig.scripts, function(script) {
            console.log("org.systemsbiology.pages.apis.containers.Bootstrap(): dom.head+" + script);
            org.systemsbiology.pages.apis.containers.Scripts.push(script);
            Ext.DomHelper.append(Ext.getHead(), { tag: 'script', src: script,  type: "text/javascript" });
        });
    }

    if (jsonConfig.containers) {
        Ext.each(jsonConfig.containers, function(container) {
            console.log("org.systemsbiology.pages.apis.containers.Bootstrap(): containers+" + container);
            org.systemsbiology.pages.apis.containers.Containers.push(container);
            data = "{}";
            eval(container + "(" + data + ")");
        })
    }
};
