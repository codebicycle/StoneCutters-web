'use strict';

module.exports = {
    enabled: true,
    'default': {
        queryCategories: [16, 185, 190, 821],
        options: {
            pubId: 'ca-olx',
            channel: 'OLX_[countrycode]'
        }
    },
    MediumRectangle: {
        params: {
            media: 'flash, image',
            width: 300,
            height: 250
        }
    },
    WideSkyscraper: {
        params: {
            media: 'flash, image',
            width: 160,
            height: 600
        }
    },
    TextMobile: {
        params: {
            number: 3,
            media: 'text',
            width: 300,
            height: 50
        }
    },
    TextTop: {
        params: {
            number: 3,
            media: 'text',
            width: 728,
            height: 90
        }
    },
    TextBottom: {
        params: {
            number: 5,
            media: 'text',
            width: 728,
            height: 90
        }
    },
    clientsIds: ['us', 'es', 'za']
};
