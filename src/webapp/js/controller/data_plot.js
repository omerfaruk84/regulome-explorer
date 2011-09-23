
function registerPlotListeners() {

var d = vq.events.Dispatcher;
    d.addListener('data_ready','associations',function(data) {
        renderCircleData(data,biovis.displayOptions());
        renderCircleLegend();
    });
     d.addListener('data_ready','dataset_labels',function(obj){
        generateColorMaps(obj);
    });
    d.addListener('data_ready','annotations',function(obj){
            chrome_length = obj['chrom_leng'];
    });
    d.addListener('render_scatterplot','details', function(obj){
        scatterplot_draw(obj);
    });
        d.addListener('render_linearbrowser', function(obj){
        renderLinearData(obj);
         renderLinearLegend();
    });
        d.addListener('modify_circvis', function(obj){
            modifyCircle(obj);
    });
}


var locatable_source_list = ['GEXP','METH','CNVR','MIRN','GNAB','GENO'],
    unlocatable_source_list = ['CLIN','SAMP','PHENO'],
    all_source_list = pv.blend([locatable_source_list,unlocatable_source_list]);
    all_source_map = pv.numerate(all_source_list),
    locatable_source_map = pv.numerate(locatable_source_list),
    link_type_colors = pv.colors("#c2c4ff","#e7cb94","#cedb9c","#e7969c","#e1daf9","#b8e2ef");
    link_sources_array =  [],
            stroke_style_attribute = 'white',
    inter_scale = pv.Scale.linear(0.00005,0.0004).range('lightpink','red'),
    linear_unit = 100000,
    proximal_distance = 2.5 * linear_unit,
            chrome_length = [],
        circvis = null,
        chr_color_map = pv.colors('red','orange','yellow','green','blue','indigo','violet'),
    source_color_scale=  pv.Colors.category10();

var node_colors = function(source) { return source_color_scale(all_source_map[source]);};
var link_sources_colors;


function setStrokeStyleAttribute(attribute) {
    stroke_style_attribute = attribute;
}

function getStrokeStyleAttribute() {
    return stroke_style_attribute;
}

function setStrokeStyleToInterestingness() {
    setStrokeStyleAttribute(function(feature) {
                                        return (feature.type = 'GEXP' ? inter_scale(feature.genescore) : 'white');
    });
}

function generateColorMaps(dataset_labels) {
    var current_source_list = dataset_labels['feature_sources'].map(function(row) { return row.source;});
       var num_sources = current_source_list.length;
       link_sources_array = [];
       current_source_list.forEach(function(row, index) {
        var color = link_type_colors(index);
        for (var i = 0; i < num_sources; i++) {
            link_sources_array.push(color);
            color = color.darker(.3);
        }
    });
    var source_map = pv.numerate(dataset_labels['feature_sources'], function(row) {return row.source;});
    var current_data = all_source_list.filter(function(input_row){return source_map[input_row] != undefined;});
    var current_map = pv.numerate(current_data);

    node_colors = function(source) { return source_color_scale(current_map[source]);};
    link_sources_colors = function(link) { return link_sources_array[current_map[link[0]] * current_data.length + current_map[link[1]]];}
}

function renderCircleLegend() {
    legend_draw(document.getElementById('circle-legend-panel'));
}
function renderLinearLegend() {
    legend_draw(document.getElementById('linear-legend-panel'));
}
function renderCircleData(data, display_options) {
    circvis = wedge_plot(data, display_options,document.getElementById('circle-panel'));
}

function renderLinearData(obj) {
    linear_plot(vq.utils.VisUtils.extend(obj,{div:document.getElementById('linear-panel')}));
}

function inter_chrom_click(node) {
    initiateDetailsPopup(node);
}

