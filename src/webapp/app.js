
Ext.require('Ext.container.Viewport');

Ext.application({
    name: 'RE',
    appFolder: 'app',

    controllers: [ 'DataFeature','GenomicFeature'],

    launch: function() {
        Ext.create('Ext.container.Viewport', {
            layout: 'fit',
            items: [
                {
                    xtype:'panel',
                    title: 'Regulome Explorer',
                    items: {
                        xtype:'genomicfeature_list'
                    }
                }
            ]
        });
    }
});