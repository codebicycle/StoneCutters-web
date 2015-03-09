'use strict';

module.exports = {
    'f.location_state': {
        type: 'SELECT'
    },
    'f.location_city': {
        type: 'SELECT'
    },
    neighborhood: {
        type: 'SELECT',
        options: {
            separator: ' OR '
        }
    },
    nbhzone: {
        type: 'SELECT'
    },
    directdistancedialing: {
        type: 'SELECT'
    },
    category: {
        type: 'SELECT'
    },
    parentCategory: {
        type: 'SELECT'
    },
    carbrand: {
        type: 'SELECT'
    },
    optionals: {
        type: 'SELECT'
    },
    carmodel: {
        type: 'SELECT'
    },
    furnished: {
        type: 'SELECT'
    },
    sellertype: {
        type: 'SELECT'
    },
    seller: {
        type: 'SELECT'
    },
    imageGallery: {
        type: 'SELECT'
    },
    ethnicgroup: {
        type: 'SELECT'
    },
    bodytype: {
        type: 'SELECT'
    },
    bedrooms: {
        type: 'RANGE'
    },
    kilometers: {
        type: 'RANGE'
    },
    year: {
        type: 'RANGE'
    },
    excludecity: {
        type: 'SELECT'
    },
    search: {
        type: 'SELECT'
    },
    brokerFree: {
        type: 'SELECT'
    },
    petsAllowed: {
        type: 'SELECT'
    },
    carType: {
        type: 'SELECT'
    },
    keywords: {
        type: 'SELECT'
    },
    hasimage: {
        type: 'BOOLEAN'
    },
    jobStatus: {
        type: 'SELECT'
    },
    age: {
        type: 'RANGE'
    },
    bathrooms: {
        type: 'RANGE'
    },
    latitude: {
        type: 'RANGE'
    },
    longitude: {
        type: 'RANGE'
    },
    'f.itemLat': {
        type: 'RANGE'
    },
    'f.itemLong': {
        type: 'RANGE'
    },
    pricerange: {
        type: 'RANGE'
    },
    surface: {
        type: 'RANGE'
    },
    featured: {
        type: 'SELECT'
    },
    adtype: {
        type: 'SELECT'
    },
    distance: {
        type: 'SELECT'
    },
    condition: {
        type: 'SELECT'
    },
    flo: {
        type: 'SELECT',
        options: {
            separator: '-'
        }
    },
    slo: {
        type: 'SELECT',
        options: {
            separator: '-'
        }
    },
    sort: {
        type: 'SELECT'
    }
};
