
function registerModelListeners() {

    var d = vq.events.Dispatcher;
    d.addListener('query_complete','sf_associations',function(data) {
        if (re.state.query_cancel) { return;}
        parseSFValues(data);
    });
    d.addListener('query_complete','dataset_labels',function(data) {
        parseDatasetLabels(data);
    });
    d.addListener('query_complete','annotations',function(data) {
        parseAnnotations(data);
    });

}

function parseDatasetLabels(data) {
    re.ui.setDatasetLabels(data);
    vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','dataset_labels', data));
}


function parseAnnotations(data) {
    vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','annotations', data));
}

function rectifyChrPosition(str_val) {
    return  isNaN(parseInt(str_val)) ? -1 : parseInt(str_val);
}

function parseSFValues(responses) {

    var parsed_data = {features:[],filter:responses.filter};
    function loadComplete() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','sf_associations', parsed_data));
    }

    function loadFailed() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('load_fail','associations',{msg:'Zero mappable features found.'}));
    }

    var data = responses.data.map(parseFeatureAlias);
    if (data.length < 1)loadFailed();

    parsed_data.features = data.filter(function(feature) { return feature.chr != '' && feature.start != '';});
    if (parsed_data.features.length > 0) loadComplete();
    else loadFailed();
}

function parseFeatureAlias(row) {

    var node = row.alias.split(':');
    var label_mod = node.length >=8 ? node[7] : '';
    var chr = '';
    var start=parseInt(node[4]);
    start = isNaN(start) ? '' : start;
    var end=parseInt(node[5]);
    end = isNaN(end) ? '' : end;

    try{
        chr = node[3].slice(3);
    }
    catch(e) {
        chr = '';
    }
    var obj =  {id : row.alias, source : node[1], label : node[2], chr : chr,
        label_mod : label_mod,
        start: start,
        end:end
    };
    re.model.association.types.forEach(function(assoc) {
        obj[assoc.ui.grid.store_index] = row[assoc.query.id];
    });
    return obj;
}