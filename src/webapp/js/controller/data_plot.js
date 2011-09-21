
function registerPlotListeners() {

var d = vq.events.Dispatcher;
    d.addListener('data_ready','associations',function(data) {
        generateColorMaps(data);
        renderCircleData(data);
        renderCircleLegend();
    });
     d.addListener('data_ready','dataset_labels',function(obj){
                   feature_types = obj.types;
    });
    d.addListener('data_ready','annotations',function(obj){
            chrome_length = obj['chrom_leng'];
    });
    d.addListener('data_ready','features',function(obj){
            feature_map = obj.map;
            feature_array = obj.array;
    });
    d.addListener('render_linearbrowser','circvis', function(obj){
        renderLinearData(obj);
        renderLinearLegend();
    });
    d.addListener('render_linearbrowser','feature_circvis', function(obj){
        renderLinearFeatureData(obj);
        renderLinearLegend();
    });
     d.addListener('data_ready','filteredfeatures',function(obj){
         generateColorMaps(obj);
            renderCircleFeatureData(obj);
         renderCircleLegend();
    });

    d.addListener('modify_circvis', function(obj){
        modifyCircle(obj);
    });
}


var locatable_source_list = ['GEXP','METH','CNVR','MIRN','GNAB'],
    unlocatable_source_list = ['CLIN','SAMP'],
    all_source_list = pv.blend([locatable_source_list,unlocatable_source_list]);
    all_source_map = pv.numerate(all_source_list),
    locatable_source_map = pv.numerate(locatable_source_list),
    link_type_colors = pv.colors("#c2c4ff","#e7cb94","#cedb9c","#e7969c","#e1daf9","#b8e2ef");
    link_sources_array =  [],
    stroke_style_attribute = function() { return 'white'; },
    inter_scale = pv.Scale.linear(0.00005,0.0004).range('lightpink','red'),
    linear_unit = 100000,
    proximal_distance = 2.5 * linear_unit,
    chrome_length = [],
    feature_map = {},
    feature_types = [],
    score_color_scale = pv.Scale.linear(max_score * -1, min_score * -1, min_score, max_score).range('blue','lightblue','lightpink','red'),
    source_color_scale=  pv.Colors.category10(),
    circvis = null;

var node_colors = function(source) { return source_color_scale(all_source_map[source]);};
var link_sources_colors;
var link_stroke_style;


function setStrokeStyleAttribute(attribute) {
    stroke_style_attribute = attribute;
}

function getStrokeStyleAttribute() {
    return stroke_style_attribute;
}

function setStrokeStyleToSource() {
    setStrokeStyleAttribute(function(feature) {
            return source_color_scale(all_source_map[feature.source]);
    });
}

function generateColorMaps(data) {
    link_stroke_style = pv.Scale.linear(-1,0,1).range('green','white','orange');
    setStrokeStyleToSource();
}

function renderLinearLegend() {
    legend_draw(document.getElementById('linear-legend-panel'));
}

function renderCircleLegend() {
    legend_draw(document.getElementById('circle-legend-panel'));
}

function renderCircleData(data) {
    wedge_plot(data, document.getElementById('circle-panel'));
}

function renderCircleFeatureData(obj) {
    plotFilteredFeatureData(obj.data,obj.filter, document.getElementById('circle-panel'));
}


function modifyCircle(object) {
    if (object.pan_enable != null) {
        circvis.setPanEnabled(object.pan_enable);
    }
    if (object.zoom_enable  != null) {
        circvis.setZoomEnabled(object.zoom_enable);
    }
}

function legend_draw(div) {
    var source_map = pv.numerate(feature_types);
    var current_locatable_data = locatable_source_list;
    var current_data = all_source_list;
    var current_map = label_map;

//    node_colors = function(source) { return source_color_scale(current_map[source]);};
//    link_sources_colors = function(link) { return link_sources_array[current_map[link[0]] * current_data.length + current_map[link[1]]];}

    var vis= new pv.Panel()
            .width(150)
            .height(90 + current_data.length * 13)
            .left(0)
            .top(20)
            .lineWidth(1)
            .strokeStyle('black')
            .canvas(div);

    var drawPanel = vis.add(pv.Panel)
            .top(20)
            .left(0);

    drawPanel.add(pv.Label)
            .textAlign('left')
            .top(10)
            .left(12)
            .text('Features')
            .font("14px helvetica");

    var color_panel = drawPanel.add(pv.Panel)
            .left(10)
            .top(10);
    var entry =  color_panel.add(pv.Panel)
            .data(current_locatable_data)
            .top(function() { return this.index*12;})
            .height(12);
    entry.add(pv.Bar)
            .left(0)
            .width(12)
            .top(1)
            .bottom(1)
            .fillStyle(function(type) { return source_color_scale(locatable_source_map[type]);});
    entry.add(pv.Label)
            .bottom(0)
            .left(20)
            .textAlign('left')
            .textBaseline('bottom')
            .font("11px helvetica");

    vis.render();
}

