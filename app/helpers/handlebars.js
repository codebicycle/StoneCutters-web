'use strict';

module.exports = function(Handlebars) {
    return {
        layout: function(template, path, options) {
            this.layout = template + path;
            return options.fn(this);
        },
        getFieldTemplate: function(template, options) {
            this.fieldPath = template + "/fields/" + this.fieldType;
            return options.fn(this);
        },
        html: function(string, options) {
            return new Handlebars.SafeString(string);
        }
    };
};
