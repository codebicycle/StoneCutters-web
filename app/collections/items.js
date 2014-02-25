var Item = require('../models/item');
var Base = require('./base');

module.exports = Base.extend({
    model: Item,
    url: function(){
        var url;
        switch(this.params.item_type){
        case 'adsList':
            url = '/items';
        break;
        case 'myAds':
            url = '/users/'+this.Storage.get('userObj').userId+'/items';
        break;
        case 'myFavorites':
            url = '/users/'+this.Storage.get('userObj').userId+'/favorites';
        break;
        default:
            url = '/items';
        break;
    }
    return url;
  }
});

module.exports.id = 'Items';
