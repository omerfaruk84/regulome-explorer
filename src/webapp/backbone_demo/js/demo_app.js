var BackboneDemoApp = BackboneDemoApp || {};

BackboneDemoApp.model = BackboneDemoApp.model || {};
BackboneDemoApp.collection = BackboneDemoApp.collection || {};

// Models
// ======
BackboneDemoApp.model.FilterSettings = Backbone.Model.extend({
    defaults: {
        predictor: 'GEXP',
        target: 'GEXP'
    }
});

BackboneDemoApp.model.ScatterRow = Backbone.Model.extend({
    defaults: { }
});

// Collections
// ===========
BackboneDemoApp.collection.ScatterData = Backbone.Collection.extend({
    model:BackboneDemoApp.model.ScatterRow
});

// Eventing
// ========
BackboneDemoApp.create = function(config) {
    var app = Object.create({
        dataLoader: BackboneDemoApp.dataLoader,
        dataRetrieval: BackboneDemoApp.dataRetrieval
    });

    var d = _.clone(Backbone.Events);

    app.dispatcher = d;

    app.data = {
        filter_settings: new BackboneDemoApp.model.FilterSettings(),
        plot_data: new BackboneDemoApp.collection.ScatterData([
            {
                hl_norm1: 0.87313,
                id: "4404;5796;5797",
                ml_norm1: 0.79723
            },
            {
                hl_norm1: 0.9567,
                id: "2926;3083;5823;5824",
                ml_norm1: 0.96409
            }
        ])
    };

    app.filter_settings = new BackboneDemoApp.view.FilterSettingsView({
        el: '#' + config.filter_settings_id,
        dispatcher: d,
        model: app.data.filter_settings
    });

    app.scatter = new BackboneDemoApp.view.ScatterPlot({
        el: '#' + config.plot_id,
        dispatcher: d,
        collection: app.data.plot_data
    });

    app.summaryview = new BackboneDemoApp.view.DataSummaryView({
        el: '#' + config.summary_id,
        dispatcher: d,
        collection: app.data.plot_data
    });

    // Setup events
    d.on('data:request:mass_spec', app.dataRetrieval.loadMassSpecData, app);
    d.on('data:retrieved:mass_spec', app.dataLoader.parseMassSpecData, app);

    return app;
};
