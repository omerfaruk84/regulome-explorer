Ext.define('RE.store.FeatureType', {
    extend: 'Ext.data.Store',
	requires:['RE.model.FeatureType','Ext.data.proxy.LocalStorage'],
    model:'RE.model.FeatureType',


    autoLoad: true,

   data: [{code:'GEXP',label:'Gene Expression'},
   			{code:'METH',label:'Methylation'},
   			{code:'GNAB',label:'Gene Abberation'}
   			]
      
});