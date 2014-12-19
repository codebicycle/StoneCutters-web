'use strict';

var Base = require('../bases/model');
var asynquence = require('asynquence');
var helpers = require('../helpers');

module.exports = Base.extend({
    idAttribute: 'id',
    url: '/items/:id',
    shortTitle: shortTitle,
    shortDescription: shortDescription,
    getLocation: getLocation,
    checkSlug: checkSlug,
    parse: parse,
    remove: remove
});

module.exports.id = 'Item';

function shortTitle() {
    var title = this.get('title');
    var location = this.getLocation();
    var result = title + ' - ' + location.name + ' | OLX';
    var maxLength = 70;
    var cityCondition;

    if (result.length > maxLength) {
        cityCondition = ' - ' + location.name + ' | OLX';

        if (cityCondition.length >= maxLength) {
            return location.name + ' | OLX';
        }
        result = title.substring(0, (maxLength - cityCondition.length) - 4) + '... ' + cityCondition;
    }
    return result;
}

function shortDescription() {
    var title = this.get('title');
    var description = this.get('description');
    var category = this.get('category').name;
    var location = this.getLocation();
    var maxLength = 130;
    var constant = category + ' ' + location.name;
    var result = title + ' - ' + constant;
    var constantCondition;
    var availableSpace;

    description = description.replace(/(<([^>]+)>)/ig,'');
    if(result.length >= maxLength) {
        constantCondition = ' - ' + constant;

        if (constantCondition.length >= maxLength) {
            return constant;
        }
        result = title.substring(0, (maxLength - constantCondition.length) - 4) + '... ' + constantCondition;
    }
    else {
        availableSpace = (maxLength - result.length) - 6;

        if(availableSpace < description.length) {
            description = description.substring(0, availableSpace) + '...';
        }
        result = title + ' - ' + description + ' - ' + constant;
    }
    return result;
}

function getLocation() {
    var location = this.get('location');

    if (location.children) {
        location = location.children[0];
        if (location.children) {
            location = location.children[0];
        }
    }
    return location;
}

function checkSlug(itemSlug, urlSlug) {
    var slug = [(urlSlug ? (urlSlug + '-') : ''), 'iid-', this.get('id')].join('');

    if (itemSlug === slug) {
        if (this.app.session.get('path').slice(1).indexOf('-iid-')) {
            return true;
        }
    }
    return false;
}

function parse(resp, options) {
    if (resp && resp.date) {
        resp.date.since = helpers.timeAgo(resp.date);
    }
    return Base.prototype.parse.apply(this, arguments);
}

function remove(reason, comment, done) {
    helpers.dataAdapter.post(this.app.req, '/items/' + this.get('id') + '/delete', {
        query: {
            token: (this.app.session.get('user') || {}).token,
            platform: this.app.session.get('platform'),
            reason: reason,
            comment: comment
        }
    }, callback.bind(this));

    function callback(err) {
        this.set('status', 'closed');
        this.errfcb(done)(err);
    }
}