function plotFilteredFeatureData(feature_array,filter,div) {
    var width=800, height=800;
    var	ring_radius = width / 14;
    var chrom_keys = ["1","2","3","4","5","6","7","8","9","10",
        "11","12","13","14","15","16","17","18","19","20","21","22","X","Y"];
     var stroke_style_fn = getStrokeStyleAttribute();


    function genome_listener(chr) {
        var e = new vq.events.Event('render_linearbrowser','feature_circvis',{data:features,chr:chr});
            e.dispatch();
        }

    function wedge_listener(feature) {
                    var chr = feature.chr;
                    var start = bpToMb(feature.start) - 2.5;
                    var range_length = bpToMb(feature.end) - start + 2.5;
        var e = new vq.events.Event('render_linearbrowser','feature_circvis',{data:features,chr:chr,start:start,range:range_length});
                    e.dispatch();
                }
        var ucsc_genome_url = 'http://genome.ucsc.edu/cgi-bin/hgTracks';

       var karyotype_tooltip_items = {
           'Karyotype Label' : function(feature) { return  vq.utils.VisUtils.options_map(feature)['label'];},
            Location :  function(feature) { return 'Chr' + feature.chr + ' ' + feature.start + '-' + feature.end;}
        };
    var chrom_leng = vq.utils.VisUtils.clone(chrome_length);

    if (filter.chr !="*") {
        chrom_keys=chrom_keys.filter(function(f) { return f==filter.chr; });
        chrom_leng=chrom_leng.filter(function(f) { return f.chr_name ==filter.chr;});
    }

    var features = vq.utils.VisUtils.clone(feature_array);
    var ticks = vq.utils.VisUtils.clone(features);
    ticks.forEach(function(f) { f.value = f.label;});
    features.forEach(function(f){ f.value = Math.min(Math.max(f.score,max_score * -1),max_score);});



    var data = {
        GENOME: {
            DATA:{
                key_order : chrom_keys,
                key_length : chrom_leng
            },
            OPTIONS: {
                radial_grid_line_width: 1,
                label_layout_style : 'clock',
                listener : genome_listener,
                label_font_style : '18pt helvetica'
            }
        },
        TICKS : {
            DATA : {
                data_array : ticks
            },
            OPTIONS :{
                display_legend : false,
                listener : wedge_listener,
                //stroke_style :stroke_style_fn,
                fill_style : function(tick) {return node_colors(tick.source); },
                tooltip_items : {Tick : function(node) { return node.label+ ' ' + node.source + ' Chr' + node.chr + ' ' + node.start +
                    '-' + node.end;}},
                tooltip_links : {
                    'UCSC Genome Browser' :  function(feature){
                        return  ucsc_genome_url + '?position=chr' + feature.chr + ':' +  feature.start +'-'+ feature.end;  },
                    'Ensemble' : function(feature) {
                        return  'http://uswest.ensembl.org/Homo_sapiens/Location/View?r=' + feature.chr + ':' +  feature.start +'-'+ feature.end;  }
                }
            }
        },
        PLOT: {
            width : width,
            height :  height,
            horizontal_padding : 30,
            vertical_padding : 30,
            container : div,
            enable_pan : false,
            enable_zoom : false,
            show_legend: false,
            legend_include_genome : true,
            legend_corner : 'ne',
            legend_radius  : width / 15
        },
           WEDGE:[
            {
                PLOT : {
                    height : ring_radius/2,
                    type :   'karyotype'
                },
                DATA:{
                    data_array : cytoband
                },
                OPTIONS: {
                    legend_label : 'Karyotype Bands' ,
                    legend_description : 'Chromosomal Karyotype',
                    outer_padding : 10,
                    tooltip_items : karyotype_tooltip_items
                }
            },{
                             PLOT : {
                              height : ring_radius /2,
                              type : 'tile'
                          },
                          DATA:{data_array:vq.utils.VisUtils.clone(features).filter(function(f) { return f.source == 'CNVR';})},
                           OPTIONS: {
                               legend_description: 'Copy Number Variation Regions',
                               legend_label :'Copy Number Variation Regions',
                               outer_padding : 10,
                               tile_height : 5,
                               tile_padding : 2,
                               tile_overlap_distance : 100000,
                               tile_show_all_tiles : true,
                               fill_style : stroke_style_fn,
                                tooltip_items : {
                                    Node : function(node) {
                                        return node.label+ ' ' + node.source + ' Chr' + node.chr + ' ' + node.start +
                                        '-' + node.end;},
                                    'Logged pvalue' :'pvalue',
                                    'Score' : 'score',
                                    'Clinical Feature': 'clin',
                                    'Sign':'sign'
                                    },
                                listener : wedge_listener
                          }
                      },{
                    PLOT : {
                    height : ring_radius,
                    type :   'scatterplot'
                },
                DATA:{
                    data_array : features,
                    data_key : 'score'
                },
                OPTIONS: {
                    legend_label : 'Clinical Correlates' ,
                    legend_description : 'Clinical Correlates',
                    outer_padding : 10,
                    base_value : 0,
                    min_value : -1.1 * max_score,
                    max_value : 1.1* max_score,
                    radius : 2,
                    draw_axes : true,
                    shape:'dot',
                    stroke_style : function (feature) {
                          return score_color_scale(feature.value);
                    },
                    fill_style :  function (feature) {
                          return score_color_scale(feature.value);
                    },
                          tooltip_items : {
                                    Node : function(node) {
                                        return node.label+ ' ' + node.source + ' Chr' + node.chr + ' ' + node.start +
                                        '-' + node.end;},
                                    'Logged pvalue' :'pvalue',
                                    'Score' : 'score',
                                    'Clinical Feature': 'clin',
                                    'Sign':'sign'
                                    },
                    listener : wedge_listener
                }
            }
        ]
            };
    circvis = new vq.CircVis();
    var dataObject ={DATATYPE : "vq.models.CircVisData", CONTENTS : data };
    circvis.draw(dataObject);

    var e = new vq.events.Event('render_complete','circvis_features',circvis);
    e.dispatch();

    return circvis;
}

