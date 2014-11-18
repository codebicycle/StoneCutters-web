'use strict';

module.exports = {
    page: {
        name: '[page]',
        parse: function (url, page, options) {
            if (page > 1) {
                url = url.replace(this.name, '-p-' + page);
            }
            return url.replace(this.name, '');
        }
    },
    gallery: {
        name: '[gallery]',
        parse: function (url, page, options) {
            if (options.gallery) {
                url = url.replace(this.name, options.gallery);
            }
            return url.replace(this.name, '');
        }
    },
    filters: {
        name: '[filters]',
        parse: function (url, page, options) {
            if (options.filters) {
                url = url.replace(this.name, '/' + options.filters.format());
            }
            return url.replace(this.name, '');
        }
    }
};
