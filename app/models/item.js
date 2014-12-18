'use strict';

var Base = require('../bases/model');
var asynquence = require('asynquence');
var _ = require('underscore');
var helpers = require('../helpers');
var statsd = require('../../shared/statsd')();

module.exports = Base.extend({
    idAttribute: 'id',
    url: '/items/:id',
    defaults: {
        category: {},
        images: []
    },
    shortTitle: shortTitle,
    shortDescription: shortDescription,
    getLocation: getLocation,
    checkSlug: checkSlug,
    parse: parse,
    validate: validate,
    post: post,
    postFields: postFields,
    postImages: postImages,
    logValidation: logValidation,
    logPost: logPost,
    logPostImages: logPostImages,
    toData: toData
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

function parse(item, options) {
    if (item && item.date) {
        item.date.since = helpers.timeAgo(item.date);
    }
    if (item.priceC && this.app.session.get('location').url === 'www.olx.ir') {
        item.priceC = helpers.numbers.toLatin(item.priceC);
    }
    return Base.prototype.parse.apply(this, arguments);
}

function post(done) {
    asynquence().or(done.fail || done)
        .then(this.validate.bind(this))
        .then(this.postImages.bind(this))
        .then(this.postFields.bind(this))
        .val(done);
}

function validate(done) {
    var platform = this.app.session.get('platform');

    helpers.dataAdapter.post(this.app.req, '/items', {
        data: this.toData(),
        query: {
            intent: 'validate',
            postingSession: this.get('postingSession'),
            languageId: this.app.session.get('languageId'),
            platform: platform
        }
    }, callback.bind(this));

    function callback(err, response, errors) {
        this.logValidation(!this.get('id') ? 'posting' : 'editing', response.statusCode, err || errors);
        (done.errfcb || done)(err || errors, response);
    }
}

function postImages(done) {
    var images = this.get('images');
    var newImages = {};
    var oldImages = [];

    if (!images || Array.isArray(images)) {
        this.set('images', _.map(images || oldImages, function each(image) {
            return typeof image === 'string' ? image : image.id;
        }));
        return (done.errfcb || done)(undefined, undefined, images || oldImages);
    }
    Object.keys(_.omit(images, 'length')).forEach(function each(key) {
        if (typeof images[key] === 'string') {
            oldImages.push(images[key]);
        }
        else if (!(images[key] instanceof Function)) {
            newImages[key] = images[key];
        }
    });
    if (_.isEmpty(newImages)) {
        this.set('images', oldImages);
        return (done.errfcb || done)(undefined, undefined, oldImages);
    }
    helpers.dataAdapter.post(this.app.req, '/images', {
        query: {
            postingSession: this.get('postingSession'),
            platform: this.app.session.get('platform'),
            url: this.get('location')
        },
        data: newImages,
        multipart: true,
        cache: false,
        dataType: 'json',
        processData: false,
        contentType: false
    }, callback.bind(this));

    function callback(err, response, newImages) {
        var images = oldImages.concat(newImages);

        this.logPostImages(!this.get('id') ? 'posting' : 'editing', response.statusCode, newImages);
        if (!err) {
            this.set('images', images);
        }
        (done.errfcb || done)(err, response, images);
    }
}

function postFields(done) {
    var id = this.get('id');
    var sk = this.get('sk');
    var user = this.app.session.get('user');
    var query = {
        postingSession: this.get('postingSession'),
        languageId: this.app.session.get('languageId'),
        platform: this.app.session.get('platform')
    };
    var data;

    if (!id) {
        query.intent = 'create';
    }
    if (user) {
        query.token = user.token;
    }
    else if (id && sk) {
        query.securityKey = sk;
        this.unset('sk');
    }
    data = this.toData(true);
    helpers.dataAdapter.post(this.app.req, '/items' + (!id ? '' : ['', id, 'edit'].join('/')), {
        data: data,
        query: query
    }, callback.bind(this));

    function callback(err, response, item) {
        if (!err && item) {
            this.set(item);
        }
        this.logPost(!id ? 'posting' : 'editing', response.statusCode, err);
        (done.errfcb || done)(err, response, item);
    }
}

function logValidation(type, statusCode, errors) {
    var platform = this.app.session.get('platform');
    var locale = this.app.session.get('location').abbreviation.toLowerCase();

    if (!errors) {
        return statsd.increment([locale, 'posting', 'success', 'validation', platform]);
    }
    if (statusCode != 200) {
        return statsd.increment([locale, 'posting', 'error', 'validation', statusCode, platform]);
    }
    errors.forEach(function each(error) {
        statsd.increment([locale, 'posting', 'error', 'validation', statusCode, error.selector, platform]);
    });
}

function logPostImages(type, statusCode, errors) {
    var platform = this.app.session.get('platform');
    var locale = this.app.session.get('location').abbreviation.toLowerCase();

    if (statusCode == 200) {
        return statsd.increment([locale, 'posting', 'success', 'images', platform]);
    }
    if (statusCode != 400) {
        return statsd.increment([locale, 'posting', 'error', 'images', statusCode, platform]);
    }
    errors.forEach(function each(error) {
        statsd.increment([locale, 'posting', 'error', 'images', statusCode, error.selector, platform]);
    });
}

function logPost(type, statusCode, errors) {
    var platform = this.app.session.get('platform');
    var locale = this.app.session.get('location').abbreviation.toLowerCase();

    if (statusCode == 200) {
        return statsd.increment([locale, type, 'success', platform]);
    }
    if (statusCode != 400) {
        return statsd.increment([locale, type, 'error', 'post', statusCode, platform]);
    }
    errors.forEach(function each(error) {
        statsd.increment([locale, type, 'error', 'post', statusCode, error.selector, platform]);
    });
}

function toData(includeImages) {
    var data = this.toJSON();
    var images = this.get('images');

    data['category.parentId'] = data['category.parentId'] || (this.get('category') || {}).parentId;
    data['category.id'] = data['category.id'] || (this.get('category') || {}).id;
    delete data.category;
    if (typeof data.location !== 'string') {
        try {
            data.location = this.get('location').children[0].children[0].url;
        }
        catch(err) {
            delete data.location;
        }
    }
    if (includeImages && images && images.length) {
        data.images = images.join(',');
    }
    delete data.date;
    delete data.metadata;
    delete data.status;
    delete data.user;
    delete data.slug;
    delete data.priceTypeData;
    return data;
}

