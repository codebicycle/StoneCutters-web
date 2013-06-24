define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var ConstModel = Backbone.Model.extend({
    defaults: {
      MyMessageListView : {
        pageSize: 10
      },
      AdsListView : {
        pageSize: 20
      },
      MyAdsListView : {
        pageSize: 20
      },
      MyFavoritesAdsListView : {
        pageSize: 20
      },
      ScrollView : {
        scrollFetchPxOffset: 100
      },
    }
  });
  
  // Return the model for the module
  return new ConstModel();
});
