define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/pages/page1Template.html'
  ], 

  function($,_, Backbone, page1Template){

    var Page1View = Backbone.View.extend({
      el: $("#page"),
      
      template: _.template(page1Template),

      render:function () {
      
        this.$el.html(this.template);
        return this;
      }
    });
  return Page1View;
});