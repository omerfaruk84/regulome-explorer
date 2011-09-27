
var base_query_url = '',
    csacr_base_query_uri = '/google-dsapi-svc/addama/datasources/csacr',
    tcga_base_query_uri = '/google-dsapi-svc/addama/datasources/tcga',
    dataset_table = '/regulome_explorer_dataset/query';

var query_uri = '/query',
    json_out_param='&tqx=out:json_array';
query_param='?tq=';
parsed_data = {network : null,unlocated : null,features : null,unlocated_features:null,located_features:null},
    responses = {network : null},
    features = {data : null},
    cancer = {sv : null},
    dataset_labels,
    current_data = '';
network_query ='',
    network_uri = '',
    feature_uri ='',
    clin_uri ='',
    patient_uri =  '',
    pathway_uri = '',
    feature_data_uri =  '/clinical_correlates_0817/query';

function registerDataRetrievalListeners() {
    var d = vq.events.Dispatcher;
    d.addListener('dataset_selected',function(obj){
        selectDataset(obj);
        loadDatasetLabels();
    });
    d.addListener('data_request','associations',function(obj){
        loadNetworkData(obj.filter);
    });
    d.addListener('data_request','annotations', function(obj){
        loadAnnotations();
    });
    d.addListener('data_request','filteredfeatures',function(obj) {
        loadFeatureData(obj.filter);
    });
}

function selectDataset(set_label) {
    current_data = set_label;
    network_uri = '/'+set_label+'/query';
    //feature_uri = '/v_clinical_tumor_aggressiveness/query';
    clin_uri = '/v_brca_pairwise_clinical_0924/query';
    tumor_uri =  '/brca_pairwise_clinical_associations_0924/query';
    feature_data_uri =  '/brca_pairwise_clinical_associations_0924/query';
    pathway_uri = '/' + set_label + '_feature_pathways/query';
}



function loadDatasetLabels() {

    function loadFailed() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail','dataset_labels',{msg:'Retrieval Timeout'}));
    }

    var dataset_labels = {feature_sources : null, clin_labels : null};
    var clin_label_query_str = query_param + 'select `label`' + json_out_param;
    var clin_label_query = base_query_url + tcga_base_query_uri + clin_uri+clin_label_query_str;

    function clinicalLabelQueryHandler(response) {
        dataset_labels['clin_labels'] = Ext.decode(response.responseText);
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_complete','dataset_labels',dataset_labels));
    }

    function queryFailed(response) {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail','dataset_labels',{msg:'Query Error: ' + response.status + ': ' + response.responseText}));
    }

    Ext.Ajax.request({url:clin_label_query,success:clinicalLabelQueryHandler,failure: queryFailed});

//    var sources_query_str = query_param + 'select source' + json_out_param;
//    var sources_query = base_query_url + tcga_base_query_uri + feature_uri + sources_query_str;
//
//    function featureSourceQueryHandler(response) {
//        dataset_labels['feature_sources'] = Ext.decode(response.responseText);
//    }
//
//    Ext.Ajax.request({url:sources_query,success:featureSourceQueryHandler,failure: queryFailed});


}

function loadFeatureData(query_params) {

    function loadComplete() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_complete','filteredfeatures',features));
    }

    function loadFailed() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail','features',{msg:'Retrieval Timeout'}));
    }

    var features = {data : null,filter : query_params};
    var query_str = buildGQLFeatureQuery(query_params)

    var feature_query_str = query_param + query_str + json_out_param;
    var feature_query = base_query_url + tcga_base_query_uri + feature_data_uri + feature_query_str;

    function featureQueryHandle(response) {
        features['data'] = Ext.decode(response.responseText);
        loadComplete();
    }

    function queryFailed(response) {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail','features',{msg:'Query Error: ' + response.status + ': ' + response.responseText}));
    }
    Ext.Ajax.request({url:feature_query,success:featureQueryHandle,failure: queryFailed});

}

