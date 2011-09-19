
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

}

function parseDatasetLabels(data) {
        setDatasetLabels(data);
        vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','dataset_labels', data));
}


function parseAnnotations(data) {
        vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','annotations', data));
}

function parseFeatures(data) {
        vq.events.Dispatcher.dispatch(new vq.events.Event('data_ready','features', data));
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
           //indexOf(x) == 0 is equivalent to startsWith
       if (node1[2].indexOf('chr') == 0){ node1[2] = node1[2] + '_' + node1[3];  node1.splice(3,1);}
       if (node2[2].indexOf('chr') == 0){ node2[2] = node2[2] + '_' + node2[3];  node2.splice(3,1);}
           return {node1: {id : row.f1id, source : node1[1], label : node1[2], chr : node1[3].length  < 3 ? node1[3] : node1[3].slice(3),
               start: parseInt(node1[4]), end:node1[5] != '' ? parseInt(node1[5]) : parseInt(node1[4]),genescore:row.f1genescore},
            node2: {id : row.f2id, source : node2[1], label : node2[2], chr :  node2[3].length  < 3 ? node2[3] : node2[3].slice(3),
                start: parseInt(node2[4]), end:node2[5] != '' ? parseInt(node2[5]) : parseInt(node2[4]),genescore:row.f2genescore},
            pvalue : row.pvalue,importance : row.importance, correlation:row.correlation};
    }
            );
        var located_responses = whole_net.filter(function(feature) {
        return feature.node1.chr != '' && feature.node2.chr != '';});

        var unlocated_responses =  whole_net.filter(function(feature) {
        return feature.node1.chr == '' || feature.node2.chr == '';});

    var feature_ids = {};
    var features = [];
    whole_net.forEach(function(link) {
        if (feature_ids[link.node1.id] == null) {feature_ids[link.node1.id]=1;features.push(vq.utils.VisUtils.extend({value:link.node1.label},link.node1));    }
        if (feature_ids[link.node2.id] == null) {feature_ids[link.node2.id]=1;features.push(vq.utils.VisUtils.extend({value:link.node2.label},link.node2));    }
    });

    parsed_data['features'] = features;
    parsed_data['network'] = located_responses;
    parsed_data['unlocated'] = unlocated_responses;
    parsed_data['unlocated_features'] = vq.utils.VisUtils.clone(features).filter(function(feature) {
            return feature.chr =='';
        });
    parsed_data['located_features'] = vq.utils.VisUtils.clone(features).filter(function(feature) {
            return feature.chr !='';
        });
}