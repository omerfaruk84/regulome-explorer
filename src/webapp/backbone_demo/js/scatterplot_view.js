var BackboneDemoApp = BackboneDemoApp || {};
BackboneDemoApp.view = BackboneDemoApp.view || {};

BackboneDemoApp.view.ScatterPlot = Backbone.View.extend({
    initialize: function(options) {
        this.scatter_plot = new vq.ScatterPlot();
        this.dispatcher = options.dispatcher;

        this.collection.on('reset', this.render, this);
        this.render();
    },

    render: function() {
        var data_array = _.pluck(this.collection.models, 'attributes');

        var data = {
            DATATYPE : "vq.models.ScatterPlotData",
            CONTENTS : {
                PLOT : {
                    container: document.getElementById(this.$el.attr('id')),
                    width : 512, height: 512,
                    dblclick_notifier : function() {},
                    vertical_padding : 40,
                    horizontal_padding: 40,
                    font: "14px sans"
                },
                data_array: data_array,
                xcolumnid: 'ml_norm1',
                ycolumnid: 'hl_norm1',
                valuecolumnid: 'id'
            }
        };

        this.scatter_plot.draw(data);
        return this;
    }
});
