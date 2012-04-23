var BackboneDemoApp = BackboneDemoApp || {};
BackboneDemoApp.view = BackboneDemoApp.view || {};

BackboneDemoApp.view.DataSummaryView = Backbone.View.extend({
    initialize: function() {
        this.collection.on('reset', this.render, this);
        this.render();
    },

    render: function() {
        this.$el.html('<h3>Summary</h3><p>Data size: ' + this.collection.models.length + '</p>')
    }
});
