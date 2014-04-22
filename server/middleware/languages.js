'use strict';

module.exports = function(dataAdapter) {

    return function loader() {
        var asynquence = require('asynquence');
        var defaultDictionaries = {
            1: {
                'postAd_prefix': 'Make ',
                'postAd_strong': 'easy money',
                'postAd_suffix': ' by selling stuff you no longer need!',
                'postAd_button': 'Post an Ad',
                'newAds_prefix': 'New ads in ',
                'categories_title': 'Popular Categories'
            },
            10: {
                'postAd_prefix': 'Hace ',
                'postAd_strong': 'dinero facil',
                'postAd_suffix': ' vendiendo cosas que ya no necesites!',
                'postAd_button': 'Publicar un Anuncio',
                'newAds_prefix': 'Nuevos anuncios en ',
                'categories_title': 'Categorias Populares'
            }
        };

        return function middleware(req, res, next) {
            var app = req.rendrApp;
            var siteLocation = app.getSession('siteLocation');
            var languages;
            var selectedLanguage;
            var dictionary;

            function fetchLanguages(done) {
                dataAdapter.get(req, '/countries/' + siteLocation + '/languages', done.errfcb);
            }

            function parse(done, response, _languages) {
                languages = {
                    models: _languages,
                    _byId: {}
                };

                languages.models.forEach(function each(language) {
                    languages._byId[language.id] = language;
                    if (language.default) {
                        languages.default = language.id;
                    }
                });

                done();
            }

            function select(done) {
                var language = parseInt(req.param('language', 0));

                if (language && !languages._byId[language]) {
                    language = null;
                }
                selectedLanguage = language || app.getSession('selectedLanguage') || languages.default || languages.models[0].id;
                done();
            }

            function fetchDictionary(done) {

                // Waiting for SMAUG to implement this call so we need to use a fake callback function
                function callback(err, response, _dictionary) {
                    if (err || !Object.keys(_dictionary).length) {
                        _dictionary = defaultDictionaries[selectedLanguage] || defaultDictionaries[1];
                    }
                    dictionary = _dictionary;
                    done();
                }

                dataAdapter.get(req, '/dictionaries/' + selectedLanguage, callback);
            }

            function store(done) {
                app.updateSession({
                    languages: languages,
                    selectedLanguage: selectedLanguage,
                    dictionary: dictionary
                });
                done();
            }

            function fail(err) {
                res.send(400, err);
            }

            asynquence().or(fail)
                .then(fetchLanguages)
                .then(parse)
                .then(select)
                .then(fetchDictionary)
                .then(store)
                .val(next);
        };

    };

};