function loadAnnotations() {

    function loadComplete() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_complete','annotations',annotations));
    }

    function loadFailed() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail','annotations',{msg:'Retrieval Timeout'}));
    }
    var annotations = {'chrom_leng': null};

    var chrom_query_str = query_param + ('select chr_name, chr_length') + json_out_param;
    var chrom_query = base_query_url + csacr_base_query_uri + '/chrom_info' + query_uri+ chrom_query_str;

    function handleChromInfoQuery(response) {
        annotations['chrom_leng'] = Ext.decode(response.responseText);
        loadComplete();
    }
    function queryFailed(response) {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail','annotations',{msg:'Query Error: ' + response.status + ': ' + response.responseText}));
    }

    Ext.Ajax.request({url:chrom_query,success:handleChromInfoQuery,failure: queryFailed});
}

/*
 not very good yet.  move json_array responsibility to server.. stop running cascading timers!
 */

function loadNetworkData(query_params) {
    function loadComplete() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_complete','associations', responses));
    }

    function loadFailed() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail','associations',{msg:'Retrieval Timeout'}));
    }

    var responses = {network : null, params:query_params};

    var network_query=buildGQLNetworkQuery(query_params);

    function handleNetworkQuery(response) {
        responses['network'] = Ext.decode(response.responseText);
        loadComplete();
    }
    function queryFailed(response) {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail','assocations',{msg:'Query Error: ' + response.status + ': ' + response.responseText}));
    }

    var association_query_str = query_param + network_query + json_out_param;
    var association_query = base_query_url + tcga_base_query_uri + network_uri + association_query_str;

    Ext.Ajax.request({url:association_query,success:handleNetworkQuery,failure: queryFailed});

}

/*
 Utility functions
 */
function buildGQLNetworkQuery(args) {
    var query = 'select alias1, alias2, clinical_associate1, num_nonna, correlation, score, floorlogged_pvalue';
    var whst = ' where',
        where = whst;

    if (args['f1_type'] != '' && args['f1_type'] != '*') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += 'source1 = \'' +args['f1_type']+ '\'';
    }
    if (args['f2_type'] != '' && args['f2_type'] != '*') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += 'source2 = \'' +args['f2_type']+ '\'';
    }
    if (args['f1_label'] != '' && args['f1_label'] != '*') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += '`label1` ' + parseLabel(args['f1_label']);
    }
    if (args['f2_label'] != '' && args['f2_label'] != '*') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += '`label2` ' + parseLabel(args['f2_label']);
    }
    if (args['f1_chr'] != '' && args['f1_chr'] != '*') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += 'chr1 = \'' +args['f1_chr']+'\'';
    }
    if (args['f2_chr'] != '' && args['f2_chr'] != '*') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += 'chr2 = \'' +args['f2_chr']+'\'';
    }
    if (args['f1_start'] != '') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += 'start2 >= ' +args['f1_start'];
    }
    if (args['f2_start'] != '') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += 'start2 >= ' +args['f2_start'];
    }
    if (args['f1_stop'] != '') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += 'end1 <= ' +args['f1_stop'];
    }
    if (args['f2_stop'] != '') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += 'end2 <= ' +args['f2_stop'];
    }
    if ((args['f2_start'] != '') && (args['f2_stop'] != '')) {
        where += ' and end2 >= ' +args['f2_start'];
    }
    if ((args['f1_start'] != '') && (args['f1_stop'] != '')) {
        where += ' and end1 >= ' +args['f1_start'];
    }

    where += (where.length > whst.length ? ' and ' : ' ') + flex_field_query('correlation',args['correlation'],args['correlation_fn']);
    where += (where.length > whst.length ? ' and ' : ' ') + flex_field_query('score',args['score'], args['score_fn']);

    query += (where.length > whst.length ? where : '');
    query += ' order by '+args['order'] + (args['order'] == 'pvalue' ? ' ASC' : ' DESC');
    query += ' limit '+args['limit'] + ' label `clinical_associate1` \'clin\'';

    return query;
}

