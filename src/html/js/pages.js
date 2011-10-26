Ext.ns('org.systemsbiology.pages.apis.containers');

org.systemsbiology.pages.apis.containers.WindowMgr = new Ext.WindowGroup();

org.systemsbiology.pages.apis.containers.WindowMgr.Position = function() {
    var x = 100;
    var y = 100;

    var order = [];
    this.each(function(win) {
        if (win.isVisible() && !win.maximized) {
            if (!win.isPositioned) {
                win.setPosition(x, y);
                x += 30;
                y += 30;
            }
        }

        if (win.order != null) {
            order[win.order] = win;
        }
    });

    for (var i = order.length; i >= 0; i--) {
        var win = order[i];
        if (win) {
            this.bringToFront(win);
        }
    }
};

org.systemsbiology.pages.apis.containers.LoadConfiguration = function(json, parentDiv) {
    console.log("org.systemsbiology.pages.apis.containers.LoadConfiguration()");

    var targetScripts = new Array();

    if (json) {
        if (json.containers && parentDiv) {
            Ext.each(json.containers, function(container) {
                var childDiv = Ext.DomHelper.append(parentDiv, { tag: 'div' }, true);
                var buttonDiv = Ext.DomHelper.append(parentDiv, { tag: 'div' }, true);
                org.systemsbiology.pages.apis.events.MessageBus.Subscribe(container.id, function(_Constructor) {
                    if (_Constructor) {
                        var _newInstance = new _Constructor(childDiv.id);
                        _newInstance.draw(container.data, container.options);

                        var logo = _newInstance.logo ? _newInstance.logo : {};
                        org.systemsbiology.pages.apis.containers.CreateWindow(childDiv, buttonDiv, container.label, logo, container.position);
                    }
                });
                if (container.scripts && container.scripts.length) {
                    Ext.each(container.scripts, function(s) {
                       if (targetScripts.indexOf(s) == -1) {
                           targetScripts.push(s);
                       }
                    });
                }
            });
        }
    }

    org.systemsbiology.pages.util.ScriptLoad(targetScripts);
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
        win.order = position.order;
        win.isPositioned = true;
    }
    org.systemsbiology.pages.apis.containers.WindowMgr.Position();
};
