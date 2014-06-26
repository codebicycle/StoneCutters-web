'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    idAttribute: 'id',
    url: function() {
        var url = '/items/:id';
        var prefix = '?';

        if (this.get('token')) {
            url += prefix + 'token=:token';
            prefix = '&';
        }
        if (this.get('securityKey')) {
            url += prefix + 'securityKey=:securityKey';
            prefix = '&';
        }
        if (this.get('languageId')) {
            url += prefix + 'languageId=:languageId';
            prefix = '&';
        }
        if (this.get('languageCode')) {
            url += prefix + 'languageCode=:languageCode';
        }
        return url;
    },
    shortTitle: function() {
        var title = this.get('title');
        var location = this.getLocation();
        var result = title + ' - ' + location.name + ' | OLX';
        var maxLength = 70;
        if (result.length > maxLength) {
            var cityCondition = ' - ' + location.name + ' | OLX';

            if (cityCondition.length >= maxLength) {
                return location.name + ' | OLX';
            }
            result = title.substring(0, (maxLength - cityCondition.length) - 4) + '... ' + cityCondition;
        }
        return result;
    },
    shortDescription: function() {
        var title = this.get('title');
        var description = this.get('description');
        var category = this.get('category').name;
        var location = this.getLocation();
        var maxLength = 130;
        var constant = category + ' ' + location.name;
        var result = title + ' - ' + constant;

        description = description.replace(/(<([^>]+)>)/ig,'');
        if(result.length >= maxLength) {
            var constantCondition = ' - ' + constant;

            if (constantCondition.length >= maxLength) {
                return constant;
            }
            result = title.substring(0, (maxLength - constantCondition.length) - 4) + '... ' + constantCondition;
        }
        else {
            var availableSpace = (maxLength - result.length) - 6;
            
            if(availableSpace < description.length) {
                description = description.substring(0, availableSpace) + '...';
            }
            result = title + ' - ' + description + ' - ' + constant;
        }
        return result;
    },
    getLocation: function() {
        var location = this.get('location');

        if (location.children) {
            location = location.children[0];
            if (location.children) {
                location = location.children[0];
            }
        }
        return location;
    }
});

module.exports.id = 'Item';
