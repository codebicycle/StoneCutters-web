module.exports = {
  index: function(params, callback) {
    params.item_type = 'adsList';
    
    var spec = {
      items: {collection: 'Items', params: params}
    };
    //don't read from cache, because rendr caching expects an array response
    //with ids, and smaug returns an object with 'data' and 'metadata'
    this.app.fetch(spec, {"readFromCache": false}, function(err, result) {
      result.items = result.items.models[0].get("data");
      callback(err, result);
    });
  },

  show: function(params, callback) {
    var spec = {
      model: {model: 'Item', params: params}
    };
    this.app.fetch(spec, function(err, result) {
      callback(err, result);
    });
  },

  search: function(params, callback) {
    params.item_type = 'adsList';
    params.searchTerm = params.q;
    delete params.q;

    var spec = {
      items: {collection: 'Items', params: params}
    };
    //don't read from cache, because rendr caching expects an array response
    //with ids, and smaug returns an object with 'data' and 'metadata'
    this.app.fetch(spec, {"readFromCache": false}, function(err, result) {
      result.metadata = result.items.models[0].get("metadata");
      result.items = result.items.models[0].get("data");
      result.searchTerm = params.searchTerm;
      callback(err, result);
    });
  },
};