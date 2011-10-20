Ext.ns('org.systemsbiology.pages.apis.containers');

org.systemsbiology.pages.apis.containers.Scripts = [];

var BootstrapListener = Ext.extend(Object, {

    constructor: function(scripts, callback) {
        console.log("org.systemsbiology.pages.apis.containers.BootstrapListener(" + scripts + "," + callback + ")");

        var temp = [];
        Ext.each(scripts, function(script) {
            temp.push(script);
        });
        Ext.apply(this, { scripts: temp, callback: callback});
    },

    Listen: function(event, t, o) {
        console.log("org.systemsbiology.pages.apis.containers.BootstrapListener.Listen(" + event + "," + t + "," + o + ")");

        for (var i = 0; i < this.scripts.length; i++) {
            if (this.scripts[i] == o) {
                this.scripts.splice(i, 1);
            }
        }
        if (this.scripts.length == 0) {
            this.callback();
        }
    }
});

org.systemsbiology.pages.apis.containers.Bootstrap = function(scripts, callback) {
    console.log("org.systemsbiology.pages.apis.containers.Bootstrap(" + scripts + ")");
    if (scripts) {
        var listener = new BootstrapListener(scripts, callback);

        // TODO : Filter scripts that have already been loaded
        Ext.each(scripts, function(script) {
            console.log("org.systemsbiology.pages.apis.containers.Bootstrap(): script=" + script);
            org.systemsbiology.pages.apis.containers.Scripts.push(script);
            var elem = Ext.DomHelper.append(Ext.getHead(), { tag: 'script', src: script,  type: "text/javascript" }, true);
            elem.on("load", listener.Listen, listener, script);
        });
    } else {
        callback();
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
