var EnvHelper = require('../helpers/env_helper');

module.exports = {
  index: function(params, callback) {
    EnvHelper.setUrlVars(this.app);

    var category = this.app.get("baseData").categories._byId[params.id];    
    
    callback(null, {
      "category": category,
      "params": params
    });

  },

  show: function(params, callback) {
    EnvHelper.setUrlVars(this.app);

    var category = this.app.get("baseData").categories._byId[params.id];

    callback(null, {
      "category": category,
      "params": params
    });

  }
};