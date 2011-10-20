Ext.ns('org.systemsbiology.pages.apis.containers');

org.systemsbiology.pages.apis.containers.Scripts = new Array();

var BootstrapListener = Ext.extend(Object, {
    constructor: function(scripts, callback) {
        console.log("org.systemsbiology.pages.apis.containers.BootstrapListener(" + scripts + ")");

        var temp = new Array();
        Ext.each(scripts, function(script) {
            if (org.systemsbiology.pages.apis.containers.Scripts.indexOf(script) == -1) {
                temp.push(script);
            } else {
                console.log("script already loaded=" + script);
            }
        });
        Ext.apply(this, { scripts: temp, callback: callback});
    },

    Listen: function(event, t, script) {
        console.log("org.systemsbiology.pages.apis.containers.BootstrapListener.Listen(" + script + ")");

        this.scripts.remove(script);
        org.systemsbiology.pages.apis.containers.Scripts.push(script);
        if (this.scripts.length == 0) {
            this.callback();
        }
    }
});

var StringToFunction = function(str) {
    var fn = (window || this);
    Ext.each(str.split("."), function(a) {
        fn = fn[a];
    });

    if (typeof fn !== "function") {
        throw new Error("function not found");
    }

    return  fn;
};

org.systemsbiology.pages.apis.containers.Bootstrap = function(scripts, callback) {
    console.log("org.systemsbiology.pages.apis.containers.Bootstrap(" + scripts + ")");
    if (scripts) {
//        var listener = new BootstrapListener(scripts, callback);

        var notLoadedYet = new Array();
        Ext.each(scripts, function(script) {
            if (org.systemsbiology.pages.apis.containers.Scripts.indexOf(script) == -1) {
                notLoadedYet.push(script);
            } else {
                console.log("script already loaded=" + script);
            }
        });

        org.systemsbiology.pages.util.ScriptMgr.load({
            scripts: notLoadedYet,
            callback: function() {
                org.systemsbiology.pages.apis.containers.Scripts.push(script);
                callback();
            }
        });
    } else {
        callback();
    }
};

org.systemsbiology.pages.apis.containers.Load = function(parentDiv, containers, data, options) {
    console.log("org.systemsbiology.pages.apis.containers.Load(" + parentDiv + "," + containers + ")");
    if (parentDiv && containers) {
        Ext.each(containers, function(container) {
            var childDiv = Ext.DomHelper.append(parentDiv, { tag: 'div' }, true);

            var ContainerClass = StringToFunction(container);
            var containerInstance = new ContainerClass(childDiv);
            containerInstance.draw(data, options);
        })
    }
};
