Ext.ns('org.systemsbiology.pages.apis.containers');

var StringToFunction = function(str) {
    var fn = (window || this);
    Ext.each(str.split("."), function(a) {
        if (a && fn[a]) {
            fn = fn[a];
        }
    });

    if (typeof fn !== "function") {
        console.log("unable to load: " + str);
    }

    return  fn;
};

org.systemsbiology.pages.util.Callbacks = {};

org.systemsbiology.pages.apis.containers.OnReady = function(container, callback) {
    var vals = org.systemsbiology.pages.util.Callbacks[container];
    if (vals == null) {
        vals = new Array();
        org.systemsbiology.pages.util.Callbacks[container] = vals;
    }
    vals.push(callback);
};

org.systemsbiology.pages.apis.containers.IsReady = function(container) {
    var vals = org.systemsbiology.pages.util.Callbacks[container];
    if (vals != null) {
        Ext.each(vals, function(cb) {
            cb();
        });
    }
};

org.systemsbiology.pages.apis.containers.Bootstrap = function(scripts) {
    console.log("org.systemsbiology.pages.apis.containers.Bootstrap(" + scripts + ")");
    if (scripts && scripts.length) {
        org.systemsbiology.pages.util.ScriptLoad(scripts);
    } else {
        callback();
    }
};

org.systemsbiology.pages.apis.containers.Load = function(parentDiv, container, data, options) {
    console.log("org.systemsbiology.pages.apis.containers.Load(" + parentDiv + "," + container + ")");
    if (parentDiv && container) {
        var childDiv = Ext.DomHelper.append(parentDiv, { tag: 'div' }, true);

        var ContainerClass = StringToFunction(container);
        if (ContainerClass) {
            var containerInstance = new ContainerClass(childDiv);
            containerInstance.draw(data, options);
        }
    }
};
