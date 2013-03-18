define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var JSONHelperModel = Backbone.Model.extend({
    concatJSON: function (o1, o2) {
      for (var key in o2) {
       o1[key] = o2[key];
      }
      return o1;
    },
    parseTitleValue: function (o) {
      var objs = [];
      
      for (var key in o) {
        var obj = {};
        obj['title'] = key;
        obj['value'] = o[key];
        objs.push(obj);
      }

      return objs;
    },
    parseQueryString: function (queryString){
      var params = {};
      if(queryString){
          _.each(
              _.map(decodeURI(queryString).split(/&/g),function(el,i){
                  var aux = el.split('='), o = {};
                  if(aux.length >= 1){
                      var val = undefined;
                      if(aux.length == 2)
                          val = aux[1];
                      o[aux[0]] = val;
                  }
                  return o;
              }),
              function(o){
                  _.extend(params,o);
              }
          );
      }
      return params;
    },
  });

  return JSONHelperModel;
});