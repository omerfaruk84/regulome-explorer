
function registerModelListeners() {

var d = vq.events.Dispatcher;
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
    	point.score = point.score * parseInt(point.agg);
        feature_map[point.alias] = point;
    });
    var feature_types = pv.uniq(features['data'],function(f) { return f.source;});
    vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','dataset_labels', {types: feature_types}));
        vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','features', {types: feature_types, map:feature_map,array:features['data']}));
}

function filterFeatures(obj) {
    var features = vq.utils.VisUtils.clone(feature_array);
    var filter = obj.filter;
    var filter_chr = filter.chr.split(',');
    if (filter.chr != '*') { features = features.filter(function(f) { return filter_chr.some(function(key) { return key == f.chr;});});}
    if (filter.label != '') { features = features.filter(function(f) { return f.label == filter.label;});}
    if (filter.type != '*') { features = features.filter(function(f) { return f.source == filter.type;});}
    if (filter.start != ''){ features = features.filter(function(f) { return f.start >= parseInt(filter.start);});}
    if (filter.stop != ''){ features = features.filter(function(f) { return f.end >= parseInt(filter.stop);});}
    switch(filter.score_fn) {
        case('>='):
                features = features.filter(function(f){ return f.score >= parseFloat(filter.score);});
                break;
        case('<='):
                features = features.filter(function(f){ return f.score <= parseFloat(filter.score);});
                break;
        case('Btw'):
                features = features.filter(function(f){ return (f.score <= parseFloat(filter.score)) && (f.score >= parseFloat(filter.score)* -1);});
                break;
        case('Abs'):
        default:
                features = features.filter(function(f){ return (f.score >= parseFloat(filter.score)) || (f.score <= parseFloat(filter.score)* -1);});
    }

    vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','filtered_features', {data: features,filter:filter}));
}