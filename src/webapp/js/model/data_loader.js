
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
    d.addListener('query_complete','filtered_features',function(obj) {
        parseFeatures(obj);
        
    });
};

function parseDatasetLabels(data) {
        setDatasetLabels(data);
        vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','dataset_labels', {clin: data.clin_labels, types: pv.entries(label_map)}));
}

function parseAnnotations(data) {
        vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','annotations', data));
}

function parseFeatures(obj) {
        var features = obj.data;
    var filter = obj.filter;

    features = features.filter(function(row) { return row.alias1.split(':')[3] !== '' || row.alias2.split(':')[3] !== '';});
    var feature_array = features.map(function(row) {
       var f1 = row.alias1.split(':');
       var f2 = row.alias2.split(':');
        var label_mod1 = f1.length >= 8 ? f1[7] : '';
        var label_mod2 = f2.length >= 8 ? f2[7] : '';
        var obj = {score: row.score, logged_pvalue : row.logged_pvalue,
            correlation: row.correlation, sign: row.sign, num_nonna: row.num_nonna};
        var feature;
        switch('CLIN') {
            case(f2[1]) :
                feature = { source : f1[1], label : f1[2], chr : f1[3].slice(3),
               start: parseInt(f1[4]), end:f1[5] != '' ? parseInt(f1[5]) : parseInt(f1[4]), clin : f2[2],
                label_mod: label_mod1};
            break;
            case(f1[1]) :
                feature = { source : f2[1], label : f2[2], chr : f2[3].slice(3),
               start: parseInt(f2[4]), end:f2[5] != '' ? parseInt(f2[5]) : parseInt(f2[4]), clin: f1[2],
                label_mod: label_mod2};
                break;
        }
        return vq.utils.VisUtils.extend(obj,feature);

    });
    
        vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','filtered_features', {data:feature_array,filter:filter}));

}

function filterFeatures(obj) {
    var features = obj.data;
    var filter = obj.filter;
//
//    if (filter.chr != '*') { features = features.filter(function(f) { return f.chr == filter.chr;});  }
//    if (filter.label != '') { features = features.filter(function(f) { return f.label == filter.label;});}
//    if (filter.type != '*') { features = features.filter(function(f) { return f.source == filter.type;});}
//    if (filter.start != ''){ features = features.filter(function(f) { return f.start >= parseInt(filter.start);});}
//    if (filter.stop != ''){ features = features.filter(function(f) { return f.end >= parseInt(filter.stop);});}
//    var score = (f.sign === '-' ? -1 : 1) * f.score;
//    var filter_score = parseFloat(filter.score);
//    switch(filter.score_fn) {
//        case('>='):
//                features = features.filter(function(f){ return score >= filter_score;});
//                break;
//        case('<='):
//                features = features.filter(function(f){ return score <= filter_score;});
//                break;
//        case('Btw'):
//                features = features.filter(function(f){ return score <= filter_score && score >= filter_score * -1;});
//                break;
//        case('Abs'):
//        default:
//                features = features.filter(function(f){ return score >= filter_score || score <= filter_score * -1;});
//    }

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
        var label_mod1 = node1.length >= 8 ? node1[7] : '';
        var label_mod2 = node2.length >= 8 ? node2[7] : '';

           return {node1: { id: row.alias1, source : node1[1], label : node1[2], chr : node1[3].slice(3),
               start: parseInt(node1[4]), end:node1[5] != '' ? parseInt(node1[5]) : parseInt(node1[4]),
            label_mod: label_mod1},
            node2: {id: row.alias2, source : node2[1], label : node2[2], chr : node2[3].slice(3),
                start: parseInt(node2[4]), end:node2[5] != '' ? parseInt(node2[5]) : parseInt(node2[4]),
             label_mod: label_mod2},
            logged_pvalue : row.logged_pvalue,score : row.score, correlation:row.correlation, clin: row.clin};
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
