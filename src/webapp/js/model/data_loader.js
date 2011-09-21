
function registerModelListeners() {

var d = vq.events.Dispatcher;
    d.addListener('query_complete','associations',function(data) {
        parseNetwork(data);
    });
    d.addListener('query_complete','dataset_labels',function(data) {
        parseDatasetLabels(data);
    });
    d.addListener('query_complete','annotations',function(data) {
        parseAnnotations(data);
    });
     d.addListener('query_complete','features',function(data) {
        parseFeatures(data);
    });
    d.addListener('data_request','filtered_features',function(data) {
        filterFeatures(data);
    });
};

function parseDatasetLabels(data) {
        setDatasetLabels(data);
        vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','dataset_labels', data));
}

function parseAnnotations(data) {
        vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','annotations', data));
}

function parseFeatures(features) {
    var feature_map = {};
    features['data'].forEach(function(point){
        feature_map[point.alias] = point;
    });
    feature_array = features['data'];
    var feature_types = pv.uniq(features['data'],function(f) { return f.source;});
    vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','dataset_labels', {types: feature_types}));
        vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','features', {types: feature_types, map:feature_map,array:features['data']}));
}

function filterFeatures(obj) {
    var features = vq.utils.VisUtils.clone(feature_array);
    var filter = obj.filter;

    if (filter.chr != '*') { features = features.filter(function(f) { return f.chr == filter.chr;});  }
    if (filter.label != '') { features = features.filter(function(f) { return f.label == filter.label;});}
    if (filter.type != '*') { features = features.filter(function(f) { return f.source == filter.type;});}
    if (filter.start != ''){ features = features.filter(function(f) { return f.start >= parseInt(filter.start);});}
    if (filter.stop != ''){ features = features.filter(function(f) { return f.end >= parseInt(filter.stop);});}
    switch(filter.score_fn) {
        case('>='):
                features = features.filter(function(f){ return (f.score * parseInt(f.agg)) >= parseFloat(filter.score);});
                break;
        case('<='):
                features = features.filter(function(f){ return (f.score * parseInt(f.agg)) <= parseFloat(filter.score);});
                break;
        case('Btw'):
                features = features.filter(function(f){ return ((f.score * parseInt(f.agg)) <= parseFloat(filter.score)) && ((f.score * parseInt(f.agg))>= parseFloat(filter.score)* -1);});
                break;
        case('Abs'):
        default:
                features = features.filter(function(f){ return ((f.score * parseInt(f.agg)) >= parseFloat(filter.score)) || ((f.score* parseInt(f.agg)) <= parseFloat(filter.score)* -1);});
    }

    vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','filtered_features', {data: features,filter:filter}));
}

function parseNetwork(responses) {
        function loadComplete() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','associations', parsed_data));
    }

    function loadFailed() {
        vq.events.Dispatcher.dispatch(new vq.events.Event('load_fail','associations',{msg:'Error in loading assocation data'}));
    }

    var parsed_data = {network : null,unlocated : null, features : null,unlocated_features:null,located_features:null};
    var timer = new vq.utils.SyncDatasources(400,40,loadComplete,parsed_data,loadFailed);
    timer.start_poll();

   var whole_net = responses['network'].map(function(row) {
        var node1 = row.alias1.split(':');
        var node2 = row.alias2.split(':');
           return {node1: { id: row.alias1, source : node1[1], label : node1[2], chr : node1[3].slice(3),
               start: parseInt(node1[4]), end:node1[5] != '' ? parseInt(node1[5]) : parseInt(node1[4]) },
            node2: {id: row.alias2, source : node2[1], label : node2[2], chr : node2[3].slice(3),
                start: parseInt(node2[4]), end:node2[5] != '' ? parseInt(node2[5]) : parseInt(node2[4]) },
            pvalue : row.pvalue,score : row.score, correlation:row.correlation, clin: row.clin};
            });

        var located_responses = whole_net.filter(function(feature) {
        return feature.node1.chr != '' && feature.node2.chr != '';});

        var unlocated_responses =  whole_net.filter(function(feature) {
        return feature.node1.chr == '' || feature.node2.chr == '';});

    var feature_ids = {};
    var features = [];
    var unlocated_features = [];
    whole_net.forEach(function(link) {
        if (feature_ids[link.node1.id] == null) {
            feature_ids[link.node1.id]=1;
            features.push(vq.utils.VisUtils.extend({value:link.node1.label},link.node1));
            unlocated_features.push(vq.utils.VisUtils.extend({
                    value:0, score:link.score,clin:link.clin
                    },link.node1));
        }
        if (feature_ids[link.node2.id] == null) {feature_ids[link.node2.id]=1;features.push(vq.utils.VisUtils.extend({value:link.node2.label},link.node2));    }
    });

    parsed_data['features'] = features;
    parsed_data['network'] = located_responses;
    parsed_data['unlocated'] = unlocated_responses;
    parsed_data['unlocated_features'] = unlocated_features;
    parsed_data['located_features'] = vq.utils.VisUtils.clone(features).filter(function(feature) {
            return feature.chr !='';
        });
};
