module.exports = {
  index: function(params, callback) {
  	params.item_type = 'adsList';
  	//TODO remove hardcoded location. Should come from local storage or cookie
  	params.location = 'www.olx.com.ar';
  	params['f.withPhoto'] = 'true';

    var spec = {
      collection: {collection: 'Items', params: params}
    };
    
    this.app.fetch(spec, function(err, result) {
      callback(err, result);
    });
  }
};
