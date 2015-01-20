'use strict';

var Base = require('../bases/controller');
var List = require('./models/list');
var Show = require('./models/show');
var ShowIg = require('./models/showig');

var Categories = Base.extend({
    list: list,
    show: show,
    showig: showig
});

function list(params, callback) {
    return Base.prototype.action.call(this, List, arguments);
}

function showig(params, callback) {
    var platform = this.app.session.get('platform');

    if (platform !== 'desktop') {
        return helpers.common.error.call(this, null, {}, callback);
    }
    params['f.hasimage'] = true;
    return show.call(this, params, callback, '-ig');
}

function show(params, callback, gallery) {
    return Base.prototype.action.call(this, Show, arguments);
}

module.exports = Categories;
