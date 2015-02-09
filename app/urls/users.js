'use strict';

module.exports = {
    'users#register': {
        url: 'register'
    },
    'users#success': {
        url: 'register/success'
    },
    'users#login': {
        url: 'login'
    },
    'users#lostpassword': {
        url: 'lostpassword'
    },
    'users#logout': {
        url: 'logout'
    },
    'users#myolx': {
        url: 'myolx'
    },
    'users#myads': {
        urls: [
            'myolx/myadslisting-p-:page([0-9]+)',
            'myolx/myadslisting'
        ]
    },
    'users#favorites': {
        urls: [
            'myolx/favoritelisting-p-:page([0-9]+)',
            'myolx/favoritelisting'
        ]
    },
    'users#messages': {
        urls: [
            'myolx/myolxmessages-p-:page([0-9]+)',
            'myolx/myolxmessages'
        ]
    },
    'users#readmessages': {
        url: 'myolx/readmessages/:msgId'
    },
    'users#conversations': {
        urls: [
            'myolx/conversations-p-:page([0-9]+)',
            'myolx/conversations'
        ]
    },
    'users#conversation': {
        url: 'myolx/conversation/:threadId'
    },
    'users#deleteitem': {
        url: 'myolx/deleteitem'
    }
};
