
function registerPlotListeners() {

    var d = vq.events.Dispatcher;
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

    d.addListener('render_linearbrowser','feature_circvis', function(obj){
        renderLinearFeatureData(obj);
        renderLinearLegend();
    });
    d.addListener('data_ready','filtered_features',function(obj){
        pairwise.circvis_obj.data = obj.data;
        pairwise.circvis_obj.filter = obj.filter;
        var e = new vq.events.Event('draw_circvis','filtered_features');
        e.dispatch();
    });
    d.addListener('draw_circvis','filtered_features',function(){
        generateColorMaps(pairwise.circvis_obj);
        renderCircleFeatureData(pairwise.circvis_obj);
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
    score_color_scale = pv.Scale.linear(-8,-1,1,8).range('blue','white','white','red'),
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

function renderCircleFeatureData(obj) {
    plotFilteredFeatureData(obj.data,obj.filter, document.getElementById('circle-panel'));
}


function legend_draw(div) {
    var source_map = pv.numerate(feature_types);
    var current_locatable_data = locatable_source_list.filter(function(input_row){return source_map[input_row] != undefined;});
    var current_data = all_source_list.filter(function(input_row){return source_map[input_row] != undefined;});
    var current_map = pv.numerate(current_data);

    node_colors = function(source) { return source_color_scale(current_map[source]);};
    link_sources_colors = function(link) { return link_sources_array[current_map[link[0]] * current_data.length + current_map[link[1]]];}

    var vis= new pv.Panel()
        .width(200)
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
    	.text(function(l) { return label_map[l]; })
        .bottom(0)
        .left(20)
        .textAlign('left')
        .textBaseline('bottom')
        .font("11px helvetica");

    vis.render();
}

function plotFilteredFeatureData(feature_array,filter,div) {

    var data = processCircvisObject(pairwise.display_options,filter,div);

    circvis = new vq.CircVis();
    var dataObject ={DATATYPE : "vq.models.CircVisData", CONTENTS : data };
    circvis.draw(dataObject);

    var e = new vq.events.Event('render_complete','circvis_features',circvis);
    e.dispatch();

    return circvis;
}

function bpToMb(bp) {
    return bp != null ? (bp == 0 ? 0 : bp / 1000000): null;
}

function mbpToBp(num) {
    return Math.floor(num* 1000000);
}

function renderLinearFeatureData(obj) {
    plotFeatureDataLinear(vq.utils.VisUtils.extend(obj,{div:document.getElementById('linear-panel')}));
}


function plotFeatureDataLinear(obj) {
    var div = obj.div || null, features = obj.data || [], chrom = obj.chr || '1', start = obj.start || null, range_length = obj.range || null;

    features=features.filter(function(f) { return f.chr == chrom;});

    var ucsc_genome_url = 'http://genome.ucsc.edu/cgi-bin/hgTracks';
    var tile_listener = function(feature){
        window.open(ucsc_genome_url + '?db=hg18&position=chr' + feature.chr + ':' + mbpToBp(feature.start) +
            '-'+ mbpToBp(feature.end),'_blank');
        return false;
    };
    var stroke_style_fn = getStrokeStyleAttribute();
    var located_tooltip_items = {
        Feature : function(node) {
            return node.label+ ' ' + node.source + ' Chr' + node.chr + ' ' + mbpToBp(node.start) +
                '-' + mbpToBp(node.end);},
        Score :function(node) { return node.score;},
        'Clinical Feature':function(node) { return node.clin;},
        'Aggressiveness':function(node) { return node.agg;}
    };

    var  tooltip_links = {
        'UCSC Genome Browser' :  function(feature){
            return  ucsc_genome_url + '?db=hg18&position=chr' + feature.chr + ':' +  feature.start +'-'+ feature.end;  },
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
//                            case('GEXP') :
//                                return 'circle';
//                                break;
//                            case('METH') :
//                                return 'diamond';
//                                break;
//                            case('MIRN') :
//                                return 'triangle';
//                                break;
//                            case('GNAB') :
//                                return 'cross';
//                                break;
//                            case('CNVR') :
//                                return 'square';
//                                break;
                            default:
                                return 'square';
                        }
                    },
                    track_height : 290,           //required
                    track_padding: 30,             //required
                    tile_height:12,                //required
                    tile_padding:3,              //required
                    radius: 4,
                    //required
                    tile_overlap_distance:.5,    //required
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
                    min_value : -10,
                    max_value : 10,
                    base_value : 0,
                    num_y_rule_lines: 5,
                   shape : function(feature) {
                        switch(feature.source) {
//                            case('GEXP') :
//                                return 'circle';
//                                break;
//                            case('METH') :
//                                return 'diamond';
//                                break;
//                            case('MIRN') :
//                                return 'triangle';
//                                break;
//                            case('GNAB') :
//                                return 'cross';
//                                break;
//                            case('CNVR') :
//                                return 'square';
//                                break;
                            default:
                                return 'circle';
                        }
                    },
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

function processCircvisObject(options,filter,div) {
    var width=pairwise.display_options.circvis.width, height=pairwise.display_options.circvis.height;
    var	ring_radius = pairwise.display_options.circvis.ring_radius;
    var chrom_keys = pairwise.display_options.circvis.chrom_keys;
    var stroke_style_fn = getStrokeStyleAttribute();

    var chrom_leng = vq.utils.VisUtils.clone(chrome_length);

    var tile_nodes= pairwise.display_options.circvis.network.tile_nodes,
      node_overlap_distance = pairwise.display_options.circvis.network.node_overlap_distance;

      var tile_ticks = pairwise.display_options.circvis.ticks.tile_ticks_manually,
      tick_overlap_distance = pairwise.display_options.circvis.ticks.tick_overlap_distance;


    try {
    if (filter.chr !="*") {
        var filter_chr = filter.chr.split(',');
        chrom_keys=chrom_keys.filter(function(f) { return filter_chr.some(function(key) {return key == f;}); });
        chrom_leng=chrom_leng.filter(function(f) { return filter_chr.some(function(key) {return key == f.chr_name;});});
    }
    } catch(e) {

    }
    var ticks = vq.utils.VisUtils.clone(feature_array);
    ticks.forEach(function(f) { f.value = f.label;});
    var features = vq.utils.VisUtils.clone(feature_array);
    features.forEach(function(f){ f.value = Math.min(Math.max(parseInt(f.agg) * f.score,-8),8);});

        var karyotype_tooltip_items = {
        'Karyotype Label' : function(feature) { return  vq.utils.VisUtils.options_map(feature)['label'];},
        Location :  function(feature) { return 'Chr' + feature.chr + ' ' + feature.start + '-' + feature.end;}
    };

        function feature_circvis_wedge_listener(feature) {
        var chr = feature.chr;
        var start = bpToMb(feature.start) - 2.5;
        var range_length = bpToMb(feature.end) - start + 2.5;
        vq.events.Dispatcher.dispatch(new vq.events.Event('render_linearbrowser','feature_circvis',{data:features,chr:chr,start:start,range:range_length}));
    }

      function genome_listener(chr) {
        var e = new vq.events.Event('render_linearbrowser','feature_circvis',{data:features,chr:chr});
        e.dispatch();
    }

    var ucsc_genome_url = 'http://genome.ucsc.edu/cgi-bin/hgTracks';

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
                listener : feature_circvis_wedge_listener,
                fill_style : function(tick) {return node_colors(tick.source); },
                tooltip_items : {Tick : function(node) { return node.label+ ' ' + node.source + ' Chr' + node.chr + ' ' + node.start +
                    '-' + node.end;}},
                tooltip_links : {
                    'UCSC Genome Browser' :  function(feature){
                        return  ucsc_genome_url + '?db=hg18&position=chr' + feature.chr + ':' +  feature.start +'-'+ feature.end;  },
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
            enable_pan : true,
            enable_zoom : true,
            show_legend: true,
            legend_include_genome : true,
            legend_corner : 'ne',
            legend_radius  : width / 15,
            rotate_degrees : pairwise.display_options.circvis.rotation
        },
        WEDGE:[

        ]
    };

    if (tile_ticks) {
        data.TICKS.OPTIONS.tile_ticks = true;
        data.TICKS.OPTIONS.overlap_distance = tick_overlap_distance;
    }
    if (pairwise.display_options.circvis.ticks.wedge_width_manually) {
        data.TICKS.OPTIONS.wedge_width = pairwise.display_options.circvis.ticks.wedge_width;
    }
    if (pairwise.display_options.circvis.ticks.wedge_height_manually) {
         data.TICKS.OPTIONS.wedge_height = pairwise.display_options.circvis.ticks.wedge_height;
     }


    if (!pairwise.isRingHidden('karyotype')) {
        data.WEDGE.push(   {
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
        });
    }

    if (!pairwise.isRingHidden('cnvr')) {
        data.WEDGE.push(   {
            PLOT : {
                height : ring_radius /2,
                type : 'tile'
            },
            DATA:{data_array:features.filter(function(f) { return f.source == 'CNVR';})},
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
                    Score :'value',
                    'Clinical Feature':'clin',
                    'Aggressiveness':'agg'}
            },
            listener : feature_circvis_wedge_listener
        });
    }

    if (!pairwise.isRingHidden('pairwise_scores')) {
        data.WEDGE.push(    {
            PLOT : {
                height : ring_radius,
                type :   'scatterplot'
            },
            DATA:{
                data_array : features
            },
            OPTIONS: {
                legend_label : 'Clinical Correlates' ,
                legend_description : 'Clinical Correlates',
                outer_padding : 10,
                base_value : 0,
                min_value : -10,
                max_value : 10,
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
                    Score :'value',
                    'Clinical Feature':'clin',
                    'Aggressiveness':'agg'
                },
                listener : feature_circvis_wedge_listener
            }
        });
    }
    return data;
}
