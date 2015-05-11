'use strict';

module.exports = {
    'items#delete': {
        url: 'myolx/deleteitem/{{itemId}}'
    },
    'items#success': {
        url: 'iid-{{itemId}}/reply/success'
    },
    'items#reply': {
        url: 'iid-{{itemId}}/reply'
    },
    'items#gallery': {
        url: ':title-iid-{{itemId}}/gallery'
    },
    'items#map': {
        url: ':title-iid-{{itemId}}/map'
    },
    'items#show': {
        urls: [
            ':title-iid-{{itemId}}',
            '-iid-{{itemId}}',
            'iid-{{itemId}}'
        ]
    },
    'items#favorite': {
        url: 'items/{{itemId}}/favorite/?:intent?'
    },
    'items#flag': {
        url: 'items/{{itemId}}/flag'
    },
    'items#flagsuccess': {
        url: 'items/{{itemId}}/flag/success'
    },
    'items#safetytips': {
        url: 'iid-{{itemId}}/?:intent?'
    }
};
