//Singleton class. See the return line
define([
  'underscore',
  'backbone',
], function(_, Backbone){
  var ScreenHelper = Backbone.Model.extend({
    getWidth: function(){
      return $(window).width();
    },
    getHeight: function(){
      return $(window).height();
    },
    getThumbWidth: function(){
      if ($(window).width() > 700) {
        //thumbs are 200x200 px on devices bigger than the iphone, 
        //so we add 30 por separation
        return 230;
      }else{
        //150 px wide on the iphone or smaller. Add 30 for separation
        return 180;
      };
    },
    getThumbHeight: function(){
      if ($(window).width() > 700) {
        return 230;
      }else{
        return 180;
      };
    },
    getImgsNum: function(){
      return this.getWidth() / this.getThumbWidth();
    }
  });

  return new ScreenHelper();
});