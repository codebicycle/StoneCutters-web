module.exports = function(Handlebars) {
  return {
    layout: function(template, path, options) {
      this.layout = template + path;
      return options.fn(this);
    }
  };
};
