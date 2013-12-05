var _ = require('underscore');

module.exports = {
  index: function(params, callback) {
  	
    var paramsWhatsNew = {};
    _.extend(paramsWhatsNew, params);
    
    var paramsLastVisited = {};
    _.extend(paramsLastVisited, params);

    //Setting up the photo filters.
    paramsWhatsNew.item_type = 'adsList';
  	//TODO remove hardcoded location. Should come from local storage or cookie
  	paramsWhatsNew.location = 'www.olx.com.ar';
    params.location = 'www.olx.com.ar';
  	paramsWhatsNew['f.withPhotos'] = 'true';
    //TODO we have to implement a real last visited filter.
    //paramsLastVisited.item_type = 'adsList';
    //TODO remove hardcoded location. Should come from local storage or cookie
    //paramsLastVisited.location = 'www.olx.com.ar';

    var spec = {
      whatsNewCollection: {collection: 'Items', params: paramsWhatsNew},
      categoriesCollection: {collection: 'Categories', params: params}
      //lastVisitedCollection: {collection: 'Items', params: paramsLastVisited}
    };

    this.app.fetch(spec, function(err, result) {
      result.button_color = global.button_color;
      callback(err, result);
    });
  }
};

