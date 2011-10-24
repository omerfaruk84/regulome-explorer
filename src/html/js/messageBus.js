Ext.ns('org.systemsbiology.pages.apis.events');

MsgBus = Ext.extend(Ext.util.Observable, {
    constructor: function(config) {
        Ext.apply(this, { subscriptions: {} });

        this.addEvents({ "publish": true });

        MsgBus.superclass.constructor.call(this);

        this.on("publish", this.Publish, this);
    },

    Publish: function(evt, elem, obj) {
        if (obj && obj.key) {
            var relevantSubscriptions = this.subscriptions[obj.key];
            if (relevantSubscriptions) {
                Ext.each(relevantSubscriptions, function(callback) {
                    if (obj.payload) {
                        callback(obj.payload);
                    } else {
                        callback();
                    }
                });
            }
        }
    },

    Subscribe: function(key, callback) {
        var relevantSubscriptions = this.subscriptions[key];
        if (relevantSubscriptions == null) {
            relevantSubscriptions = new Array();
            this.subscriptions[key] = relevantSubscriptions;
        }
        relevantSubscriptions.push(callback);
    }
});

org.systemsbiology.pages.apis.events.MessageBus = new MsgBus();