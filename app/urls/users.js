'use strict';

module.exports = {
    'users#register': {
        url: 'register'
    },
    'users#registersuccess': {
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
    'users#userprofile': {
        urls: [
            'users/:username',
            '/^\/users\/.*/'
        ]
    },
    'users#myolx': {
        url: 'myolx'
    },
    'users#configuration': {
        url: 'myolx/configuration'
    },
    'users#createuserprofile': {
        url: 'myolx/createuserprofile'
    },
    'users#edituserprofile': {
        url: 'myolx/edituserprofile'
    },
    'users#editpersonalinfo': {
        url: 'myolx/editpersonalinfo'
    },
    'users#emailsnotification': {
        url: 'myolx/emailsnotification'
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
    'users#deleteitem': {
        url: 'myolx/deleteitem'
    }
};
