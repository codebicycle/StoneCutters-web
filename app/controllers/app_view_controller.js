var _ = require('underscore');

module.exports = {
  index: function(params, callback) {
    console.log("INDEX DE APP_VIEW");
    params.location = 'www.olx.com.ar';

    var spec = {
      categoriesCollection: {collection: 'Categories', params: params}
    };

    this.app.fetch(spec, function(err, result) {
      callback(err, result);
    });
  }
};