function wedge_plot(parsed_data,div) {
    var width=800, height=800;
    var	ring_radius = width / 20;
    var chrom_keys = ["1","2","3","4","5","6","7","8","9","10",
        "11","12","13","14","15","16","17","18","19","20","21","22","X","Y"];
     var stroke_style_fn = getStrokeStyleAttribute();


    function genome_listener(chr) {
        var e = new vq.events.Event('render_linearbrowser','circvis',{data:parsed_data,chr:chr});
            e.dispatch();
        }

    function wedge_listener(feature) {
                    var chr = feature.chr;
                    var start = bpToMb(feature.start) - 2.5;
                    var range_length = bpToMb(feature.end) - start + 2.5;
                    var e = new vq.events.Event('render_linearbrowser','circvis',{data:parsed_data,chr:chr,start:start,range:range_length});
                    e.dispatch();
                }
        var ucsc_genome_url = 'http://genome.ucsc.edu/cgi-bin/hgTracks';

       var karyotype_tooltip_items = {
           'Karyotype Label' : function(feature) { return  vq.utils.VisUtils.options_map(feature)['label'];},
            Location :  function(feature) { return 'Chr' + feature.chr + ' ' + feature.start + '-' + feature.end;}
        },
        unlocated_tooltip_items = {
            Target :  function(feature) { return feature.sourceNode.source + ' ' + feature.sourceNode.label +
                    (feature.sourceNode.chr ? ' Chr'+ feature.sourceNode.chr : '') +
                    (feature.sourceNode.start ? ' '+ feature.sourceNode.start : '') +
                    (feature.sourceNode.end ? '-'+ feature.sourceNode.end : '');},
            Predictor :  function(feature) { return feature.targetNode.source + ' ' + feature.targetNode.label +
                    (feature.targetNode.chr ? ' Chr'+ feature.targetNode.chr : '') +
                    (feature.targetNode.start ? ' '+ feature.targetNode.start : '') +
                    (feature.targetNode.end ? '-'+ feature.targetNode.end : '');}
        };
    var chrom_leng = vq.utils.VisUtils.clone(chrome_length);

    var ticks = vq.utils.VisUtils.clone(parsed_data['features']);

    var unlocated_map = vq.utils.VisUtils.clone(parsed_data['unlocated']).filter(function(link) { return  link.node1.chr != '';})
            .map(function(link) {
      var node =  vq.utils.VisUtils.extend(link.node2,{ chr:link.node1.chr, start:link.node1.start,end:link.node1.end, value: 0});
        node.sourceNode = vq.utils.VisUtils.extend({},link.node1); node.targetNode = vq.utils.VisUtils.extend({},link.node2);
        return node;
    }).concat(vq.utils.VisUtils.clone(parsed_data['unlocated']).filter(function(link) { return  link.node2.chr != '';})
            .map(function(link) {
      var node =  vq.utils.VisUtils.extend(link.node1,{ chr:link.node2.chr, start:link.node2.start,end:link.node2.end, value: 0});
        node.sourceNode = vq.utils.VisUtils.extend({},link.node1); node.targetNode = vq.utils.VisUtils.extend({},link.node2);
        return node;
    }));

    var data = {
        GENOME: {
            DATA:{
                key_order : chrom_keys,
                key_length : chrom_leng
            },
            OPTIONS: {
                radial_grid_line_width: 1,
                label_layout_style : 'clock',
                listener : genome_listener,
                label_font_style : '18pt helvetica'
            }
        },
        TICKS : {
            DATA : {
                data_array : ticks
            },
            OPTIONS :{
                display_legend : false,
                listener : wedge_listener,
                stroke_style :stroke_style_fn,
                fill_style : function(tick) {return node_colors(tick.source); },
                tooltip_items : {Tick : function(node) { return node.label+ ' ' + node.source + ' Chr' + node.chr + ' ' + node.start +
                    '-' + node.end;}},
                tooltip_links : {
                    'UCSC Genome Browser' :  function(feature){
                        return  ucsc_genome_url + '?position=chr' + feature.chr + ':' +  feature.start +'-'+ feature.end;  },
                    'Ensemble' : function(feature) {
                        return  'http://uswest.ensembl.org/Homo_sapiens/Location/View?r=' + feature.chr + ':' +  feature.start +'-'+ feature.end;  }
                }
            }
        },
        PLOT: {
            width : width,
            height :  height,
            horizontal_padding : 30,
            vertical_padding : 30,
            container : div,
            enable_pan : false,
            enable_zoom : false,
            show_legend: true,
            legend_include_genome : true,
            legend_corner : 'ne',
            legend_radius  : width / 15
        },
           WEDGE:[
            {
                PLOT : {
                    height : ring_radius/2,
                    type :   'karyotype'
                },
                DATA:{
                    data_array : cytoband
                },
                OPTIONS: {
                    legend_label : 'Karyotype Bands' ,
                    legend_description : 'Chromosomal Karyotype',
                    outer_padding : 10,
                    tooltip_items : karyotype_tooltip_items
                }
            },{
                    PLOT : {
                    height : ring_radius/2,
                    type :   'scatterplot'
                },
                DATA:{
                    data_array : parsed_data['unlocated_features']
                },
                OPTIONS: {
                    legend_label : 'Clinical Correlates' ,
                    legend_description : 'Clinical Correlates',
                    outer_padding : 10,
                    base_value : 0,
                    min_value : -1,
                    max_value : 1,
                    radius : 4,
                    draw_axes : false,
                    shape:'dot',
                    stroke_style :  stroke_style_fn,
                    fill_style :  stroke_style_fn,
                    tooltip_items : {
                                    Node : function(node) {
                                        return node.label+ ' ' + node.source + ' Chr' + node.chr + ' ' + node.start +
                                        '-' + node.end;},
                                 Pvalue : 'pvalue',
                                    Score : 'score',
                                    'Clinical Feature':'clin',
                                    'Sign':'sign'
                                    },
                    listener : wedge_listener
                }
            }
        ], NETWORK:{
            DATA:{
                data_array : parsed_data['network']
            },
            OPTIONS: {
                outer_padding : 15,
                node_highlight_mode : 'isolate',
                node_fill_style : 'ticks',
                node_stroke_style : stroke_style_fn,
                link_line_width : 2,
                node_key : function(node) { return node['label'];},
                node_listener : wedge_listener,
                //link_listener: initiateDetailsPopup,
                link_stroke_style : function(link) {
                    return link_stroke_style(link.correlation);},
                constant_link_alpha : 0.7,
                node_tooltip_items :  {Node : function(node) { return node.label+ ' ' + node.source + ' Chr' + node.chr + ' ' + node.start +
                            '-' + node.end;}},
                 node_tooltip_links : {
                    'UCSC Genome Browser' :  function(feature){
                        return  ucsc_genome_url + '?position=chr' + feature.chr + ':' +  feature.start +'-'+ feature.end;  },
                    'Ensemble' : function(feature) {
                        return  'http://uswest.ensembl.org/Homo_sapiens/Location/View?r=' + feature.chr + ':' +  feature.start +'-'+ feature.end;  }
                },
                link_tooltip_items :  {
                    'Target' : function(link) { return link.sourceNode.label+ ' ' + link.sourceNode.source + ' Chr' + link.sourceNode.chr + ' ' + link.sourceNode.start +
                            '-' + link.sourceNode.end;},

                    'Predictor' : function(link) { return link.targetNode.label+ ' ' + link.targetNode.source + ' Chr' + link.targetNode.chr + ' ' + link.targetNode.start +
                            '-' + link.targetNode.end;},
                    Score : 'score',
                    Correlation : 'correlation',
                    pvalue : 'pvalue',
                    'Clinical Associate': 'clin'
                }
            }
}};
    circvis = new vq.CircVis();
    var dataObject ={DATATYPE : "vq.models.CircVisData", CONTENTS : data };
    circvis.draw(dataObject);

    var e = new vq.events.Event('render_complete','circvis',circvis);
    e.dispatch();

    return circvis;
}


