
function registerDataRetrievalListeners() {
    var d = vq.events.Dispatcher;
    d.addListener('dataset_selected',function(obj){
        selectDataset(obj);
        loadDatasetLabels();
    });
    d.addListener('data_request','associations',function(obj){
        loadNetworkData(obj);
    });
    d.addListener('data_request','label_position', function(obj){
        lookupLabelPosition(obj);
    });
    d.addListener('data_request','annotations', function(obj){
        loadAnnotations();
    });
    d.addListener('click_association',function(link) {
        loadFeatureData(link);
    });
}

function selectDataset(set_label) {
    re.tables.current_data = set_label;
    re.tables.network_uri = '/mv_'+set_label+'_feature_networks';
    re.tables.feature_uri = '/v_'+set_label+'_feature_sources';
    re.tables.clin_uri = '/v_'+set_label+'_feature_clinlabel';
    re.tables.patient_uri =  '/v_'+set_label+'_patients';
    re.tables.feature_data_uri =  '/v_' + set_label + '_patient_values';
    re.tables.pathway_uri = '/' + set_label + '_feature_pathways';
}

function loadDatasetLabels() {

    var dataset_labels = {feature_sources : null, clin_labels : null};
    var clin_label_query_str = '?' + re.params.query + 'select `label`' + re.params.json_out;
    var clin_label_query = re.databases.base_uri + re.databases.rf_ace.uri + re.tables.clin_uri + re.rest.query +clin_label_query_str;
    var synchronizer = new vq.utils.SyncCallbacks(loadComplete,this);

    function clinicalLabelQueryHandler(response) {
        try {
            dataset_labels['clin_labels'] = Ext.decode(response.responseText);
        } catch (err) {
            throwQueryError('clin_labels',response);
        }
    }

    function loadComplete() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_complete','dataset_labels',dataset_labels));
    }

    function loadFailed() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail','dataset_labels',{msg:'Failed to load dataset labels.'}));
    }

    Ext.Ajax.request({url:clin_label_query,success:synchronizer.add(clinicalLabelQueryHandler,this), failure: function(response) { queryFailed('dataset_labels',response);}});

    var sources_query_str = '?' + re.params.query + 'select source' + re.params.json_out;
    var sources_query = re.databases.base_uri + re.databases.rf_ace.uri + re.tables.feature_uri + re.rest.query + sources_query_str;

    function featureSourceQueryHandler(response) {
        try {
            dataset_labels['feature_sources'] = Ext.decode(response.responseText);
        } catch (err) {
            throwQueryError('feature_sources',response);
        }
    }

    Ext.Ajax.request({url:sources_query,success:synchronizer.add(featureSourceQueryHandler,this), failure: function(response) { queryFailed('feature_source',response); }});

}

function lookupLabelPosition(label_obj) {
    var label = label_obj.label || '';
    var query_str = 'select chr, start, end, alias where alias = \'' + label + '\' limit 1';
    var position_query_str = '?' + re.params.query + query_str + re.params.json_out;
    var position_url = re.databases.base_uri  + re.databases.metadata.uri + re.tables.label_lookup + re.rest.query + position_query_str;
    var position_array = [];

    function positionQueryHandle(response) {
        try {
            position_array = Ext.decode(response.responseText);
            }
            catch (err) {
                    throwQueryError('label_position',response);
            }
            if (position_array.length ==1) {
                loadComplete();
            }
            else{
                noResults('label_position');
            }
    }

    function loadComplete() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_complete','label_position',vq.utils.VisUtils.extend({feature:position_array[0]},label_obj)));
    }

    function loadFailed() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail','label_position',{msg:'Retrieval Timeout'}));
    }

    Ext.Ajax.request({url:position_url,success:positionQueryHandle,failure: function(response) { queryFailed('label_position',response); }});

}

function loadFeatureData(link) {

    var patients = {data : null};
    var query_str = 'select f1alias, f1values, f2alias, f2values ' +
        'where f1alias  = \'' + link.sourceNode.id + '\' and f2alias = \'' + link.targetNode.id + '\' limit 1';
    var query_json = { tq : query_str, tqx : 'out:json_array'};
    var patient_query_str = '?' + Ext.urlEncode(query_json);
    var patient_query = re.databases.base_uri + re.databases.rf_ace.uri + re.tables.feature_data_uri + re.rest.query + patient_query_str;

    function patientQueryHandle(response) {
        try {
            patients['data'] = Ext.decode(response.responseText);
        }
        catch (err) {
                    throwQueryError('features',response);
                }
            if (patients['data'].length ==1) {
                loadComplete();
            }
            else {
                noResults('features');
            }

    }

    function loadComplete() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_complete','features',patients));
    }

    function loadFailed() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail','features',{msg:'Retrieval Timeout'}));
    }
    Ext.Ajax.request({url:patient_query,success:patientQueryHandle,failure: function(response) { queryFailed('features',response); }});

}

