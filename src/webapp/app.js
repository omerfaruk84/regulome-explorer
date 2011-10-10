
Ext.require('Ext.layout.container.Border');
Ext.require('Ext.container.Viewport');

Ext.application({
    name: 'RE',
    appFolder: 'app',
    controllers: [ 'DataFeature','GenomicFeature'],

    autoCreateViewport : true,

    launch: function() {
        Ext.create('Ext.container.Viewport', {
            requires:['RE.view.query.Feature'],
            layout: 'border',
            defaults: {split:true},
            items: [
                {
                    xtype:'panel',
                    region:'north',
                    height: 25,
                    title: 'Regulome Explorer',
                    split: false,
                    margins: '0 0 0 0'
                },
                {
                    xtype:'panel',
                    region:'center',
                    collapsible: false,
                    split: false
                },
                {
                    xtype:'query_feature',
                    region:'east',
                    width: 220,
                    collapsible: true,
                    closable : false,
                    split : true
                }
            ]
        });
    }
});