function bpToMb(bp) {
    return bp != null ? (bp == 0 ? 0 : bp / 1000000): null;
}

function mbpToBp(num) {
    return Math.floor(num* 1000000);
}

function renderLinearData(obj) {
    linear_plot(vq.utils.VisUtils.extend(obj,{div:document.getElementById('linear-panel')}));
}
function renderLinearFeatureData(obj) {
    plotFeatureDataLinear(vq.utils.VisUtils.extend(obj,{div:document.getElementById('linear-panel')}));
}


function linear_plot(obj) {
    var div = obj.div || null, parsed_data = obj.data || [], chrom = obj.chr || '1', start = obj.start || null, range_length = obj.range || null;
     var ucsc_genome_url = 'http://genome.ucsc.edu/cgi-bin/hgTracks';
          var tile_listener = function(feature){
              window.open(ucsc_genome_url + '?position=chr' + feature.chr + ':' + mbpToBp(feature.start) +
                      '-'+ mbpToBp(feature.end),'_blank');
              return false;
              };
    var spot_listener = function(feature){
              window.open(ucsc_genome_url + '?position=chr' + feature.chr + ':' + mbpToBp(feature.start)  +
                      '-'+ mbpToBp(feature.start+ 20),'_blank');
              return false;
              };

     var stroke_style_fn = getStrokeStyleAttribute();

     var unlocated_tooltip_items = {
            Target : function(tie) {
            return tie.sourceNode.label + ' ' + tie.sourceNode.source},
        Predictor : function(tie) {
          return tie.targetNode.label + ' ' + tie.targetNode.source },
         'Importance' : 'importance',
         Correlation : 'correlation',
         pvalue : 'pvalue'

        },
        located_tooltip_items = {
                Feature : function(node) {
                                        return node.label+ ' ' + node.source + ' Chr' + node.chr + ' ' + node.start +
                                        '-' + node.end;},
                                    Score :function(node) { return feature_map[node.id] ? feature_map[node.id].score : 'NA';},
                                    'Clinical Feature':function(node) { return feature_map[node.id] ? feature_map[node.id].clin : 'NA';},
                                    'Aggressiveness':function(node) { return feature_map[node.id] ? feature_map[node.id].agg : 'NA';}
        },
        inter_tooltip_items = {
            'Node 1' : function(tie) {
            return tie.sourceNode.label + ' ' + tie.sourceNode.source + ' Chr' +tie.sourceNode.chr + ' ' +tie.sourceNode.start +'-'+
                    tie.sourceNode.end;},
        'Node 2' : function(tie) {
          return tie.targetNode.label + ' ' + tie.targetNode.source +
                  ' Chr' + tie.targetNode.chr+ ' ' +tie.targetNode.start +'-'+tie.targetNode.end;},
         'Importance' : 'importance',
         Correlation : 'correlation',
            Score : 'score'

        };

    var hit_map = parsed_data['unlocated'].filter(function(link) { return  link.node1.chr == chrom;})
            .map(function(link) {
        var node1_clone = vq.utils.VisUtils.extend({pvalue:link.pvalue,importance:link.importance, correlation:link.correlation},link.node1);
                node1_clone.start = bpToMb(node1_clone.start); node1_clone.end = bpToMb(node1_clone.end);
        node1_clone.sourceNode = vq.utils.VisUtils.extend({},link.node1);
        node1_clone.targetNode = vq.utils.VisUtils.extend({},link.node2);
        return node1_clone;
    }).concat(parsed_data['unlocated'].filter(function(link) { return  link.node2.chr == chrom;})
            .map(function(link) {
      var node1_clone = vq.utils.VisUtils.extend({pvalue:link.pvalue,importance:link.importance, correlation:link.correlation},link.node2);
                node1_clone.start = bpToMb(node1_clone.start); node1_clone.end = bpToMb(node1_clone.end);
        node1_clone.sourceNode = vq.utils.VisUtils.extend({},link.node1);
        node1_clone.targetNode = vq.utils.VisUtils.extend({},link.node2);
        return node1_clone;
        }));


    var tie_map = parsed_data['network'].filter(function(link) {
        return link.node1.chr == chrom && link.node2.chr == chrom &&
                Math.abs(link.node1.start - link.node2.start) > proximal_distance;})
            .map(function(link) {
      var node1_clone = vq.utils.VisUtils.extend({pvalue:link.pvalue,importance:link.importance, correlation:link.correlation},link.node1);
        node1_clone.start = link.node1.start <= link.node2.start ?
                link.node1.start : link.node2.start;
        node1_clone.end = link.node1.start <= link.node2.start ? link.node2.start : link.node1.start;
        node1_clone.start = bpToMb(node1_clone.start);node1_clone.end = bpToMb(node1_clone.end);
        node1_clone.sourceNode = vq.utils.VisUtils.extend({},link.node1);
        node1_clone.targetNode = vq.utils.VisUtils.extend({},link.node2);
        node1_clone.importance = link.importance,node1_clone.correlation = link.correlation;
                node1_clone.pvalue = link.pvalue;
        return node1_clone;
    });

    var neighbor_map = parsed_data['network'].filter(function(link) {
        return link.node1.chr == chrom && link.node2.chr == chrom &&
                Math.abs(link.node1.start - link.node2.start) < proximal_distance;})
            .map(function(link) {
     var node1_clone = vq.utils.VisUtils.extend({pvalue:link.pvalue,importance:link.importance, correlation:link.correlation},link.node1),
        node2_clone = vq.utils.VisUtils.extend({},link.node2);
        node1_clone.start = bpToMb(node1_clone.start);node1_clone.end = bpToMb(node1_clone.end);
        node1_clone.sourceNode = vq.utils.VisUtils.extend({},link.node1);
        node1_clone.targetNode = vq.utils.VisUtils.extend({},link.node2);

        return node1_clone;
    });


    var locations = vq.utils.VisUtils.clone(parsed_data['features']).filter(function(node) { return node.chr == chrom;})
            .map(function (location)  {
    var node =location;
        node.start = bpToMb(node.start);node.end = bpToMb(node.end);
        node.label = location.value;
        return node;
    });
    var node2_locations = parsed_data['network']
            .filter(function(link) {  return link.node2.chr == chrom;})
            .map(function(link) {
        var node = vq.utils.VisUtils.extend({},link.node2);
               	node.start = bpToMb(node.start); node.end = bpToMb(node.end);
        return node;
    });

    locations = locations.concat(node2_locations);

    var location_map = pv.numerate(locations,function(node) { return node.id+'';});

    locations = pv.permute(locations,pv.values(location_map));
      var  tooltip_links = {
                    'UCSC Genome Browser' :  function(feature){
                        return  ucsc_genome_url + '?position=chr' + feature.chr + ':' +  feature.start +'-'+ feature.end;  },
                    'Ensemble' : function(feature) {
                        return  'http://uswest.ensembl.org/Homo_sapiens/Location/View?r=' + feature.chr + ':' +  feature.start +'-'+ feature.end;  }
                };

    var data_obj = function() { return {
        PLOT :     {
            width:800,
            height:700,
            min_position:1,
            max_position:maxPos,
            vertical_padding:20,
            horizontal_padding:20,
            container : div,
            context_height: 100},
        TRACKS : [
            { type: 'tile',
                label : 'Feature Locations',
                description : 'Genome Location of Features',
                CONFIGURATION: {
                    fill_style : function (feature) {
                         if (feature_map[feature.id]) {
                          return score_color_scale(feature_map[feature.id].score * feature_map[feature.id].agg);
                         }
                         return stroke_style_fn(feature);
                    },          //required
                    stroke_style : function (feature) {
                         if (feature_map[feature.id]) {
                          return score_color_scale(feature_map[feature.id].score * feature_map[feature.id].agg);
                         }
                         return stroke_style_fn(feature);
                    },          //required
                    track_height : 50,           //required
                    tile_height:20,                //required
                    track_padding: 20,             //required
                    tile_padding:6,              //required
                    tile_overlap_distance:1,    //required
                    notifier:tile_listener         //optional
                },
                    OPTIONS: {
                    tooltip_links:tooltip_links,
                    tooltip_items :  located_tooltip_items     //optional
                },
                data_array : locations
            },  { type: 'glyph',
                label : 'Unmapped Feature Correlates',
                description : '',
                CONFIGURATION: {
                    fill_style : stroke_style_fn,
                    stroke_style : null,
                    track_height : 60,
                    track_padding: 20,
                    tile_padding:6,              //required
                    tile_overlap_distance:.1,    //required
                    shape :  'dot',
                    tile_show_all_tiles : true,
                    radius : 3
                    },
                    OPTIONS: {
                    tooltip_links:tooltip_links,
                  tooltip_items : unlocated_tooltip_items
                },
                data_array : hit_map
            },
                { type: 'glyph',
                label : 'Proximal Feature Predictors',
                description : '',
                CONFIGURATION: {
                    fill_style : function(link) {
                        return link_stroke_style(link.correlation);},
                    stroke_style : null,
                    track_height : 80,
                    track_padding: 20,
                    tile_padding:4,              //required
                    tile_overlap_distance:1,    //required
                    shape :  'dot',
                    tile_show_all_tiles : true,
                    radius : 3
                    },
                    OPTIONS: {
                  tooltip_items : inter_tooltip_items
                },
                data_array : neighbor_map
            },
            { type: 'tile',
                label : 'Distal Intra-Chromosomal Correlates',
                description : '',
                CONFIGURATION: {
                    stroke_style : function(link) {
                        return link_stroke_style(link.correlation);},
                    fill_style : function(link) {
                        return link_stroke_style(link.correlation);},
                    track_height : 280,
                    track_padding: 15,             //required
                    tile_height : 2,
                    tile_padding:7,              //required
                    tile_overlap_distance:.1,    //required
                    tile_show_all_tiles : true
                    },
                    OPTIONS: {
                    tooltip_items : inter_tooltip_items
                },
                data_array : tie_map
            }]
    }
    };
    var chrom_leng = vq.utils.VisUtils.clone(chrome_length);
    var chr_match = chrom_leng.filter(function(chr_obj) { return chr_obj.chr_name == chrom;});
    var maxPos = Math.ceil(bpToMb(chr_match[0]['chr_length']));

    var lin_browser = new vq.LinearBrowser();
    var lin_data = {DATATYPE: 'vq.models.LinearBrowserData',CONTENTS: data_obj()};

    lin_browser.draw(lin_data);

    if (start != null && start > 0 && range_length != null && range_length > 0) {
        lin_browser.setFocusRange(start,range_length);
    }

  obj.vis = lin_browser;
    var e = new vq.events.Event('render_complete','linear',obj);
    e.dispatch();

      return lin_browser;
}

