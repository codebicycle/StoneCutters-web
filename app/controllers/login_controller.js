var EnvHelper = require('../helpers/env_helper');

module.exports = {
  index: function(params, callback) {
    EnvHelper.setUrlVars(this.app); 
    
    callback(null, {
      "params": params
    });

  }
};