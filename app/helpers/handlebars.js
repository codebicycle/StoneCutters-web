'use strict';

module.exports = function(Handlebars) {
    return {
        layout: function(template, path, options) {
            this.layout = template + path;
            return options.fn(this);
        },
        getFieldTemplate: function(field, options) {
            this.fieldPath = "fields/" + field.fieldType;
            return options.fn(this);
        },
        parseOptionalFieldName: function(fieldName, options) {
            if (fieldName.indexOf('opt.') !== 0) {
                return fieldName;
            }
            return fieldName.replace('.', '[') + ']';
        }
    };
};
