'use strict';

module.exports = {
    'users#register': {
        url: 'register'
    },
    'users#login': {
        url: 'login'
    },
    'users#logout': {
        url: 'logout'
    },
    'users#myolx': {
        url: 'myolx'
    },
    'users#myads': {
        url: 'myolx/myadslisting'
    },
    'users#favorites': {
        url: 'myolx/favoritelisting'
    },
    'users#messages': {
        url: 'myolx/myolxmessages'
    },
    'users#readmessages': {
        url: 'myolx/readmessages/:msgId'
    }
};
