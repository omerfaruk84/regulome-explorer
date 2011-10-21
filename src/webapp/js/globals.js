

/*
globals.js

Import this before MVC scripts.
 */

/*
* Chromosome label list.
*       Object consists of fields:
*           value: - String - id to be passed to controller
*           label - String - id to be used by UI
*/
var pairwise = {
    display_options : {
        circvis : {
			rings:{
				karyotype: {
					hidden :false
				},
				cnvr : {
					hidden : true
				},
				pairwise_scores : {
					hidden : false,
					max_value : 12,
					min_value : -12,
				}
			},
            ticks : {
                tick_overlap_distance : null,
                tile_ticks_manually : false,
                wedge_width: 1,
                wedge_width_manually: false,
                                wedge_height: 1,
                wedge_height_manually: false
            },
            network : {
        		tile_nodes : false,
        		node_overlap_distance : null
          	},
            width : 800,
            height : 800,
            ring_radius : 55,
            rotation : 0,
            chrom_keys : ["1","2","3","4","5","6","7","8","9","10",
        "11","12","13","14","15","16","17","18","19","20","21","22","X","Y"]
        },//circvis
        tooltips: {
        	items : {
        			karyotype : {
        					config_object : {
			        					 'Karyotype Label' : function(feature) { return  vq.utils.VisUtils.options_map(feature)['label'];},
        									Location :  function(feature) { return 'Chr' + feature.chr + ' ' + feature.start + '-' + feature.end;}
        									}
        						}
        			},
        	links: {
        			ucsc_genome_browser: {
        				label : 'UCSC Genome Browser',
        				url : 'http://genome.ucsc.edu/cgi-bin/hgTracks',
        				uri : '?db=hg18&position=chr',
        				config_object :  function(feature){
            								return  'http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg18&position=chr' + 
								            feature.chr + ':' +  feature.start +'-'+ feature.end;  }								        
        				},//ucsc_genome_browser
        			ensemble : {
        				label :'Ensemble',
        				url : 'http://uswest.ensembl.org/Homo_sapiens/Location/View',
        				uri : '?r=',
        				config_object :  function(feature) {
           									 return  'http://uswest.ensembl.org/Homo_sapiens/Location/View?r=' + feature.chr + 
           									 ':' +  feature.start +'-'+ feature.end;  }           								
        				}//ensemble
        			} //links
        		}//tooltips
        },//display_options
    circvis_obj : {    },
    data_options: { 
    	scores : {
    			max_value : 10,
    			min_value : -10
    		}//scores
    	}//data_options
};//pairwise
pairwise.setRingHidden = function(ring,value) {
    pairwise.display_options.circvis.rings[ring].hidden = value;
};

pairwise.isRingHidden = function(ring) {
    return pairwise.display_options.circvis.rings[ring]['hidden'];
};

var chrom_list = [];
chrom_list.push({value:'*',label:'All'});
for(var i =1;i <= 22; i++) {
    chrom_list.push({value:i+'',label:i+''});
}
chrom_list.push({value:'X',label:'X'});
chrom_list.push({value:'Y',label:'Y'});

/*
*   Correlation combo list
*          Objects consist of fields:
*               value: - String - id to be passed to controller
*               label - String - id to be used by UI
 */

var corr_list = [{label:'(abs)>=',value:'abs_ge'},
    {label:'>=',value:'ge'},
{label:'<=',value:'le'}];

/*
*        URL's
*            addresses to pathways used by MEDLINE tab
 */

var wikipw_url = 'http://www.wikipathways.org/index.php?title=Special%3ASearchPathways&doSearch=1&sa=Search&species=Homo+sapiens&query=',
biocarta_url = 'http://www.biocarta.com/pathfiles/h_',
kegg_url = 'http://www.genome.jp/kegg-bin/search_pathway_text?map=map&mode=1&viewImage=true&keyword=',
pw_commons_url = 'http://www.pathwaycommons.org/pc/webservice.do?version=3.0&snapshot_id=GLOBAL_FILTER_SETTINGS&record_type=PATHWAY&format=html&cmd=get_by_keyword&q=';

/*
        Label map
            Hash maps feature type id to feature type label
 */

var label_map = {};
label_map['*'] = 'All';
label_map['GEXP'] = 'Gene Expression';
label_map['METH'] = 'DNA Methylation';
label_map['CNVR'] = 'Somatic Copy Number Alteration';
label_map['CLIN'] = 'Clinical';
label_map['MIRN'] = 'MicroRNA Expression';
label_map['GNAB'] = 'Somatic Mutation';
label_map['SAMP'] = 'Tumor Sample';

/*
        Window handles
        global handles to the masks and windows used by events
 */

var details_window,details_window_mask, helpWindowReference = null;

/*
*        Order combo list
*          Objects consist of fields:
*               value: - String - id to be passed to controller
*               label - String - id to be used by UI
 */
var order_list = [{value:'correlation',label:'Correlation'},{value:'floorlogged_pvalue',label:'Score'},{value:'pvalue',label:'pvalue'}];

/*
*        Limit combo list
*          Objects consist of fields:
*               value: - String - id to be passed to controller
*               label - String - id to be used by UI
 */

var limit_list = [{value:10,label:'10'},{value:20,label:'20'},{value:40, label:'40'},{value:100, label:'100'},{value:200, label:'200'},
            {value:1000, label:'1000'},{value:2000, label:'2000'}];


var dataset_labels;

function getDatasetLabels () {
    return dataset_labels;
}

function setDatasetLabels (obj) {
     dataset_labels = obj;
}

var scatterplot_obj, association_results;