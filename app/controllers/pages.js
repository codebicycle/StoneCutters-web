'use strict';

var helpers = require('../helpers');
var config = require('../config');

module.exports = {
    terms: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            helpers.analytics.reset();

            callback(null, {
                analytics: helpers.analytics.generateURL(this.app.session.get())
            });
        }
    },
    help: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            // Delete this function and your references
            function itemsHelpSimulator() {
                return [{
                    name: 'New to OLX',
                    code: 'new_to_olx',
                    questions: [
                        {
                            question: 'What is OLX?',
                            response: 'OLX is the world\'s online marketplace for local buying, and selling, exchanging and communicating to other users.'
                        },
                        {
                            question: 'Is OLX FREE?',
                            response: 'Yes, OLX is 100% free!'
                        },
                        {
                            question: 'Do I have to register to use OLX?',
                            response: ('No. You can browse the site and post items without registration. Registration at OLX is FREE and the process is very simple:<br /><ol><li>Click on "Register" button and you will be asked to provide your basic contact information.</li><li>You are now registered at OLX!</li><li>OLX will send a confirmation message with your login and password information to your email address.</li></ol><br />Once you have an OLX account, you can manage your postings and personal information even easier through the \'My OLX\' section of the site.')
                        },
                        {
                            question: 'How do I find an item at OLX?',
                            response: 'You can Browse listings when you\'re not sure what you\'re looking for, or when you simply want to explore the range of items on OLX or in a particular category. Click on Categories and Subcategories and if you find an item you\'re interested in, just click on the item title. <br />You can also Search for items when you are looking for a specific item that you can describe using a few words. In this case, simply go to the search box, enter a few words describing what you are looking for, select a category and click the "Search" magnifying glass. A search results page of OLX listings will be displayed. Review your search results pages and if you see something you\'re interested in, just click on the item title.'
                        },
                        {
                            question: 'What is My OLX?',
                            response: 'With My OLX, you can track and manage your OLX ads, personal account, information, messages, favorites and more from one single, secure location.'
                        }
                    ]
                },
                {
                    name: 'Postings',
                    code: 'postings',
                    questions: [
                        {
                            question: 'How do I post an item at OLX?',
                            response: '- Click on the "Post a Free Classified Ad" button.<br><br>- If you don\'t have an account and don\'t want to register yet, just choose a category, and you are ready to post your classified ad. You can also register for an OLX account by providing your basic contact information. You will then be asked to upload photos, provide an title as well as a description for your ad.<br><br>- Immediately after this very fast and simple registration process is complete you are ready to post.<br><br>- If you already have an OLX account, simply login and follow the process.<br><br>- Posting at OLX is FREE.</br>'
                        },
                        {
                            question: 'How do I upload a picture?',
                            response: 'In the posting form, below the Ad title field, you will find a button that will give you the option to attach one or more photo. If you click on the "Select Photos" button, a window will appear to allow you to select the files from your computer. Select the picture file that you want to upload and click "OK". This will upload the picture to your advert. To upload more pictures, click on the next "Browse" button. The picture that you place in the first location will be the main image for your ad and will appear next to your ad title in the category listings. OLX picture upload process is easy and you can upload up to 20 (Twenty) pictures per ad. The smaller the file size, the faster it will load. We suggest you upload pictures no larger than 200kb each. We have seen that ads with pictures are responded to much more than ads without pictures. Uploading pictures to OLX is FREE.</p>'
                        },
                        {
                            question: 'How do I edit a posting?',
                            response: 'If you have an OLX account, you can edit your own ads through the "Active Ads" option in the My OLX section of the site. Please go to the item and click the "Edit" button. Once you have made and approved the changes, they will take effect immediately. You can repeat this process any times you like. If you don\'t have an OLX account yet, you can also access the same features using the link enclosed in the confirmation email you receive each time you post an item on the site, and with the edit button in the success page at the end of the posting process.'
                        },
                        {
                            question: 'How do I change a picture?',
                            response: 'You can edit a picture by following the steps to edit an ad. Once you are on the editing page go to the Photos section and click “Remove this photo” to delete a photo, and click “Add another photo” to upload a new picture.'
                        },
                        {
                            question: 'How long will my posting appear on OLX?',
                            response: 'Currently postings on OLX do not expire. It is your responsibility to remove your ad once you no longer need to advertise it.'
                        },
                        {
                            question: 'How do I remove my posting?',
                            response: 'If you have an OLX account and your item sells or you simply decide to remove it, you can end your ad in the \'Active Ads\' option in the My OLX section of the site. Click on the box to the left of the ad(s) you wish to delete, and then click on the ‘Delete selected ads’ button. If you don\'t have an OLX account yet, you can also access the same features using the link enclosed in the confirmation email you receive upon posting an item on the site.'
                        },
                        {
                            question: 'How do I save a posting to recall it later?',
                            response: 'Go to the listing you are interested in and click the "Add to Favorites" button to keep track of it.'
                        },
                        {
                            question: 'How do I share an ad on Facebook/Twitter/etc?',
                            response: 'Once you have the ad open, look below the ad text. There is a column called “Share this ad”. Below that, is a list of places you can click on to share your ad; Facebook, Twitter, and email among many others.'
                        },
                        {
                            question: 'Can I include personal contact information in my postings?',
                            response: 'Yes. You can include personal contact information in your postings.'
                        }
                    ]
                }];
            }
            // Delete this callback
            callback(null, {
                items: itemsHelpSimulator()
            });

            /*
                TODO [MOB-4717] Help.
            var spec = {
                items: {
                    collection: 'Help',
                    params: params
                }
            };
            */
            /** don't read from cache, because rendr caching expects an array response
            with ids, and smaug returns an object with 'data' and 'metadata' */
            /*
            app.fetch(spec, {
                'readFromCache': false
            }, function afterFetch(err, result) {
                result.items = result.items.models[0].get('data');
                result.platform = app.session.get('platform');
                callback(err, result);
            });
            */
        }
    },
    interstitial: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            helpers.analytics.reset();
            this.app.session.persist({
                downloadApp: '1'
            }, {
                maxAge: this.app.session.get('downloadApp')
            });
            callback(null, {
                analytics: helpers.analytics.generateURL(this.app.session.get()),
                ref: params.ref
            });
        }
    },
    error: function(params, callback) {
        helpers.controllers.control.call(this, params, controller);

        function controller() {
            var err = this.app.session.get('error');

            if (typeof window === 'undefined') {
                this.app.req.res.status(404);
            }
            if (err) {
                this.app.session.clear('error');
            }
            helpers.analytics.reset();
            callback(null, {
                error: err,
                analytics: helpers.analytics.generateURL(this.app.session.get())
            });
        }

    }
};
