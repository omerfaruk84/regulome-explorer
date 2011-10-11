Ext.define('RE.view.query.Feature' ,{
    extend: 'Ext.panel.Panel',
    requires: ['Ext.form.Panel','Ext.form.field.ComboBox','RE.store.FeatureType'],
    alias : 'widget.query_feature',

    title : 'Feature Filter',

    initComponent: function() {
      this.items = [{
          xtype:'form',
          items: [
          {
          xtype: 'combo',
          fieldLabel: 'Type',
          displayField: 'label',
          valueField: 'code',
          queryMode: 'local',
          store:'FeatureType'
          }
          ]
      }
      ];
        this.callParent(arguments);
    }
});