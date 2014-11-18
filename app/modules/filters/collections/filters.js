'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var Filter = require('../models/filter');
var utils = require('../../../../shared/utils');
var config = require('../config');
var transformers = require('../transformers');

var filters = utils.get(config, ['filters'], {});
var defaultOrderByName = Object.keys(filters);
var defaultOrderByType = ['BOOLEAN', 'SELECT', 'RANGE'];
var regexpReplace = /-([a-zA-Z0-9]+)_([a-zA-Z0-9_\.]*)/g;
var regexpFind = /-[a-zA-Z0-9]+_[a-zA-Z0-9_\.]*/g;
var regexpSort = /([a-zA-Z0-9_]*)(desc)/g;
var booleans = ['true', 'false'];
var Base;

Backbone.noConflict();
Base = Backbone.Collection;

function initialize(models, options) {
    this.options = options || {};
    this.app = this.options.app;
    if (this.options.path) {
        this.load(this.options.path);
    }
}

function isActive(name) {
    var filter = this.get(name);
    var exists = !!filter;

    if (exists) {
        exists = filter.has('current');
    }
    return exists;
}

function has(name, value) {
    var filter = this.get(name);
    var exists = !!filter;

    if (exists && !_.isUndefined(value)) {
        switch (filter.get('type')) {
            case 'SELECT':
                exists = _.contains(filter.get('current'), value);
                break;
            case 'RANGE':
                exists = (filter.has('current') && filter.get('current')[value]);
                break;
            case 'BOOLEAN':
                exists = (filter.get('current') === value);
                break;
        }
    }
    return exists;
}

function addAll(filters, options) {
    _.each(filters, function(filter, i) {
        _add.call(this, filter, options);
    }, this);
    return this;
}

function addSelect(_filter) {
    var filter = this.get(_filter.name);

    if (filter) {
        if (!filter.has('current')) {
            filter.set({
                current: []
            }, {
                merge: true
            });
        }
        filter.get('current').push(_filter.value);
        return _add.call(this, filter);
    }
    filter = _.clone(_filter);
    filter.current = [filter.value];
    delete filter.value;
    return _add.call(this, filter);
}

function add(filter, options) {
    if (filter instanceof Filter) {
        return _add.call(this, filter, options);
    }
    if (filter.type === 'SELECT') {
        if (this.has(filter.name, filter.value)) {
            return;
        }
        return addSelect.call(this, filter);
    }
    filter = _.clone(filter);
    filter.current = filter.value;
    delete filter.value;
    return _add.call(this, filter);
}

function _add(filter, options) {

    if (!(filter instanceof Filter)) {
        filter = new Filter(filter, {
            app: this.app
        });
    }
    return Base.prototype.add.call(this, filter, options || {
        merge: true
    });
}

function checkTransform(filter) {
    var transformer = transformers[filter.get('name')];

    if (transformer) {
        filter = transformer.call(this, filter, {
            app: this.app
        });
    }
    return filter;
}

function checkDescription(filter) {
    var transformer = transformers[filter.get('name')];

    if (transformer) {
        filter = transformer.call(this, filter, {
            app: this.app
        });
    }
    return filter;
}

function removeAll(filters, options) {
    _.each(filters, function(filter, i) {
        _remove.call(this, filter, options);
    }, this);
    return this;
}

function removeSelect(_filter) {
    var filter;
    var value;

    if (this.has(_filter.name, _filter.value)) {
        filter = this.get(_filter.name);

        if (_filter.value) {
            value = _.filter(filter.get('current'), function(value) {
                return value !== _filter.value;
            });
        }
        else {
            value = [];
        }

        if (!value.length) {
            return _remove.call(this, filter);
        }
        else {
            return _add.call(this, {
                name: filter.get('name'),
                current: value
            });
        }
    }
}

function remove(filter, options) {
    if (_.isArray(filter)) {
        return removeAll.call(this, filter, options);
    }
    if (filter instanceof Filter) {
        return _remove.call(this, filter, options);
    }
    if (filter.type === 'SELECT') {
        return removeSelect.call(this, filter);
    }
    return _remove.call(this, filter);
}

function _remove(filter, options) {
    if (!(filter instanceof Filter)) {
        filter = new Filter(filter, {
            app: this.app
        });
    }
    return Base.prototype.remove.call(this, filter, options);
}