function loadAnnotations() {

    var annotations = {'chrom_leng': null};
    var chrom_query_str = '?' + re.params.query + ('select chr_name, chr_length') + re.params.json_out;
    var chrom_query = re.databases.base_uri + re.databases.metadata.uri + re.tables.chrom_info +  re.rest.query+ chrom_query_str;

    function handleChromInfoQuery(response) {
        try {
            annotations['chrom_leng'] = Ext.decode(response.responseText);
            }
        catch (err) {
            throwQueryError('annotations',response);
        }
        if (annotations['chrom_leng'].length >=1) {
                loadComplete();
            }
            else{
                noResults('annotations');
            }
    }

    function loadComplete() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_complete','annotations',annotations));
    }
    function loadFailed() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail','annotations',{msg:'Retrieval Timeout'}));
    }

    Ext.Ajax.request({url:chrom_query,success:handleChromInfoQuery,failure: function(response) { queryFailed('annotations',response); }});
}

/*
 not very good yet.  move json_array responsibility to server.. stop running cascading timers!
 */

function loadNetworkData(response) {
    if (response['isolate'])  { loadNetworkDataSingleFeature(response); return;}

}


function loadNetworkDataSingleFeature(params) {
    var responses = {data:[],filter:params};
    var feature_types = ['t'];
    var data = [];

    function loadComplete() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_complete','sf_associations', responses));
    }

    function loadFailed() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail','sf_associations',{msg:'Retrieval Timeout'}));
    }

    function handleNetworkQuery(response) {
        try {
            data.push(Ext.decode(response.responseText));
        }
        catch (err) {   //an error detected in one of the responses
            throwQueryError('associations',response);
            return;
        }
        if (data.length >= feature_types.length) {
            data = pv.blend(data);
            if (data.length >= 1) {
                responses.data = vq.utils.VisUtils.clone(data);
                delete data;
                loadComplete();
                return;
            }
            else {  //no matching results
                noResults('associations')
            }
        }
        else { // haven't gathered all of the responses yet
            return;
        }

    }

    var query_obj = vq.utils.VisUtils.clone(params);
    re.model.association.types.forEach( function(obj) {
        query_obj[obj.query.id] = params[obj.query.id];
        if (obj.ui.filter.component instanceof re.multirangeField)  {
            query_obj[obj.query.id + '_fn'] =   params[obj.query.id + '_fn']
        }
    });
    if (params['demo'] == true) {
        re.state.filter_params = params;
        var query = buildSingleFeatureGQLQuery(query_obj, re.ui.feature1.id );
        var start = query.indexOf('where ');
        if (start < 0) {
            start = query.indexOf('order ');
            query = query.slice(0,start) + 'where ' + query.slice(start);
            re.state.network_query = query.slice(0,start + 6) +
                            '((floorlogged_pvalue > 8 and f1source = \'METH\') or (f1source != \'METH\')) ' + query.slice(start+6);
        } else {
        re.state.network_query = query.slice(0,start + 6) +
                '((floorlogged_pvalue > 8 and f1source = \'METH\') or (f1source != \'METH\')) and ' + query.slice(start+6);
        }
        var association_query_str = '?' + re.params.query + re.state.network_query + re.params.json_out;
        var association_query = re.databases.base_uri + re.databases.rf_ace.uri + re.tables.network_uri + re.rest.query + association_query_str;
        Ext.Ajax.request({url:association_query,success:handleNetworkQuery,failure: function(response) { queryFailed('associations',response); }});

            return;
    }

    feature_types.forEach(function(f){
        re.state.filter_params = params;
        re.state.network_query=buildSingleFeatureGQLQuery(query_obj, f == 't' ? re.ui.feature1.id : re.ui.feature2.id);
        var association_query_str = '?' + re.params.query + re.state.network_query + re.params.json_out;
        var association_query = re.databases.base_uri + re.databases.rf_ace.uri + re.tables.network_uri + re.rest.query + association_query_str;
        Ext.Ajax.request({url:association_query,success:handleNetworkQuery,failure: function(response) { queryFailed('associations',response); }});
    });
}


