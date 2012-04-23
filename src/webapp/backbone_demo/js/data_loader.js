var BackboneDemoApp = BackboneDemoApp || {};

BackboneDemoApp.dataLoader = {
    parseMassSpecData: function(d) {
        this.data.plot_data.reset(d);
    }
};
