'use strict';

var Base = require('../../localized/common/app/bases/view');
var _ = require('underscore');

module.exports = function(nunjucks) {
    function getProperty(key, context) {
        return context[key] || context.ctx[key];
    }

    return {
        View: function() {
            this.tags = ['view'];
            this.parse = function(parser, nodes, lexer) {
                var tok = parser.nextToken();
                var args = parser.parseSignature(null,true);
                
                parser.advanceAfterBlockEnd(tok.value);
                return new nodes.CallExtension(this, 'run', args);
            };
            this.run = function(context, id, subId) {
                var app = getProperty('_app', context);
                var parentView = getProperty('_view', context);
                var options = {
                    context: context,
                    subId: subId
                };
                var ViewClass;
                var view;

                if (app) {
                    options.app = app;
                    id = app.modelUtils.underscorize(id);
                }
                else{
                    throw new Error('An App instance is required when rendering a view, it could not be extracted from the options.');
                }
                if (parentView) {
                    options.parentView = parentView;
                }
                ViewClass = Base.getView(app, id, app.options.entryPath);
                view = new ViewClass(options);
                return view.getHtml();
            };
        }
    };
};
