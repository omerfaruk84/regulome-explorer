Ext.define('RE.store.GenomicFeatures', {
    extend: 'Ext.data.Store',
    model:'RE.store.GenomicFeature',

    autoLoad: false,

    proxy : {
        type:'localStorage',
        id: 're-genomicfeatures'
    }
});