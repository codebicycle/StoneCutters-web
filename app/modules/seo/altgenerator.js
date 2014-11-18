'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var translations = require('../../../shared/translations');
var Base;


Backbone.noConflict();
Base = Backbone.Model;

function initialize(attributes, options) {
    var item = this.get('item');
    var levelPath;
    var itemPrice;
    var attrs;
    var alts = [];

    options = options || {};
    this.app = options.app;
    this.seo = options.seo;
    levelPath = this.seo.get('levelPath');

    attrs = {
        title: item.title,
        categoryName: item.category.name,
        price: (item.price && item.price.displayPrice ? item.price.displayPrice: ''),
        description: item.description,
        countryName:  getCountryName(item),
        stateName:  getStateName(item),
        cityName: getCityName(item),
        neighborhood: getNeighborhoodName(item)
    };

    if (levelPath && levelPath.top && levelPath.top.categoryLevel) {
        attrs.categoryLevel1 = levelPath.top.categoryLevel.anchor;
    }
    if (levelPath && levelPath.top && levelPath.top.childCategoryLevel) {
        attrs.categoryLevel2 = levelPath.top.childCategoryLevel.anchor;
    }
    this.set(attrs, {
        unset: false
    });
}

function generate () {
    var alts = [];
    var title = this.get('title');
    var message = getMessagePictureOf.call(this);

    if (this.get('neighborhood')) {
        alts.push(title + ' - ' + this.get('neighborhood'));
    }
    if (message) {
        alts.push(message + ' ' + title);
    }
    if (this.get('cityName')) {
        alts.push(title + ' - ' + this.get('cityName'));
    }
    if (this.get('categoryLevel2')) {
        alts.push(title + ' - ' + this.get('categoryLevel2'));
    }
    if (this.get('categoryLevel1')) {
        alts.push(title + ' - ' + this.get('categoryLevel1'));
    }
    if (this.get('stateName')) {
        alts.push(title + ' - ' + this.get('stateName'));
    }
    if (this.get('categoryName')) {
        alts.push(title + ' - ' + this.get('categoryName'));
    }
    if (this.get('price')) {
        alts.push(title + ' - ' + this.get('price'));
    }
    alts.push(title.substr(0,title.length <= 50 ? title.length : 50));

   return alts;
}

function getMessagePictureOf() {
    var dictionary = translations[this.app.session.get('selectedLanguage') || 'en-US'];
    var message = dictionary['itemgeneraldetails.PicturesOf'] || '';

    return message;
}

function getCountryName(item) {
    if (item.location && item.location.type == 'country' ) {
        return item.location.name;
    }
}

function getStateName(item) {
    if (item.location && item.location.children[0] && item.location.children[0].type == 'state') {
        return item.location.children[0].name;
    }
    return '';
}

function getCityName(item) {
    if (item.location && item.location.children[0] && item.location.children[0].children[0]) {
        return item.location.children[0].children[0].name;
    }
    return '';
}

function getNeighborhoodName(item) {
    if (item.location && item.location.children[0] && item.location.children[0].children[0] && item.location.children[0].children[0].children[0]) {
        return  item.location.children[0].children[0].children[0].name;
    }
    return '';
}


module.exports = Base.extend({
    initialize: initialize,
    generate: generate
});

module.exports.id = 'AltGenerator';