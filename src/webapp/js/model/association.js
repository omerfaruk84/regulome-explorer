if (re.model === undefined) re.model = {};

re.model.association =  {
	types : [
        { 	id : 'score',
      			label : 'Aggressiveness',
      			ui : {
      			filter : {
      				 					component:   new re.multirangeField(
                                                      {   id:'score',
                                                          label: 'Aggressiveness',
                                                          default_value: 2.00,
                                                          min_value: -10,
                                                          max_value: 10
                                                        }
                                                  )
      			},
      			grid : {
      				column : { header: 'Aggressiveness', width:50, id:'score',dataIndex:'score'},
      				store_index : 'score'
      			}
      			},
      			query : {
      				id : 'score',
      				clause : flex_field_query,
                      order_id : 'score * association',
      				order_direction : 'DESC'
      			},
      			vis : {
      				network : {
      					edgeSchema : { name: "score", type: "number" }
      				},
      				tooltip : {
      					entry : {  'Aggressiveness' : 'score'}
      				},
                      scatterplot : {
                          scale_type :'linear',
                          values : {
                                 min : -10,
                                  max : 10
                              },
                          color_scale : pv.Scale.linear(-10,-0.1,0.1,10).range('blue','white','white','red')
      			}
      		}
        }
//		{ 	id : 'association',
//			label : 'Association',
//			ui : {
//                filter : {
//                    component: {
//                        width:          50,
//                        id: 'association',
//                        name :'Assoc.',
//                        xtype:          'combo',
//                        mode:           'local',
//                        defaultValue:   '',
//                        value:          '',
//                        triggerAction:  'all',
//                        forceSelection: true,
//                        editable:       false,
//                        fieldLabel:     'Assoc.',
//                        displayField:   'name',
//                        valueField:     'value',
//                        store:          new Ext.data.JsonStore({
//                            fields : ['name', 'value'],
//                            data   : [
//                                {name : 'Either',   value: ''},
//                                {name : '+',  value: '1'},
//                                {name : '-', value: '-1'}
//                            ]
//                        })
//                    }
//                },
//			grid : {
//				column : { header: 'Assoc.', width:50, id:'association',dataIndex:'association' },
//				store_index : 'association'
//				}
//			},
//			query : {
//				id : 'association',
//				clause : 'association = ',
//
//				order_direction : 'DESC'
//			},
//			vis : {
//				network : {
//					edgeSchema : { name: "association", type: "number" }
//				},
//				tooltip : {
//					entry : { 'Association' : 'association'}
//				},
//                scatterplot : {
//                    scale_type :'linear',
//                    values : {
//                        min:-1,
//                        max : 1
//                        },
//                    color_scale : pv.Scale.linear(-1,1).range('blue','red')
//                }
//			}
//		}
	]
};

re.model.association_map = pv.numerate(re.model.association.types, function(obj) { return obj.id;});