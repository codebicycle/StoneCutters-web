define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/home/homeTemplate.html'
  ], 

  function($,_, Backbone, homeTemplate){

    var HomeView = Backbone.View.extend({
      el: $("#home"),

      template: _.template(homeTemplate),

      render: function(){
        this.$el.html(this.template);
        return this;
      }
    });
    return HomeView;
});
