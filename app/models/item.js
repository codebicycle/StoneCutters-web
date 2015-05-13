'use strict';

var S = require('string');
var _ = require('underscore');
var asynquence = require('asynquence');
var config = require('../../shared/config');
var Base = require('../bases/model');
var helpers = require('../helpers');
var statsd = require('../../shared/statsd')();
var utils = require('../../shared/utils');

module.exports = Base.extend({
    idAttribute: 'id',
    url: '/items/:id',
    defaults: defaults,
    shortTitle: shortTitle,
    shortDescription: shortDescription,
    getLocation: getLocation,
    checkSlug: checkSlug,
    indexOfOptional: indexOfOptional,
    parse: parse,
    validate: validate,
    post: post,
    postFields: postFields,
    postImages: postImages,
    logValidation: logValidation,
    logPost: logPost,
    logPostImages: logPostImages,
    toData: toData,
    remove: remove,
    rebump: rebump,
    republish: republish,
    stillAvailable: stillAvailable
});

module.exports.id = 'Item';

function defaults() {
    return {
        category: {},
        optionals: [],
        images: []
    };
}

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

    if (!location) {
        return location;
    }
    if (location.children && location.children.length) {
        location = location.children[0];
        if (location.children && location.children.length) {
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

function indexOfOptional(name) {
    var index;

    _.each(this.get('optionals'), function each(optional, i) {
        if (optional.name === name) {
            index = i;
        }
    }, this);
    return index;
}

function parse(item, options) {
    var digits = config.getForMarket(this.app.session.get('location').url, ['layoutOptions', 'digits'], {});

    if (item && item.date) {
        item.date.since = helpers.timeAgo(item.date);
    }
    if (item.priceC && this.app.session.get('location').url === 'www.olx.ir') {
        item.priceC = helpers.numbers.toLatin(item.priceC);
    }
    if (item.optionals && item.optionals.length) {
        item.optionals = _.sortBy(item.optionals, 'name').reverse();
    }
    if (item.description) {
        item.description = S(item.description).stripTags().s;
    }
    if (item.price && item.price.displayPrice) {
        item.price.displayPrice = (digits !== 'western-arabic') ? helpers.numbers.translate(item.price.displayPrice, {to: digits}) : item.price.displayPrice;
    }
    if (this.app.localstorage && this.app.localstorage.ready && helpers.features.isEnabled.call(this, 'visitedItems') && this.app.sixpack.experiments.dgdMarkVisitedItems) {
        var className = this.app.sixpack.className(this.app.sixpack.experiments.dgdMarkVisitedItems);
        var status = (_.contains(this.app.localstorage.get('visited'), item.id)) ? 'visited' : 'not-visited';

        item.visited = className + ' ' + status;
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
        this.errfcb(done)(err || errors, response);
    }
}

function postImages(done) {
    var newImages = _.filter(this.get('images'), function each(image) {
        return typeof image !== 'string' && !image.id;
    }, this);

    if (!newImages.length) {
        return this.errfcb(done)();
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

    function callback(err, response, ids) {
        this.logPostImages(!this.get('id') ? 'posting' : 'editing', response.statusCode, (err ? (_.isString(err) ? ids : err) : undefined));
        if (!err) {
            _.each(newImages, function each(image, i) {
                image.id = ids[i];
            });
        }
        this.errfcb(done)(err, response);
    }
}

function postFields(done) {
    var id = this.get('id');
    var type = !id ? 'posting' : 'editing';
    var user = this.app.session.get('user');
    var renew =  this.get('renew') || false;
    var platform = this.app.session.get('platform');
    var locale = this.app.session.get('location').abbreviation;
    var action = 'edit';
    var query = {
        postingSession: this.get('postingSession'),
        languageId: this.app.session.get('languageId'),
        platform: platform
    };
    var data;

    if(renew) {
        action = 'renew';
    }
    if (!id) {
        query.intent = 'create';
    }
    if (user) {
        query.token = user.token;
    }
    else if (id) {
        query.securityKey = this.get('securityKey');
    }

    data = this.toData(true);
    if (data.priceC && !data.currency_type) {
        statsd.increment([locale, type, 'error', 'currency', 'post', platform]);
    }

    helpers.dataAdapter.post(this.app.req, '/items' + (!id ? '' : ['', id, action].join('/')), {
        data: data,
        query: query
    }, callback.bind(this));

    function callback(err, response, item) {
        if (!err && item) {
            this.set(item);
        }
        if (!user && item.email) {
            this.app.session.persist({
                hash: item.email
            }, {
                maxAge: utils.DAY
            });
        }

        this.logPost(type, response.statusCode, err);
        this.errfcb(done)(err, response, item);
    }
}

function logValidation(type, statusCode, errors) {
    var platform = this.app.session.get('platform');
    var locale = this.app.session.get('location').abbreviation;

    if (!errors) {
        return statsd.increment([locale, type, 'success', 'validation', platform]);
    }
    if (statusCode != 200) {
        return statsd.increment([locale, type, 'error', 'validation', statusCode, platform]);
    }
    errors.forEach(function each(error) {
        statsd.increment([locale, type, 'error', 'validation', statusCode, error.selector, platform]);
    });
}

function logPostImages(type, statusCode, errors) {
    var platform = this.app.session.get('platform');
    var locale = this.app.session.get('location').abbreviation;

    if (statusCode == 200) {
        return statsd.increment([locale, type, 'success', 'images', platform]);
    }
    if (statusCode != 400) {
        return statsd.increment([locale, type, 'error', 'images', statusCode, platform]);
    }
    errors.forEach(function each(error) {
        statsd.increment([locale, type, 'error', 'images', statusCode, error.selector, platform]);
    });
}

function logPost(type, statusCode, errors) {
    var platform = this.app.session.get('platform');
    var locale = this.app.session.get('location').abbreviation;

    if (statusCode == 200) {
        return statsd.increment([locale, type, 'success', 'post', platform]);
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

    data['category.parentId'] = data['category.parentId'] || (this.get('category') || {}).parentId;
    data['category.id'] = data['category.id'] || (this.get('category') || {}).id;
    if (typeof data.location !== 'string') {
        if (data.city) {
            data.location = data.city;
        }
        else {
            try {
                data.location = this.getLocation().url;
            }
            catch(err) {
                delete data.location;
            }
        }
    }
    if (data.price && !data.priceC) {
        data.priceC = data.price;
    }
    if (_.isObject(data.priceC)) {
        data.priceC = data.priceC.amount;
    }
    if (data.priceC && !data.priceType) {
        data.priceC = parseFloat(data.priceC);
        data.priceType = 'FIXED';
    }
    else if (data.priceC) {
        data.priceC = parseFloat(data.priceC);
    }
    else if (data.priceType) {
        data.priceType = 'NEGOTIABLE';
    }
    if (data.optionals) {
        _.each(data.optionals, function each(optional) {
            data[optional.name] = optional.id || optional.value;
        }, this);
    }
    if (includeImages && data.images && data.images.length) {
        data.images = _.map(data.images, function each(image) {
            return typeof image === 'string' ? image : image.id;
        }).join(',');
    }
    else {
        delete data.images;
    }
    delete data.securityKey;
    delete data.category;
    delete data.price;
    delete data.optionals;
    delete data.date;
    delete data.metadata;
    delete data.status;
    delete data.user;
    delete data.hasEmail;
    delete data.isFeed;
    delete data.slug;
    delete data.priceTypeData;
    delete data.additionalLocation;
    delete data.city;
    _.each(Object.keys(data), function each(key) {
        if (data[key] === undefined || data[key] === null || (typeof data[key] === 'string' && !data[key])) {
            delete data[key];
        }
    }, this);
    return data;
}

function remove(data, done) {
    var query = _.defaults({}, data, {
        token: (this.app.session.get('user') || {}).token,
        platform: this.app.session.get('platform'),
        deleteType: 'organic',
        reason: '4',
        comment: ''
    });

    helpers.dataAdapter.post(this.app.req, '/items/' + this.get('id') + '/delete', {
        query: query
    }, callback.bind(this));

    function callback(err) {
        this.set('status', 'closed');
        this.errfcb(done)(err);
    }
}

function rebump(done) {
      helpers.dataAdapter.post(this.app.req, '/items/' + this.get('id') + '/rebump', {
        query: {
            token: (this.app.session.get('user') || {}).token,
            postingSession: this.get('postingSession'),
            platform: this.app.session.get('platform')
        },
        data: {
            location: this.app.session.get('location').url
        }
    }, callback.bind(this));

    function callback() {
        this.callback(done)();
    }
}

function republish(done) {
      helpers.dataAdapter.post(this.app.req, '/item/' + this.get('id') + '/republish', {
        query: {
            securityKey: this.get('sk'),
            platform: this.app.session.get('platform')
        },
        data: {
            location: this.app.session.get('location').url
        }
    }, callback.bind(this));

    function callback(err, response) {
        this.errfcb(done)(err);
    }
}

function stillAvailable(done) {
    helpers.dataAdapter.post(this.app.req, '/mtd/items/' + this.get('id') + '/stillAvailable', {
        data: {
            location: this.app.session.get('location').url
        }
    }, callback.bind(this));

    function callback(err, response) {
        this.errfcb(done)(err);
    }
}
