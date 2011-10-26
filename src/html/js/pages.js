Ext.ns('org.systemsbiology.pages.apis.containers');

org.systemsbiology.pages.apis.containers.WindowMgr = new Ext.WindowGroup();

org.systemsbiology.pages.apis.containers.WindowMgr.Cascade = function() {
    console.log("cascade");
    var x = 100;
    var y = 100;
    var windows = org.systemsbiology.pages.apis.containers.WindowMgr;
    windows.each(function(win) {
        console.log("cascade(): " + win.title + "," + win.minimized + "," + win.maximized + "," + win.isVisible());
        if (win.isVisible() && !win.maximized) {
            win.setPosition(x, y);
            x += 30;
            y += 30;
        }
    }, windows);
};

org.systemsbiology.pages.apis.containers.LoadConfiguration = function(json, parentDiv) {
    console.log("org.systemsbiology.pages.apis.containers.LoadConfiguration()");

    if (json) {
        if (json.containers && parentDiv) {
            Ext.each(json.containers, function(container) {
                var childDiv = Ext.DomHelper.append(parentDiv, { tag: 'div' }, true);
                var buttonDiv = Ext.DomHelper.append(parentDiv, { tag: 'div' }, true);
                org.systemsbiology.pages.apis.events.MessageBus.Subscribe(container.id, function(_Constructor) {
                    if (_Constructor) {
                        var _newInstance = new _Constructor(childDiv);
                        _newInstance.draw(container.data, container.options);

                        var logo = _newInstance.logo ? _newInstance.logo : {};
                        org.systemsbiology.pages.apis.containers.CreateWindow(childDiv, buttonDiv, container.label, logo, container.position);
                    }
                });

                if (container.scripts && container.scripts.length) {
                    org.systemsbiology.pages.util.ScriptLoad(container.scripts);
                }
            });
        }
    }
};

org.systemsbiology.pages.apis.containers.CreateWindow = function(div, buttonDiv, label, logo, position) {
    var shortCutConfig = {
        applyTo: buttonDiv,
        hidden: true,
        iconAlign: 'top',
        text: (logo.label ? logo.label : ""),
        listeners: {
           "click": function(btn, ev) {
              btn.hide();
              if (btn.window) {
                 btn.window.show();
              }
           }
        }
    };

    if (logo.url) {
        shortCutConfig["icon"] = logo.url;
        if (logo.label) {
            shortCutConfig["cls"] = "x-btn-text-icon";
        } else {
            shortCutConfig["cls"] = "x-btn-icon";
        }
    } else {
        shortCutConfig["cls"] = "shortcut";
    }

    var shortcut = new Ext.Button(shortCutConfig);

    var win = new Ext.Window({
        contentEl: div,
        layout:'fit',
        manager: org.systemsbiology.pages.apis.containers.WindowMgr,
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

    if (position) {
        win.setPosition(position.x, position.y);
    } else {
        org.systemsbiology.pages.apis.containers.WindowMgr.Cascade();
    }
}
