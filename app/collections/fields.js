'use strict';

var Base = require('../bases/collection');
var Field = require('../models/field');

module.exports = Base.extend({
    model: Field,
    url: function() {
        var url;
        var params = this.params;
        switch(params.intent) {
            case 'post':
                url = '/items/fields?intent=post&location='+params.location+'&categoryId='+params.categoryId+'&languageId='+params.languageId+'&languageCode='+params.languageCode;
                break;
            case 'edit':
                url = '/items/fields?intent=edit&location='+params.location+'&categoryId='+params.categoryId+'&languageId='+params.languageId+'&languageCode='+params.languageCode+'&itemId='+params.itemId;
                if (params.token) {
                    url += '&token='+params.token;
                    delete params.token;
                }
                else if (params.securityKey) {
                    url += '&securityKey='+params.securityKey;
                    delete params.securityKey;
                }
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
