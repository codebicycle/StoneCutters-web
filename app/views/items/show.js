var BaseView = require('../base');

module.exports = BaseView.extend({
  className: 'items_show_view',

  getTemplateData: function() {
    var data = BaseView.prototype.getTemplateData.call(this);
    data.category_name = this.options.category_name;
    return data;
  }
});
module.exports.id = 'items/show';
