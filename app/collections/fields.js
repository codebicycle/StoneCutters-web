'use strict';

var Field = require('../models/field');
var Base = require('./base');

module.exports = Base.extend({
    model: Field,
    url: function(){
        var url;
        var params = this.params;
        switch(params.intent){
        case 'post':
            url = '/items/fields?intent=post&location='+params.location+'&categoryId='+params.categoryId+'&languageId='+params.languageId+'&languageCode='+params.languageCode;
        break;
        case 'edit':
            url = '/items/fields?intent=edit&location='+params.location+'&categoryId='+params.categoryId+'&languageId='+params.languageId+'&languageCode='+params.languageCode+'&itemId='+params.itemId;
        break;
        case 'catchange':
            url = '/items/fields?intent=catchange&location='+params.location+'&categoryId='+params.categoryId+'&languageId='+params.languageId+'&languageCode='+params.languageCode+'&itemId='+params.itemId;
        break;
        default:
            url = '/items/fields?intent=edit&location='+params.location+'&categoryId='+params.categoryId+'&languageId='+params.languageId+'&languageCode='+params.languageCode+'&itemId='+params.itemId;
        break;
    }
    return url;
  }
});

module.exports.id = 'Fields';
