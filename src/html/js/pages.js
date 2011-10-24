Ext.ns('org.systemsbiology.pages.apis.containers');

org.systemsbiology.pages.apis.containers.LoadConfiguration = function(json, parentDiv) {
    console.log("org.systemsbiology.pages.apis.containers.LoadConfiguration()");

    if (json) {
        if (json.containers && parentDiv) {
            Ext.each(json.containers, function(container) {
                var childDiv = Ext.DomHelper.append(parentDiv, { tag: 'div' }, true);
                org.systemsbiology.pages.apis.events.MessageBus.Subscribe(container.id, function(payload) {
                    if (payload) {
                        var _newInstance = new payload(childDiv);
                        _newInstance.draw(container.data, container.options);
                    }
                });
            });
        }

        if (json.scripts && json.scripts.length) {
            org.systemsbiology.pages.util.ScriptLoad(json.scripts);
        }
    }
};
