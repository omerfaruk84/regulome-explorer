Ext.define('RE.store.FeatureType', {
    extend: 'Ext.data.Store',
	requires:['RE.model.FeatureType','Ext.data.proxy.LocalStorage'],
    model:'RE.model.FeatureType',


    autoLoad: false,

    proxy : {
        type:'localstorage',
        id: 're-featuretype'
    }
      
});