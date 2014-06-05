'use strict';

var _ = require('underscore');
var head = {
    title: 'OLX Mobile',
    canonical: '',
    metatags: {}
};

function update() {
    if (typeof window === 'undefined') {
        return;
    }
    var head = getHead();

    $('head title').text(head.title);
    _.each($('meta[name!=viewport]'), function each(metatag) {
        metatag = $(metatag);
        if (!metatag.attr('name')) {
            return;
        }
        metatag.remove();
    });
    _.each(head.metatags, function each(metatag) {
        $('head meta:last').after('<meta name="' +  metatag.name + '" content="' + metatag.content + '" />');
    });
    $('head link[rel="canonical"]').remove();
    if (head.canonical) {
        $('head').append('<link rel="canonical" href="' +  head.canonical + '" >');
    }
}

function checkSpecials(name, content) {
    if (name === 'title' || name === 'canonical') {
        head[name] = content;
        return true;
    }
    return false;
}

function getHead() {
    var clone = _.clone(head);

    clone.metatags = Object.keys(clone.metatags).map(function each(metatag) {
        return {
            name: metatag,
            content: clone.metatags[metatag]
        };
    });
    return clone;
}

module.exports = {
    getHead: getHead,
    resetHead: function() {
        head.title = 'OLX Mobile';
        head.canonical = '';
        head.metatags = {};
    },
    addMetatag: function(name, content) {
        if (!checkSpecials(name, content)) {
            head.metatags[name] = content;
        }
    },
    shortTitle: function(title, city) {
       var result = title + ' - ' + city + ' | OLX';
       var maxLength = 70;
       if (result.length > maxLength) {
            var cityCondition = ' - ' + city + ' | OLX';
            if (cityCondition.length >= maxLength) {
                return city + ' | OLX';
            }
            var titleLength = (maxLength - cityCondition.length) - 4;
            result = title.substring(0, titleLength) + '... ' + cityCondition;
            return result;
       }
       return result;
    },
    shortDescription: function(title, description, category, city) {
        var maxLength = 130;
        var constant = category + ' ' + city;
        var result = title + ' - ' + constant;
        description = description.replace(/(<([^>]+)>)/ig,'');

        if(result.length >= maxLength){
            var constantCondition = ' - ' + constant;
            if (constantCondition.length >= maxLength){
                return constant;
            }
            var titleLength = (maxLength - constantCondition.length) - 4;
            result = title.substring(0, titleLength) + '... ' + constantCondition;
        }else{
            var availableSpace = (maxLength - result.length) - 6;
            var shortDescription = description;
            if(availableSpace < description.length){
                shortDescription = description.substring(0, availableSpace) + '...';
            }
            result = title + ' - ' + shortDescription + ' - ' + constant;
        }

        return result;
    },
    update: update
};
