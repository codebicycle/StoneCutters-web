define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'text!templates/register/termsTemplate.html'
  ], 

  function($,_, Backbone, Handlebars, termsTemplate){

    var LoginView = Backbone.View.extend({
      el: "#home",

      events:{
      },

      initialize: function(options){
        document.title = "Terms";
        
        this.dfd = null || options.deferred;

        // Compile the template using Handlebars micro-templating
        this.termsCT = Handlebars.compile(termsTemplate);

        if (this.dfd) this.dfd.resolve(this);
      },
      render:function (){
        
        $(this.el).find('#content').html(this.termsCT({}));
        $(this.el).find('#content').trigger('create');

        return this;
      }
    });
    return LoginView;
});
