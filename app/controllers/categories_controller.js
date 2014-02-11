var EnvHelper = require('../helpers/env_helper');

module.exports = {
  index: function(params, callback) {
    var spec = {
      collection: {collection: 'Categories', params: params}
    };

    EnvHelper.setUrlVars(this.app);

    this.app.fetch(spec, function(err, result) {
      callback(err, result);
    });
  },

  show: function(params, callback) {
    var spec = {
      model: {model: 'Category', params: params}
    };

    EnvHelper.setUrlVars(this.app);

    this.app.fetch(spec, function(err, result) {
      callback(err, result);
    });
  }
};