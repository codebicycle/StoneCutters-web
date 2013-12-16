module.exports = {
  index: function(params, callback) {
    params.item_type = 'adsList';
    
    var spec = {
      items: {collection: 'Items', params: params}
    };
    //don't read from cache, because rendr caching expects an array response
    //with ids, and smaug returns an object with 'data' and 'metadata'
    this.app.fetch(spec, {"readFromCache": false}, function(err, result) {
      console.log(result.items.models[0].get("data")[0].title);
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
  }
};