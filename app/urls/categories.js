'use strict';

module.exports = {
    'categories#showig': {
        urls: [
            ':title-cat-:catId([0-9]+)-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            ':title-cat-:catId([0-9]+)-p-:page([0-9]+)-ig',
            '-cat-:catId([0-9]+)-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            '-cat-:catId([0-9]+)-p-:page([0-9]+)-ig',
            'cat-:catId([0-9]+)-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'cat-:catId([0-9]+)-p-:page([0-9]+)-ig',
            ':title-cat-:catId([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            ':title-cat-:catId([0-9]+)-ig',
            '-cat-:catId([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            '-cat-:catId([0-9]+)-ig',
            'cat-:catId([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'cat-:catId([0-9]+)-ig',
            'nf/:title-cat-:catId([0-9]+)-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/:title-cat-:catId([0-9]+)-p-:page([0-9]+)-ig',
            'nf/-cat-:catId([0-9]+)-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/-cat-:catId([0-9]+)-p-:page([0-9]+)-ig',
            'nf/cat-:catId([0-9]+)-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/cat-:catId([0-9]+)-p-:page([0-9]+)-ig',
            'nf/:title-cat-:catId([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/:title-cat-:catId([0-9]+)-ig',
            'nf/-cat-:catId([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/-cat-:catId([0-9]+)-ig',
            'nf/cat-:catId([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/cat-:catId([0-9]+)-ig'
        ]
    },
    'categories#show': {
        urls: [
            ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            ':title-cat-:catId([0-9]+)-p-:page([0-9]+)',
            '-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            '-cat-:catId([0-9]+)-p-:page([0-9]+)',
            'cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'cat-:catId([0-9]+)-p-:page([0-9]+)',
            ':title-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            ':title-cat-:catId([0-9]+)',
            '-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            '-cat-:catId([0-9]+)',
            'cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'cat-:catId([0-9]+)',
            'nf/:title-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/:title-cat-:catId([0-9]+)-p-:page([0-9]+)',
            'nf/-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/-cat-:catId([0-9]+)-p-:page([0-9]+)',
            'nf/cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/cat-:catId([0-9]+)-p-:page([0-9]+)',
            'nf/:title-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/:title-cat-:catId([0-9]+)',
            'nf/-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/-cat-:catId([0-9]+)',
            'nf/cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/cat-:catId([0-9]+)'
        ]
    }
};
