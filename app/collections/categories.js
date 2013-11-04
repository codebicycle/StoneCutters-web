var Category = require('../models/category')
  , Base = require('./base');

module.exports = Base.extend({
  model: Category,
  url: '/countries/:location/categories'
});
module.exports.id = 'Categories';
