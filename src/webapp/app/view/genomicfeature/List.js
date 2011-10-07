Ext.define('RE.view.genomicfeature.List' ,{
    extend: 'Ext.grid.Panel',
    alias : 'widget.genomicfeature_list',

    title : 'Genomic Features',

    store:'GenomicsFeatures',

    initComponent: function() {
        this.store = {
            fields: ['label', 'chr','start','stop','strand','descriptors','reference'],
            data  : [
                
            ]
        };

        this.columns = [
            {header: 'Label',  dataIndex: 'label',  flex: 1},
            {header: 'Chr', dataIndex: 'chr', flex: 1},
            {header: 'Start',  dataIndex: 'start',  flex: 1},
            {header: 'Stop',  dataIndex: 'stop',  flex: 1},
            {header: 'Strand',  dataIndex: 'strand',  flex: 1},
            {header: 'Desc.',  dataIndex: 'descriptors',  flex: 1},
            {header: 'Reference.',  dataIndex: 'reference',  flex: 1}
        ];

        this.callParent(arguments);
    }
});