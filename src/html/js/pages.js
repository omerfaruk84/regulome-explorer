Ext.ns('org.systemsbiology.pages.apis.containers');

org.systemsbiology.pages.apis.containers.Scripts = [];

org.systemsbiology.pages.apis.containers.BootstrapListener = {
    _internal : [],

    constructor: function(scripts, callback) {
        console.log("org.systemsbiology.pages.apis.containers.BootstrapListener(" + scripts + "," + callback + ")");
        Ext.each(scripts, function(script) {
            _internal.push(script);
        });
        Ext.apply(this, { scripts: _internal, callback: callback});
    },
    
    Listen: function(event, t, o) {
        console.log("org.systemsbiology.pages.apis.containers.BootstrapListener.Listen(" + event + "," + t + "," + o + ")");
        for (var i = 0; i < _internal.length; i++) {
            if (this._internal[i] == o) {
                this._internal.splice(i, 1);
            }
        }
        if (this._internal.length == 0) {
            this.callback();
        }
    }
};

org.systemsbiology.pages.apis.containers.Bootstrap = function(scripts, callback) {
    console.log("org.systemsbiology.pages.apis.containers.Bootstrap(" + scripts + ")");
    if (scripts) {
        var listener = org.systemsbiology.pages.apis.containers.BootstrapListener(scripts, callback);

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
            // eval(container + "(" + data + ")");
        })
    }
};
