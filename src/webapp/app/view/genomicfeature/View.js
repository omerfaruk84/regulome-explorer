Ext.define('RE.view.genomicfeature.View' ,{
    extend: 'Ext.window.Window',
    alias : 'widget.genomicfeature_view',

    title : 'Genomic Feature',
    layout : 'fit',
    autoShow : true,

    initComponent: function() {
        this.items = [{
            xtype:'form',

            items: [
                {xtype:'textfield',
                    name:'label',
                    fieldLabel:'label'
                },
                {xtype:'textfield',
                    name:'reference',
                    fieldLabel:'reference'
                },
                {xtype:'textfield',
                    name:'chr',
                    fieldLabel:'chr'
                },
                {xtype:'textfield',
                    name:'start',
                    fieldLabel:'start'
                },
                {xtype:'textfield',
                    name:'stop',
                    fieldLabel:'stop'
                },
                {xtype:'textfield',
                    name:'strand',
                    fieldLabel:'strand'
                },
                {xtype:'textarea',
                    name:'descriptors',
                    fieldLabel:'descriptors'
                },
                {xtype:'textfield',
                    name:'reference',
                    fieldLabel:'reference'
                }
            ]
        }
        ];

        this.buttons= [
            {text : 'Close',
                action : this.close
            }
        ];

        this.callParent(arguments);
    }
});