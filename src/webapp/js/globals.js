

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
label_map['GENO'] = 'Genotype';
label_map['METH'] = 'Methylation';
label_map['CNVR'] = 'Copy # Var Region';
label_map['PHENO'] = 'Phenotype';
label_map['MIRN'] = 'microRNA';
label_map['GNAB'] = 'Gene Aberration';
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
var order_list = [{value:'correlation',label:'Correlation'},{value:'importance',label:'Importance'},{value:'pvalue',label:'pvalue'}];

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

// help strings

var toolsHelpString = 'The Tool Panel provides a way for filtering, selecting, and exporting different datasets.  ' +
        'The Panel can also be minimized by clicking the `>>` icon, which then expands main panel view.  ' +
        'See each individual tool help for further details on their capabilities.',
dataLevelViewHelpString = 'The Data-level View is a data table displaying the feature selected in the Genome-level ' +
        'view and its related links.  This view allows the user to easily navigate all the related data values ' +
        'associated with a single feature.',
chromosomeLevelHelpString = 'The Chromosome-level View provides a way to navigate the features of a given dataset on ' +
        'a single chromosome level.  The view will be populated with chromosome information once a chromosome is ' +
        'selected by either clicking on a specific chromosome number  or end-point of a link in the Genome-level view.<p>'+
        'Feature information on a given chromosome is displayed in 4 different plots.  The Distal Intra-Chromosome ' +
        'Correlates plot shows the location of the predictors for a target within a chromosome.  The Proximal Feature ' +
        'Predictors plot also displays feature associations within the chromosome, but only displays ones where the ' +
        'start and end location of a predictor is less than 250,000 bp in length.  The Unmapped Feature Coorelates ' +
        'shows features for which there does not exist a mapped location.  Finally, the Feature Locations plot shows ' +
        'the locations of the various targets involved in the links.   All plots have tooltips giving more details of ' +
        'the underlying data. Coorelation scatterplots are displayed when an item is selected within a plot.<p>' +
'A sliding scale showing all feature locations is given at the bottom of the view.  A range can be selected to zoom ' +
        'in on a given chromosome location by clicking the mouse and dragging it over a region.  The same zoom and ' +
        'selection capability is also available within the top 4 plots.',
genomeLevelHelpString = 'The Genome-level View is an interactive circular plot showing the links between target and ' +
        'predictor features within the dataset.  Tooltips over various points give the underlying data associated with ' +
        'a node or link.  Clicking on the links within the plot will display a coorelation scatterplot of the associated ' +
        'features.  Mouse clicks on chromosomes, links, and nodes within the plot also bring up drill-down information ' +
        'in the Chromosome-level and Data-level views.<p>' +
'The subset of data shown in the circular plot can be filtered by using the tools panel filtering section.  Once a plot ' +
        'of interest has been found, an export of the plot can be achieved by using the tools panel export option.  ' +
        'The mouse-click behavior of the interactive plot can be changed by choosing different options in the tools ' +
        'panel selection area.';