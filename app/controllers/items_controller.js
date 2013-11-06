module.exports = {
  index: function(params, callback) {
    params.item_type = 'adsList';
    
    var spec = {
      collection: {collection: 'Items', params: params}
    };
    this.app.fetch(spec, function(err, result) {
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