function parseValue(value, type) {
    switch (type) {
        case 'SELECT':
            return value.split('_');
        case 'RANGE':
            return _.object(['from', 'to'], value.split('_'));
        case 'BOOLEAN':
            return value;
    }
}

function parseFilter(filter) {
    var keyValue = filter.replace(regexpReplace, '$1#$2');

    keyValue = keyValue.split('#');
    filter = {
        name: keyValue[0]
    };
    filter.type = filters[filter.name];
    filter.current = parseValue(keyValue[1], filter.type);
    return filter;
}

function load(url) {
    var listFilters = (url.match(regexpFind) || []);

    _.each(listFilters, function parseFilters(filter, i) {
        filter = parseFilter(filter);
        this.add(new Filter(filter, {
            app: this.app
        }));
    }, this);
    return this;
}

function format() {
    var url = [];
    var value;
    var name;
    var sort;

    this.each(function(filter) {
        name = filter.get('name');
        if (!filter.has('current') || name === 'sort') {
            return;
        }
        url.push('-');
        url.push(name);
        url.push('_');
        value = filter.get('current');
        switch (filter.get('type')) {
            case 'RANGE':
                url.push(value.from);
                url.push('_');
                url.push(value.to);
                break;
            case 'SELECT':
                url.push(value.join('_'));
                break;
            case 'BOOLEAN':
                url.push(value);
                break;
        }
    });
    if (this.has('sort')) {
        sort = this.get('sort');
        url.push('-sort_');
        url.push(sort.get('current').join(''));
    }
    return url.join('');
}

function smaugize() {
    var params = {};
    var sort;
    var name;
    var value;

    if (!this.length) {
        return params;
    }
    this.each(function(filter) {
        name = filter.get('name');
        value = filter.get('current');

        if (value === 'false' || name === 'sort') {
            return;
        }
        name = 'f.' + name;
        switch (filter.get('type')) {
            case 'SELECT':
                params[name] = value.join('OR');
                break;
            case 'RANGE':
                params[name] = [value.from, 'TO', value.to].join('');
                break;
            case 'BOOLEAN':
                params[name] = value;
                break;
        }
    });
    if (this.has('sort')) {
        sort = this.get('sort');
        sort = sort.get('current').join('').replace(regexpSort, '$1#$2').split('#');
        params['s.' + sort[0]] = sort[1] || 'asc';
    }
    return params;
}

function checkComparator(options) {
    options = options || {};
    if (options.sortType) {
        switch(options.sortType) {
            case 'type':
                this.order = options.order || this.order || defaultOrderByType;
                this.comparator = comparatorByType;
                break;
            default:
                this.order = options.order || this.order || defaultOrderByName;
                this.comparator = comparatorByName;
                break;
        }
    }
}

function toJSON(options) {
    checkComparator.call(this, options);
    return this.sort().map(function(model) {
        return model.toJSON(options);
    });
}

function getIndex(name, defaultOrder) {
    var indexOf = this.order.indexOf(name);

    if (!~indexOf) {
        return defaultOrder.indexOf(name);
    }
    return indexOf - 100;
}

function comparator(filterA, filterB, property, defaultOrder) {
    var indexOfA = getIndex.call(this, filterA.get(property), defaultOrder);
    var indexOfB = getIndex.call(this, filterB.get(property), defaultOrder);

    if (indexOfA > indexOfB) {
        return 1;
    }
    else if (indexOfB > indexOfA) {
        return -1;
    }
    return 0;
}

function comparatorByName(filterA, filterB) {
    return comparator.call(this, filterA, filterB, 'name', defaultOrderByName);
}

function comparatorByType(filterA, filterB) {
    return comparator.call(this, filterA, filterB, 'type', defaultOrderByType);
}

module.exports = Base.extend({
    model: Filter,
    order: defaultOrderByName,
    comparator: comparatorByName,
    initialize: initialize,
    isActive: isActive,
    has: has,
    add: add,
    addAll: addAll,
    remove: remove,
    removeAll: removeAll,
    load: load,
    format: format,
    smaugize: smaugize,
    toJSON: toJSON
});

module.exports.id = 'Filters';
