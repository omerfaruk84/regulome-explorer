Ext.ns('org.systemsbiology.pages.apis.containers');

org.systemsbiology.pages.apis.containers.Scripts = [];

org.systemsbiology.pages.apis.containers.Bootstrap = function(scripts) {
    console.log("org.systemsbiology.pages.apis.containers.Bootstrap(" + scripts + ")");
    if (scripts) {
        // TODO : Filter scripts that have already been loaded
        Ext.each(scripts, function(script) {
            console.log("org.systemsbiology.pages.apis.containers.Bootstrap(): script=" + script);
            org.systemsbiology.pages.apis.containers.Scripts.push(script);
            Ext.DomHelper.append(Ext.getHead(), { tag: 'script', src: script,  type: "text/javascript" });
        });
    }
};

org.systemsbiology.pages.apis.containers.Load = function(containers, jsonData) {
    console.log("org.systemsbiology.pages.apis.containers.Load(" + containers + ")");
    if (containers) {
        Ext.each(containers, function(container) {
            console.log("org.systemsbiology.pages.apis.containers.Load(): container=" + container);
            data = "{}";
            eval(container + "(" + data + ")");
        })
    }
};
