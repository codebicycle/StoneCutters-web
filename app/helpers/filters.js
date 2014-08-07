'use strict';

var _ = require('underscore');
var config = require('../../shared/config');

module.exports = (function() {

	function prepare(metadata) {

		var filters = metadata.filters;
		var obj = {};
		_.each(filters, function each(filter) {
			obj[filter.name] = filter;
		});
		metadata.filters = obj;

	}

    return {
		prepare: prepare
	};
})();