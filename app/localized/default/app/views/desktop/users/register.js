'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/register');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'users_register_view short-page',
    events: {
        'focus .text-field': 'clearInputs'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var params = this.options.params || {};
        var selectedLanguage = this.app.session.get('selectedLanguage').split('-')[0];
        var textError = {};
        if(selectedLanguage === 'en') {
            textError.title = 'Sorry for the inconvenience but it´s not possible to register right now.';
            textError.paragraph = 'We are working to fix it as soon as possible. Meanwhile you can post an ad for free or keep browsing on OLX. Thank you.';
        } else if(selectedLanguage === 'es') {
            textError.title = 'Disculpe los inconvenientes pero no es posible registrarse en este momento.';
            textError.paragraph = 'Estamos trabajando para arreglarlo lo antes posible. Mientras tanto puede publicar gratis un aviso o seguir navegando en OLX. Muchas gracias.';
        }

        return _.extend({}, data, {
            params: params,
            textError: textError
        });
    },
    clearInputs: function(event) {
        event.preventDefault();
        $('.wrapper.error').removeClass('error');
    }

});
