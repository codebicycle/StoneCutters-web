var Item = require('../models/item')
  , Base = require('./base');

module.exports = Base.extend({
  model: Item,
  url: '/items'
});
module.exports.id = 'Items';
