Ext.define('RE.view.Viewport' ,{
    extend: 'Ext.container.Viewport',
    requires:['RE.view.query.Feature'],
            
            layout: 'border',
            
            initComponent : function() {
           this.items= {
               items:[
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
        };
          
        this.callParent();
    }
    });