function initiateDetailsPopup(link) {
   var e =new vq.events.Event('click_association','vis',link);
    e.dispatch();
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
    var dataset_labels = getDatasetLabels();
    var source_map = pv.numerate(dataset_labels['feature_sources'], function(row) {return row.source;});
    var current_locatable_data = locatable_source_list.filter(function(input_row){return source_map[input_row] != undefined;});
    var current_data = all_source_list.filter(function(input_row){return source_map[input_row] != undefined;});
    var current_map = pv.numerate(current_data);

    node_colors = function(source) { return source_color_scale(current_map[source]);};
    link_sources_colors = function(link) { return link_sources_array[current_map[link[0]] * current_data.length + current_map[link[1]]];}

    var vis= new pv.Panel()
            .width(150)
            .height(90 + Math.pow(current_data.length,2) * 13)
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

    var link_panel = drawPanel.add(pv.Panel)
            .top(60)
            .bottom(10)
            .left(10);
    link_panel.add(pv.Label)
            .top(0)
            .textBaseline('bottom')
            .left(0)
            .text('Links')
            .font('14px helvetica');

    var link = link_panel.add(pv.Panel)
            .data(pv.cross(current_data,current_data))
            .top(function() { return this.index*12;})
            .height(12);

    link.add(pv.Bar)
            .left(0)
            .width(12)
            .top(1)
            .bottom(1)
            .fillStyle(function(type) { return link_sources_colors(type);});

    link.add(pv.Label)
            .bottom(0)
            .left(20)
            .textAlign('left')
            .textBaseline('bottom')
            .font('11px helvetica')
            .text(function(types) { return types[1] + ' -> ' + types[0];});

    vis.render();
}


function wedge_plot(parsed_data,display_options,div) {
    var width=800, height=800;
    var	ring_radius = width / 20;
    var chrom_keys = ["4","5","13","16","18","X"];
//    var chrom_keys = ["1","2","3","4","5","6","7","8","9","10",
//        "11","12","13","14","15","16","17","18","19","20","21","22","X","Y"];
     var stroke_style = getStrokeStyleAttribute();

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
                stroke_style :stroke_style,
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
                       height : ring_radius/4,
                       type :   'band'
                   },
                   DATA:{
                       data_array :[
                           {chr:"4", start:0, end:191273063,value:0},
                           {chr:"5", start:0, end:180857866,value:1},
                           {chr:"13", start:0, end:114142980,value:2},
                           {chr:"16", start:0, end:88827254,value:3},
                           {chr:"18", start:0, end:76117153,value:4},
                           {chr:"X", start:0, end:154913754,value:5}
                       ]
                   },
                   OPTIONS: {
                       legend_label : 'Chromosome' ,
                       legend_description : 'Chromosome',
                       outer_padding : 10,
                       tile_height : ring_radius / 4,
                       tile_padding : 0,
                       tile_show_all_tiles: true,
                       fill_style : function(feature) { return chr_color_map(feature.value);},
                       stroke_style : function(feature) { return null;},
                       tooltip_items: {Chromosome : 'chr', Length : 'end'}
                   }
               },
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
                    data_array : unlocated_map
                },
                OPTIONS: {
                    legend_label : 'Affection Correlates' ,
                    legend_description : 'Affection Correlates',
                    outer_padding : 10,
                    base_value : 0,
                    min_value : -1,
                    max_value : 1,
                    radius : 4,
                    draw_axes : false,
                    shape:'dot',
                    fill_style  : function(feature) {return link_sources_colors([feature.sourceNode.source,feature.targetNode.source]); },
                    //stroke_style  : function(feature) {return link_sources_colors([feature.sourceNode.source,feature.targetNode.source]); },
                    stroke_style : stroke_style,
                    tooltip_items : unlocated_tooltip_items,
                    listener : initiateDetailsPopup
                }
            }
        ],

        NETWORK:{
            DATA:{
                data_array : parsed_data['network']
            },
            OPTIONS: {
                outer_padding : 15,
                node_highlight_mode : 'isolate',
                node_fill_style : 'ticks',
                node_stroke_style : stroke_style,
                link_line_width : 2,
                node_key : function(node) { return node['label'];},
                tile_nodes : display_options.tile_nodes,
                node_overlap_distance : display_options.node_overlap_distance,
                node_listener : wedge_listener,
                link_listener: initiateDetailsPopup,
                link_stroke_style : function(link) {
                    return link_sources_colors([link.sourceNode.source,link.targetNode.source]);},
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
                    'Importance' : 'importance',
                    Correlation : 'correlation',
                    pvalue : 'pvalue'
                }
            }
        }
    };
    var circle_vis = new vq.CircVis();
    circvis = circle_vis;
    var dataObject ={DATATYPE : "vq.models.CircVisData", CONTENTS : data };
    circle_vis.draw(dataObject);

    var e = new vq.events.Event('render_complete','circvis',circle_vis);
    e.dispatch();

    return circle_vis;
}

