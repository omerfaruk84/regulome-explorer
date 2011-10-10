Ext.define('RE.controller.GenomicFeature', {
    extend: 'Ext.app.Controller',
    requires: ['RE.store.GenomicFeatures','RE.model.GenomicFeature'],

    stores: [
        'GenomicFeatures'
    ],
    models: ['GenomicFeature'],
        views:[
            'genomicfeature.List',
            'genomicfeature.View'
        ],

 init: function() {
        this.control({
            'genomicfeature_list': {
                itemdblclick: this.viewGF
            }
        });
    },

     viewGF: function(grid,record) {
         var view = Ext.widget('genomicfeature_view');
         view.down('form').loadRecord(record);
    }

});