/* Handler functions */
function noResults(query_type) {
    vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail',query_type,{msg:'No matching results found.'}));
}

function throwQueryError(query_type,response) {
    var text = response.responseText;
    var json_index = text.indexOf('(') + 1;
    // -2 because we want to cut the ); out of the end of the message
    var json = Ext.decode(text.slice(json_index,-2));
    var error = json.errors[0];
    vq.events.Dispatcher.dispatch(new vq.events.Event('query_fail',query_type,{msg: error.message + error.detailed_message }));
}

/*
 Utility functions
 */


function buildSingleFeatureGQLQuery(args,feature) {
    var all_columns = false, query = '';
    if (arguments.length > 2) { all_columns = arguments[2];}
    //var query = 'select ' + (feature == re.ui.feature2.id ? 'alias1' : 'alias2');
    query = all_columns ?  ('select f1type, f1label, f1source, f1chr, f1start, f1end, ' + (feature == re.ui.feature1.id ? 'alias1' : 'alias2')) : 'select ' + (feature == re.ui.feature1.id ? 'alias1' : 'alias2');
    re.model.association.types.forEach( function(obj) {
        query += ', ' + obj.query.id;
    });

    var whst = ' where',
        where = whst;

    if (args['t_type'] && args['t_type'] != '' && args['t_type'] != '*') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += 'f1source = \'' +args['t_type']+ '\'';
    }
    if (args['p_type'] && args['p_type'] != '' && args['p_type'] != '*') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += 'f2source = \'' +args['p_type']+ '\'';
    }
    if (args['t_label'] && args['t_label'] != '' && args['t_label'] != '*') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += '`f1label` ' + parseLabel(args['t_label']);
    }
    if (args['p_label']  && args['p_label'] != '' && args['p_label'] != '*') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += '`f2label` ' + parseLabel(args['p_label']);
    }
    if (args['t_chr'] && args['t_chr'] != '' && args['t_chr'] != '*') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += '(' + chrWhereClause('f1chr',args['t_chr']) + ')';
    }
    if (args['p_chr']  && args['p_chr'] != '' && args['p_chr'] != '*') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += '(' + chrWhereClause('f2chr',args['p_chr']) + ')';
    }
    if (args['t_start'] && args['t_start'] != '') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += 'f1start >= ' +args['t_start'];
    }
    if (args['p_start'] && args['p_start'] != '') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += 'f2start >= ' +args['p_start'];
    }
    if (args['t_stop'] && args['t_stop'] != '') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += 'f1end <= ' +args['t_stop'];
        if (args['t_start'] != '') {
            where += ' and f1end >= ' +args['t_start'];
        }
    }
    if (args['p_stop'] && args['p_stop'] != '') {
        where += (where.length > whst.length ? ' and ' : ' ');
        where += 'f2end <= ' +args['p_stop'];
        if (args['p_start'] != '')  {
            where += ' and f2end >= ' +args['p_start'];
        }
    }

    re.model.association.types.forEach(function(obj) {
        if (typeof obj.query.clause == 'function') {
            var clause =  flex_field_query(obj.query.id,args[obj.query.id],args[obj.query.id+'_fn']);
            where += ((clause.length < 1) ?  '' : ((where.length > whst.length ? ' and ' : ' ') + clause));
            return;
        }
        if (args[obj.query.id] != '') {
            where += (where.length > whst.length ? ' and ' : ' ');
            where += obj.query.clause + args[obj.query.id];
        }
    });

    var order_id = (re.model.association.types[re.model.association_map[args['order']]].query.order_id === undefined) ?
        args['order']
        : re.model.association.types[re.model.association_map[args['order']]].query.order_id;

    query += (where.length > whst.length ? where : '');
    query += ' order by '+ order_id + ' ' + (re.model.association.types[re.model.association_map[args['order']]].query.order_direction || 'DESC');
    query += ' limit '+args['limit'];
    query += ' label ' + (feature == re.ui.feature1.id ? 'alias1 \'alias\'' : 'alias2 \'alias\'');

    return query;
}

function chrWhereClause(param,chr_string) {
    return parseChromosome(chr_string).map(function(chr) { return param + ' = \'' + chr + '\''}).join(' or ');
}

function parseChromosome(chr_string) {
    return chr_string.replace(' ','').split(',');
}