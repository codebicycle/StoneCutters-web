var _ = require('underscore');

module.exports = {
  index: function(params, callback) {
  	
    var paramsWhatsNew = {};
    _.extend(paramsWhatsNew, params);
    
    var paramsLastVisited = {};
    _.extend(paramsLastVisited, params);

    var siteLocation = this.app.get("baseData").siteLocation;

    //Setting up the photo filters.
    paramsWhatsNew.item_type = 'adsList';
    paramsWhatsNew.location = siteLocation;
    params.location = siteLocation;
  	paramsWhatsNew['f.withPhotos'] = 'true';
    //TODO we have to implement a real last visited filter.
    //paramsLastVisited.item_type = 'adsList';
    //TODO remove hardcoded location. Should come from local storage or cookie
    //paramsLastVisited.location = 'www.olx.com.ar';

    var spec = {
      whatsNewItems: {collection: 'Items', params: paramsWhatsNew},
      categories: {collection: 'Categories', params: params}
      //lastVisitedCollection: {collection: 'Items', params: paramsLastVisited}
    };

    this.app.fetch(spec, function(err, result) {
      result.button_color = global.button_color;
      result.siteLocation = siteLocation;
      result.whatsNewMetadata = result.whatsNewItems.models[0].get("metadata");
      result.whatsNewItems = result.whatsNewItems.models[0].get("data");
      result.firstItem = result.whatsNewItems[0];
      callback(err, result);
    });
  }
};