function bpToMb(bp) {
    return bp != null ? (bp == 0 ? 0 : bp / 1000000): null;
}

function mbpToBp(num) {
    return Math.floor(num* 1000000);
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

    var stroke_style = getStrokeStyleAttribute();

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
            Target : function(tie) {
            return tie.label + ' ' + tie.source + ' Chr' +tie.chr + ' ' +
                    mbpToBp(tie.start) + (tie.end != null ? '-'+mbpToBp(tie.end) : '');}
        },
        inter_tooltip_items = {
            Target : function(tie) {
            return tie.sourceNode.label + ' ' + tie.sourceNode.source + ' Chr' +tie.sourceNode.chr + ' ' +tie.sourceNode.start +'-'+
                    tie.sourceNode.end;},
        Predictor : function(tie) {
          return tie.targetNode.label + ' ' + tie.targetNode.source +
                  ' Chr' + tie.targetNode.chr+ ' ' +tie.targetNode.start +'-'+tie.targetNode.end;},
         'Importance' : 'importance',
         Correlation : 'correlation',
            pvalue : 'pvalue'

        },
         feature_tooltip_items = {
                          Feature : function(node) { return node.label+ ' ' + node.source + ' Chr' + node.chr + ' ' + node.start +
                    '-' + node.end;}
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

        var  tooltip_links = {
                    'UCSC Genome Browser' :  function(feature){
                        return  ucsc_genome_url + '?position=chr' + feature.chr + ':' +  mbpToBp(feature.start) +'-'+ mbpToBp(feature.end);  },
                    'Ensemble' : function(feature) {
                        return  'http://uswest.ensembl.org/Homo_sapiens/Location/View?r=' + feature.chr + ':' +  mbpToBp(feature.start) +
                                '-'+ mbpToBp(feature.end);  }
                };

    locations = locations.concat(node2_locations);

    var location_map = pv.numerate(locations,function(node) { return node.id+'';});

    locations = pv.permute(locations,pv.values(location_map));

    var data_obj = function() { var obj = {
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
                    fill_style : function(node) { return node_colors(node.source);},          //required
                    stroke_style : function(node) { return node_colors(node.source);},          //required
                    track_height : 50,           //required
                    tile_height:20,                //required
                    track_padding: 20,             //required
                    tile_padding:6,              //required
                    tile_overlap_distance:1,    //required
                                        track_fill_style : pv.color('#EEEEEE'),
                    track_line_width : 1,
                    track_stroke_style: pv.color('#000000'),
                    notifier:tile_listener         //optional
                       },
             OPTIONS: {
                    tooltip_links : tooltip_links,
                    tooltip_items :  feature_tooltip_items     //optional
                },
                data_array : locations
            },  { type: 'glyph',
                label : 'Affection Correlates',
                description : '',
                CONFIGURATION: {
                    fill_style : function(hit) { return node_colors(hit.source);},
                    stroke_style : null,
                    track_height : 40,
                    track_padding: 20,
                    tile_padding:6,              //required
                    tile_overlap_distance:.1,    //required
                    shape :  'dot',
                    tile_show_all_tiles : true,
                    radius : 6,
                     track_fill_style : pv.color('#EEDEDD'),
                    track_line_width : 1,
                    track_stroke_style: pv.color('#000000'),
                    notifier:inter_chrom_click
                       },
             OPTIONS: {
                  tooltip_items : unlocated_tooltip_items
                },
                data_array : hit_map
            }
           ]
    };
         if (neighbor_map.length > 0) { obj.TRACKS.push( { type: 'glyph',
                label : 'Proximal Feature Predictors',
                description : '',
                CONFIGURATION: {
                    fill_style : function(link) { return link_sources_colors([link.sourceNode.source,link.targetNode.source])},
                    stroke_style : null,
                    track_height : 80,
                    track_padding: 20,
                    tile_padding:4,              //required
                    tile_overlap_distance:1,    //required
                    shape :  'dot',
                    tile_show_all_tiles : true,
                    radius : 3,
                      track_fill_style : pv.color('#DDEEEE'),
                    track_line_width : 1,
                    track_stroke_style: pv.color('#000000'),
                    notifier:inter_chrom_click
                       },
             OPTIONS: {
                  tooltip_items : inter_tooltip_items
                },
                data_array : neighbor_map
            });
    }
     if (tie_map.length > 0) { obj.TRACKS.push({ type: 'tile',
                label : 'Distal Intra-Chromosomal Correlates',
                description : '',
                CONFIGURATION: {
                    fill_style :  function(link) { return link_sources_colors([link.sourceNode.source,link.targetNode.source]);},
                    stroke_style : function(link) { return link_sources_colors([link.sourceNode.source,link.targetNode.source]);},
                    track_height :  300 ,
                    track_padding: 15,             //required
                    tile_height : 2,
                    tile_padding:4,              //required
                    tile_overlap_distance:.1,    //required
                    tile_show_all_tiles : true,
                    track_fill_style : pv.color('#EEDDEE'),
                    track_line_width : 1,
                    track_stroke_style: pv.color('#000000'),
                    notifier : inter_chrom_click
                },
             OPTIONS: {
                    tooltip_items : inter_tooltip_items
                },
                data_array : tie_map
            });
    }
        return obj;
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


    var e = new vq.events.Event('render_complete','linear',{plot: lin_browser, params: obj});
    e.dispatch();

      return lin_browser;
}

