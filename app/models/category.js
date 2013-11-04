var Base = require('./base');

module.exports = Base.extend({
  url: '/countries/:location/categories/:id',
  idAttribute: 'id'
});
module.exports.id = 'Category';
