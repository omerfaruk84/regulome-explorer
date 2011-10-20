Ext.ns('org.systemsbiology.pages.apis.containers');

org.systemsbiology.pages.apis.containers.Containers = [];

org.systemsbiology.pages.apis.containers.Register = function(container) {
    console.log("Register(" + container + ")");
    org.systemsbiology.pages.apis.containers.Containers.push(container);
};
