var BackboneDemoApp = BackboneDemoApp || {};
BackboneDemoApp.view = BackboneDemoApp.view || {};

BackboneDemoApp.view.FilterSettingsView = Backbone.View.extend({
    events: {
        "click #buttons #go_button": "goClickHandler"
    },

    goClickHandler: function() {
        this.model.set({
            predictor: this.$el.find('#dropdown_predictor').val(),
            target: this.$el.find('#dropdown_target').val()
        });
        this.dispatcher.trigger('data:request:mass_spec', this.model);
    },

    initialize: function(options) {
        this.dispatcher = options.dispatcher;
    },

    render: function() {

    }
});
