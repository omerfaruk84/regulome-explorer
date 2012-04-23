var BackboneDemoApp = BackboneDemoApp || {};

BackboneDemoApp.dataRetrieval = {
    loadMassSpecData: function() {
        this.dispatcher.trigger('data:retrieved:mass_spec', mass_spec);
    }
};
