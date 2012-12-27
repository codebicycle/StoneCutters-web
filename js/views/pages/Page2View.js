define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/pages/page2Template.html'
  ], 

  function($,_, Backbone, page2Template){

    var Page2View = Backbone.View.extend({
      el: $("#page2"),
      
      template: _.template(page2Template),

      render:function () {
      
        this.$el.html(this.template);
        return this;
      }
    });
  return Page2View;
});