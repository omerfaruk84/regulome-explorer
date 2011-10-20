Ext.ns('org.systemsbiology.pages.apis.containers');

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
    if (scripts && scripts.length) {
        org.systemsbiology.pages.util.ScriptMgr.load(scripts, callback);
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