function isOrdinal(label) {
    return label =='B';
}

function isNominal(label) {
    return  label =='C';
}

function isNonLinear(label) {
    return isOrdinal(label) || isNominal(label);
}

var scatterplot_data;

function scatterplot_draw(params) {
    var patients = params.data || scatterplot_data || {data:[]}, div = params.div || null, regression_type = params.regression_type || 'none', reverse_axes = params.reverse_axes || false;
        scatterplot_data = patients;
     var highlight = false;
    var highlight_arr = [];
    var stroke_style = 'grey';
    var fill_style = stroke_style;

        if (patients['data'] === undefined) {return;}  //prevent null plot
        var data = patients['data'];

    var dataset_labels=getDatasetLabels();
    var patient_labels = dataset_labels['patients'];
    if(patients['highlight_data'] != undefined) {
      highlight= true;
        highlight_arr = patients['highlight_data']['patient_values'].split(':');
        //var scale = pv.Colors.category10(highlight_arr);
         stroke_style = function(data) { return data['highlight'] == 1 ? 'dodgerblue' : 'lightcoral';};
        fill_style = stroke_style;
    }

    var f1 = data.f1id, f2 = data.f2id;
    var f1label = data.f1alias, f2label = data.f2alias;
    var violin = (isNonLinear(f1label[0]) ^ isNonLinear(f2label[0])); //one is nonlinear, one is not
    var cubbyhole = isNonLinear(f1label[0]) && isNonLinear(f2label[0]);
    var f1values, f2values;
    if (isNonLinear(f1label[0])) {
           f1values = data.f1values.split(':');
    } else {
            f1values = data.f1values.split(':').map(function(val) {return parseFloat(val);});
    }
    if (isNonLinear(f2label[0])) {
        f2values = data.f2values.split(':');
    } else {
        f2values = data.f2values.split(':').map(function(val) {return parseFloat(val);});
    }

    if (f1values.length != f2values.length) {
        vq.events.Dispatcher.dispatch(new vq.events.Event('render_fail','scatterplot','Data cannot be rendered correctly.'));
        return;
    }

    var data_array = [];
    for (var i=0; i< f1values.length; i++) {
        var obj = {};
        obj[f1] = f1values[i], obj[f2]=f2values[i], obj['patient_id'] = patient_labels[i];
        if  (highlight) obj['highlight'] = highlight_arr[i];
        data_array.push(obj);
    }

    function reverseAxes() {
           config.CONTENTS.xcolumnid = f2;config.CONTENTS.ycolumnid=f1;config.CONTENTS.xcolumnlabel=f2label;config.CONTENTS.ycolumnlabel=f1label;
            tooltip[data.f1alias]=f2;tooltip[data.f2alias]=f1;
            config.CONTENTS.tooltip_items=tooltip;
    }

    var tooltip = {};
    tooltip[data.f1alias] = f1,tooltip[data.f2alias] = f2,tooltip['Sample'] = 'patient_id';

    var sp,config;
     if (violin)     {
      sp = new vq.ViolinPlot();
              config ={DATATYPE : "vq.models.ViolinPlotData", CONTENTS : {
                 PLOT : {container: div,
                     width : 530,
                     height: 300,
                 vertical_padding : 40, horizontal_padding: 40, font :"14px sans"},
                 data_array: data_array,
                 xcolumnid: f1,
                 ycolumnid: f2,
                 valuecolumnid: 'patient_id',
                 xcolumnlabel : f1label,
                 ycolumnlabel : f2label,
                 valuecolumnlabel : 'Sample Id',
                 tooltip_items : tooltip,
                 show_points : true,
                  stroke_style : stroke_style,
                  fill_style : fill_style,
                 regression :regression_type
             }};
         if (isNonLinear(f2label[0])) {
            reverseAxes();
         }
             sp.draw(config);
     }
      else if(cubbyhole) {
         sp = new vq.CubbyHole();
              config ={DATATYPE : "vq.models.CubbyHoleData", CONTENTS : {
                 PLOT : {container: div,
                     width : 530,
                     height: 370,
                 vertical_padding : 40, horizontal_padding: 40, font :"14px sans"},
                 data_array: data_array,
                 xcolumnid: f1,
                 ycolumnid: f2,
                 valuecolumnid: 'patient_id',
                 xcolumnlabel : f1label,
                 ycolumnlabel : f2label,
                 valuecolumnlabel : 'Sample Id',
                 tooltip_items : tooltip,
                 show_points : true,
                  stroke_style : stroke_style,
                  fill_style : fill_style,
                  radial_interval : 7
             }};
         if (reverse_axes) {
            reverseAxes();
         }
             sp.draw(config);
     }
       else {
         sp = new vq.ScatterPlot();

          config ={DATATYPE : "vq.models.ScatterPlotData", CONTENTS : {
             PLOT : {container: div,
                 width : 600,
                 height: 300,
             vertical_padding : 40, horizontal_padding: 40, font :"14px sans"},
             data_array: data_array,
             xcolumnid: f1,
             ycolumnid: f2,
             valuecolumnid: 'patient_id',
             xcolumnlabel : f1label,
             ycolumnlabel : f2label,
             valuecolumnlabel : 'Sample Id',
             tooltip_items : tooltip,
              radial_interval : 7,
              stroke_style : stroke_style,
              fill_style : fill_style,
             regression :regression_type
         }};
     if (reverse_axes) {
        reverseAxes();
     }
         sp.draw(config);
     }

    var e = new vq.events.Event('render_complete','scatterplot',sp);
    e.dispatch();
    return sp;
}