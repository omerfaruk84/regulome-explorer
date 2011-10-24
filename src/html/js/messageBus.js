Ext.ns('org.systemsbiology.pages.apis.events');

MsgBus = Ext.extend(Ext.util.Observable, {
    constructor: function(config) {
        Ext.apply(this, { subscriptions: {} });

        this.addEvents({ "publish": true });

        MsgBus.superclass.constructor.call(this);

        this.on("publish", this.Publish, this);
    },

    Publish: function(event) {
        if (event && event.key) {
            var relevantSubscriptions = this.subscriptions[event.key];
            if (relevantSubscriptions) {
                Ext.each(relevantSubscriptions, function(callback) {
                    if (event.payload) {
                        callback(event.payload);
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