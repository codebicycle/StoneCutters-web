var City = require('../models/city')
  , Base = require('./base');

module.exports = Base.extend({
  model: City,
  url: '/countries/:location/cities',
  parse: function(response) {
  	this.metadata = response.metadata;
  	return response.data;
  }
});
module.exports.id = 'Cities';
