'use strict';

module.exports = {
    'landings#didyousell': {
        url: 'clm/did-you-sell'
    },
    'landings#mobilepromo': {
        url: 'mobilepromopage'
    },
    'landings#republish': {
        urls: [
            'landings/republish/{{itemId}}',
            'landings/republish'
        ]
    },
    'landings#available': {
<<<<<<< HEAD
        url: 'available'
    },
    'landings#asyncseller': {
        url: 'asyncseller'
    },
    'landings#asyncbuyer': {
        url: 'asyncbuyer'
=======
        url: 'available/{{itemId}}'
>>>>>>> develop
    }
};