function buildGQLFeatureQuery(args) {

    var query = 'select alias1, alias2, logged_pvalue, sign, num_nonna, score ';

    var whst = ' where ';
    var where1 = ' (';
    var where2 = ' (';

    if (args['type'] != '' && args['type'] != '*') {
        where1 += (where1.length > 2 ? ' and ' : ' ');
        where1 += 'source1 = \'' +args['type']+ '\'';
//        where2 += (where2.length > 2 ? ' and ' : ' ');
//        where2 += 'source2 = \'' +args['type']+ '\'';
    }
    if (args['label'] != '' && args['label'] != '*') {
        where1 += (where1.length > 2 ? ' and ' : ' ');
        where1 += '`label1` ' + parseLabel(args['label']);
        where1 += ' and `label2` ' + parseLabel(args['clin']);
//        where2 += (where2.length > 2 ? ' and ' : ' ');
//        where2 += '`label2` ' + parseLabel(args['label']);
//        where2 += ' and `label1` ' + parseLabel(args['clin']);
    } else {
        where1 += (where1.length > 2 ? ' and ' : ' ');
        where1 += '`label2` ' + parseLabel(args['clin']);
//        where2 += (where2.length > 2 ? ' and ' : ' ');
//        where2 += '`label1` ' + parseLabel(args['clin']);
    }

    if (args['chr'] != '' && args['chr'] != '*') {
        where1 += (where1.length > 2 ? ' and ' : ' ');
        where1 += 'chr1 = \'' +args['chr']+'\'';
//        where2 += (where2.length > 2 ? ' and ' : ' ');
//        where2 += 'chr2 = \'' +args['chr']+'\'';
    }
    if (args['start'] != '') {
        where1 += (where1.length > 2 ? ' and ' : ' ');
        where1 += 'start1 >= ' +args['start'];
//        where2 += (where2.length > 2 ? ' and ' : ' ');
//        where2 += 'start2 >= ' +args['start'];
    }
    if (args['stop'] != '') {
        where1 += (where1.length > 2 ? ' and ' : ' ');
        where1 += 'end1 <= ' +args['stop'];
//        where2 += (where2.length > 2 ? ' and ' : ' ');
//        where2 += 'end2 <= ' +args['stop'];
    }

    if ((args['start'] != '') && (args['stop'] != '')) {
        where1 += ' and end1 >= ' +args['start'];
//        where2 += ' and end2 >= ' +args['start'];
    }

    var stat_where = (where1.length > 2 ? ' and ' : ' ') + flex_field_query('correlation',args['correlation'],args['correlation_fn']);
    stat_where += (stat_where.length > 2 ? ' and ' : ' ') + flex_field_query('score',args['score'], args['score_fn']);

    query += whst + (where1.length > 2 ?  where1 +')': '');
    //query += (where2.length > 2 ? ' or' + where2 +')': '');
    query += stat_where;

//    query += ' label `logged_pvalue` \'score\'';

    return query;

}

function flex_field_query(label, value, fn) {
    var where = '';
    if (value != '') {
        if (fn == 'Btw'){
            where += '(' + label + ' >= -' +value + ' and '+ label + ' <= ' + value +')';
        }else if (fn == '<='){
            where += '('+ label + ' <= ' + value +')';
        }else if (fn == '>='){
            where += '('+ label + ' >= ' +value +')';
        }else{
            where += '('+ label + ' >= ' +value + ' or '+ label + ' <= -' + value +')';
        }
    }
    return where;

}

function parseLabel(label) {
    if (label.length > 1 && label.indexOf('*') >= 0) {
        return 'like \'' + label.replace(new RegExp('[*]', 'g'),'%') + '\'';
    } else {
        return '=\'' + label + '\'';
    }
}

/*
 Misc data/file retrieval
 */
function downloadNetworkData(target_frame,output) {
    var output_label = output;
    var output_extension=output;
    if (output_label =='tsv') {output_extension=output_label;output_label='tsv-excel';}
    target_frame.src = 'http://' + window.location.host + encodeURI(base_query_url +
        tcga_base_query_uri + network_uri+ '?tq=' + network_query + '&tqx=out:' +output_label+';outFileName:'+current_data+'_query.'+output_extension);
}