function plotFeatureDataLinear(obj) {
    var div = obj.div || null, features = obj.data || [], chrom = obj.chr || '1', start = obj.start || null, range_length = obj.range || null;

    features=features.filter(function(f) { return f.chr == chrom;});

     var ucsc_genome_url = 'http://genome.ucsc.edu/cgi-bin/hgTracks';
          var tile_listener = function(feature){
              window.open(ucsc_genome_url + '?position=chr' + feature.chr + ':' + mbpToBp(feature.start) +
                      '-'+ mbpToBp(feature.end),'_blank');
              return false;
              };
     var stroke_style_fn = getStrokeStyleAttribute();
     var located_tooltip_items = {
                                    Node : function(node) {
                                        return node.label+ ' ' + node.source + ' Chr' + node.chr + ' ' + node.start +
                                        '-' + node.end;},
                                 Pvalue : 'pvalue',
                                    Score : 'score',
                                    'Clinical Feature':'clin',
                                    'Sign':'sign'

        };

    var  tooltip_links = {
                    'UCSC Genome Browser' :  function(feature){
                        return  ucsc_genome_url + '?position=chr' + feature.chr + ':' +  feature.start +'-'+ feature.end;  },
                    'Ensemble' : function(feature) {
                        return  'http://uswest.ensembl.org/Homo_sapiens/Location/View?r=' + feature.chr + ':' +  feature.start +'-'+ feature.end;  }
                };

    var data_obj = function() { return {
        PLOT :     {
            width:800,
            height:700,
            min_position:1,
            max_position:maxPos,
            vertical_padding:20,
            horizontal_padding:20,
            container : div,
            context_height: 100},
        TRACKS : [
            { type: 'glyph',
                label : 'Feature Types',
                description : 'Genome Location of Features',
                CONFIGURATION: {
                    fill_style : stroke_style_fn,
                    stroke_style : stroke_style_fn,
                    shape : function(feature) {
                        switch(feature.source) {
                            case('GEXP') :
                                return 'circle';
                                break;
                            case('METH') :
                                return 'diamond';
                                break;
                            case('MIRN') :
                                return 'triangle';
                                break;
                            case('GNAB') :
                                return 'cross';
                                break;
                            case('CNVR') :
                                return 'square';
                                break;
                        }
                    },
                    track_height : 290,           //required
                    track_padding: 30,             //required
                    tile_height:12,                //required
                    tile_padding:3,              //required
                    radius: 4,
                    //required
                    tile_overlap_distance:1,    //required
                    tile_show_all_tiles : true,
                    track_fill_style : pv.color('#EEDDEE'),
                    track_line_width : 1,
                    track_stroke_style: pv.color('#000000'),
                    notifier:tile_listener         //optional
                },
                OPTIONS: {
                    tooltip_links : tooltip_links,
                    tooltip_items :  located_tooltip_items     //optional
                },
                data_array : vq.utils.VisUtils.clone(features).map(function (location)  {
                    var node =location;
                    node.start = bpToMb(node.start);node.end = bpToMb(node.end);
                    return node;
                })
            },{ type: 'scatter',
                label : 'Feature Scores',
                description : 'Clinical Scores of Features',
                CONFIGURATION: {
                    fill_style : function (feature) {  return score_color_scale(feature.value);  },          //required
                    stroke_style : function (feature) { return 'grey';},//return score_color_scale(feature.value);  },          //required
                    track_fill_style : pv.color('#EEEEEE'),
                    track_height : 200,           //required
                    track_padding: 20,             //required
                    min_value : -1.1 * max_score,
                    max_value : max_score * 1.1,
                    base_value : 0,
                    num_y_rule_lines: 5,
                    shape:'circle',
                    radius:4,
                    notifier:tile_listener
                },//optional
                OPTIONS: {
                    tooltip_links : tooltip_links,
                    tooltip_items :  located_tooltip_items     //optional
                },
                data_array : vq.utils.VisUtils.clone(features).map(function (location)  {
                    var node =location;
                    node.start = bpToMb(node.start);node.end = bpToMb(node.end);
                    return node;
                })
            }]
    }
    };
    var chrom_leng = vq.utils.VisUtils.clone(chrome_length);
    var chr_match = chrom_leng.filter(function(chr_obj) { return chr_obj.chr_name == chrom;});
    var maxPos = Math.ceil(bpToMb(chr_match[0]['chr_length']));

    var lin_browser = new vq.LinearBrowser();
    var lin_data = {DATATYPE: 'vq.models.LinearBrowserData',CONTENTS: data_obj()};

    lin_browser.draw(lin_data);

    if (start != null && start > 0 && range_length != null && range_length > 0) {
        lin_browser.setFocusRange(start,range_length);
    }

    obj.vis = lin_browser;
    var e = new vq.events.Event('render_complete','linear_features',obj);
    e.dispatch();

      return lin_browser;
}