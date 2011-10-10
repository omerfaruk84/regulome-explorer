Ext.define('RE.store.GenomicFeatures', {
    extend: 'Ext.data.Store',
    requires: ['RE.model.GenomicFeature', 'Ext.data.proxy.LocalStorage'],
    model:'RE.model.GenomicFeature',

    autoLoad: false,

    proxy : {
        type:'localstorage',
        id: 're-genomicfeatures'
    }
      
});