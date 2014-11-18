'use strict';

module.exports = {
    'categories#showig': {
        urls: [
            ':title-cat-:catId([0-9]+)-p-:page([0-9]+)-ig/?:filters?',
            '-cat-:catId([0-9]+)-p-:page([0-9]+)-ig/?:filters?',
            'cat-:catId([0-9]+)-p-:page([0-9]+)-ig/?:filters?',
            ':title-cat-:catId([0-9]+)-ig/?:filters?',
            '-cat-:catId([0-9]+)-ig/?:filters?',
            'cat-:catId([0-9]+)-ig/?:filters?',
            ':title-cat-:catId([0-9]+)-ig',
            '-cat-:catId([0-9]+)-ig',
            'cat-:catId([0-9]+)-ig'
        ]
    },
    'categories#show': {
        urls: [
            ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/?:filters?',
            '-cat-:catId([0-9]+)-p-:page([0-9]+)/?:filters?',
            'cat-:catId([0-9]+)-p-:page([0-9]+)/?:filters?',
            ':title-cat-:catId([0-9]+)/?:filters?',
            '-cat-:catId([0-9]+)/?:filters?',
            'cat-:catId([0-9]+)/?:filters?',
            ':title-cat-:catId([0-9]+)',
            '-cat-:catId([0-9]+)',
            'cat-:catId([0-9]+)'
        ]
    }
};
