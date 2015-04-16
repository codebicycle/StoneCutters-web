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
    'users#createpassword': {
        url: 'createpassword'
    },
    'users#autologin': {
        url: 'myolx/autologin'
    },
    'users#logout': {
        url: 'logout'
    },
    'users#myolx': {
        url: 'myolx'
    },
    /*'users#configuration': {
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
    },*/
    'users#editpersonalinfo': {
        url: 'myolx/configuration'
    },
    'users#myads': {
        urls: [
            'myolx/myadslisting-p-{{page}}',
            'myolx/myadslisting'
        ]
    },
    'users#favorites': {
        urls: [
            'myolx/favoritelisting-p-{{page}}',
            'myolx/favoritelisting'
        ]
    },
    'users#messages': {
        urls: [
            'myolx/myolxmessages-p-{{page}}',
            'myolx/myolxmessages'
        ]
    },
    'users#readmessages': {
        url: 'myolx/readmessages/:msgId'
    },
    'users#conversations': {
        urls: [
            'myolx/conversations-p-{{page}}',
            'myolx/conversations'
        ]
    },
    'users#report': {
        url: 'myolx/conversation/report/:hash'
    },
    'users#unsubscribe': {
        url: 'myolx/conversation/unsubscribe/:hash'
    },
    'users#conversationmail': {
        urls: [
            'myolx/conversation/mail-p-{{page}}',
            'myolx/conversation/mail'
        ]
    },
    'users#conversation': {
        urls: [
            'myolx/conversation/:threadId-p-{{page}}',
            'myolx/conversation/:threadId'
        ]
    }
};
