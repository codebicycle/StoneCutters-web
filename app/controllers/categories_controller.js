module.exports = {
  index: function(params, callback) {

    var category = this.app.get("baseData").categories._byId[params.id];    
    
    callback(null, {
      "category": category
    });

  },

  show: function(params, callback) {

    var category = this.app.get("baseData").categories._byId[params.id];

    callback(null, {
      "category": category,
      "params": params
    });

  }
};