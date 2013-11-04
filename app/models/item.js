var Base = require('./base');

module.exports = Base.extend({
  url: '/items/:id',
  idAttribute: 'id'
});
module.exports.id = 'Item';
