Ext.ns('org.systemsbiology.pages.apis.containers');

org.systemsbiology.pages.apis.containers.LoadConfiguration = function(json, parentDiv) {
    console.log("org.systemsbiology.pages.apis.containers.LoadConfiguration()");

    if (json) {
        if (json.containers && parentDiv) {
            Ext.each(json.containers, function(container) {
                var childDiv = Ext.DomHelper.append(parentDiv, { tag: 'div' }, true);
                var buttonDiv = Ext.DomHelper.append(parentDiv, { tag: 'div' }, true);
                org.systemsbiology.pages.apis.events.MessageBus.Subscribe(container.id, function(_Constructor) {
                    org.systemsbiology.pages.apis.containers.CreateWindow(childDiv, buttonDiv, container.label);
                    if (_Constructor) {
                        var _newInstance = new _Constructor(childDiv);
                        _newInstance.draw(container.data, container.options);
                    }
                });

                if (container.scripts && container.scripts.length) {
                    org.systemsbiology.pages.util.ScriptLoad(container.scripts);
                }
            });
        }
    }
};

org.systemsbiology.pages.apis.containers.CreateWindow = function(div, buttonDiv, label) {
    var shortcut = new Ext.Button({
        applyTo: buttonDiv,
        hidden: true,
        scale: "medium",
        iconCls: "shortcut",
        listeners: {
           "click": function(btn, ev) {
              btn.hide();
              if (btn.window) {
                 btn.window.show();
              }
           }
        }
    });
    var win = new Ext.Window({
        contentEl: div,
        layout:'fit',
        width:800,
        height:600,
        closeAction:'hide', 
        border: true, frame:true, plain: false, 
        minimizable: true, maximizable: true, animCollapse: true, 
        autoScroll:true, 
        bodyBorder:true, 
        modal: false, floating: true, 
        shadow: true, 
        title: label, titleCollapse: true,
        shortcut: shortcut 
    });
    win.on("minimize", function(w) {
        w.minimized = true;
        w.hide();
        if (w.shortcut) {
            shortcut.show();
        }
    });
    shortcut.window = win;
    win.show(this);
}
