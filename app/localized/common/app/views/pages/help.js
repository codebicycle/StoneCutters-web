'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../../../../helpers');

module.exports = Base.extend({
    className: 'pages_help_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var brand = data.dictionary["biderrorheader.My OLX"];
        var emails = {
            support: 'support@olx.com'
        };
        var topics = [
            {
                title: data.dictionary["help.NewToBrand"],
                questions: [
                    {
                        question: data.dictionary["help.WhatIsBrand"],
                        answer: data.dictionary["help.WhatIsBrand_content"]
                    },
                    {
                        question: data.dictionary["help.IsBrandFree"],
                        answer: data.dictionary["help.IsBrandFree_content"]
                    },
                    {
                        question: data.dictionary["help.DoIHaveToRegisterToUseBrand"],
                        answer: data.dictionary["help.DoIHaveToRegisterToUseBrand_content"].replace('<<MY_CLASSIFIEDS>>', brand)
                    },
                    {
                        question: data.dictionary["help.HowDoIFindAnItemAtBrand"],
                        answer: data.dictionary["help.HowDoIFindAnItemAtBrand_content"]
                    },
                    {
                        question: data.dictionary["help.WhatIsMyClassifieds"].replace('<<MY_CLASSIFIEDS>>', brand),
                        answer: data.dictionary["help.WhatIsMyClassifieds_content"].replace('<<MY_CLASSIFIEDS>>', brand)
                    }
                ]
            },
            {
                title: data.dictionary["itemslisting.Classifieds"],
                questions: [
                    {
                        question: data.dictionary["help.HowDoIPostAnItemAtBrand"],
                        answer: data.dictionary["help.HowDoIPostAnItemAtBrand_content"]
                    },
                    {
                        question: data.dictionary["help.HowDoIUploadAPicture"],
                        answer: data.dictionary["help.HowDoIUploadAPicture_content"].replace('<<NUMBER>>', '8').replace('<<NUMBER_IN_WORDS>>', 'ocho').replace('<<WEIGHT>>', '20480') // Word 'ocho' must be translated
                    },
                    {
                        question: data.dictionary["help.HowDoIEditAPosting"],
                        answer: data.dictionary["help.HowDoIEditAPosting_contentNew"]
                    },
                    {
                        question: data.dictionary["help.HowDoIChangeAPicture"],
                        answer: data.dictionary["help.HowDoIChangeAPicture_content"]
                    },
                    {
                        question: data.dictionary["help.HowLongWillMyPostingAppearOnBrand"],
                        answer: data.dictionary["help.HowLongWillMyPostingAppearOnBrand_contentNew"].replace('<<NUMBER>>', '180')
                    },
                    {
                        question: data.dictionary["help.HowDoIRemoveMyPosting"],
                        answer: data.dictionary["help.HowDoIRemoveMyPosting_content"].replace('<<MY_CLASSIFIEDS>>', brand)
                    },
                    {
                        question: data.dictionary["help.HowDoISaveAPostingToRecallItLater"],
                        answer: data.dictionary["help.HowDoISaveAPostingToRecallItLater_content"]
                    },
                    {
                        question: data.dictionary["help.HowDoIShareAnAdOnFacebookTwitterEtc"],
                        answer: data.dictionary["help.HowDoIShareAnAdOnFacebookTwitterEtc_content"]
                    },
                    {
                        question: data.dictionary["help.CanIIncludePersonalContactInformationInMyPostings"],
                        answer: data.dictionary["help.CanIIncludePersonalContactInformationInMyPostings_content"]
                    }
                ]
            },
            {
                title: data.dictionary["help.GeneralQuestions"],
                questions: [
                    {
                        question: data.dictionary["help.WhatAreClassifieds"],
                        answer: data.dictionary["help.WhatAreClassifieds_content"]
                    },
                    {
                        question: data.dictionary["help.HowDoIChangeMyRegistrationDetails"],
                        answer: data.dictionary["help.HowDoIChangeMyRegistrationDetails_content"].replace('<<MY_CLASSIFIEDS>>', brand)
                    },
                    {
                        question: data.dictionary["help.HowDoICheckMyMessages"],
                        answer: data.dictionary["help.HowDoICheckMyMessages_content"].replace('<<MY_CLASSIFIEDS>>', brand)
                    },
                    {
                        question: data.dictionary["help.HowDoIAnswerAMessageSentToMyAd"],
                        answer: data.dictionary["help.HowDoIAnswerAMessageSentToMyAd_content"].replace('<<MY_CLASSIFIEDS>>', brand)
                    },
                    {
                        question: data.dictionary["help.AsABuyerHowDoIContactASeller"],
                        answer: data.dictionary["help.AsABuyerHowDoIContactASeller_content"]
                    },
                    {
                        question: data.dictionary["help.HowCanICreateAPartnershipWithBrand"],
                        answer: data.dictionary["partnership.IfYouHaveLotsOfListingsToSubmitUseAFeed"]
                    }
                ]
            },
            {
                title: data.dictionary["help.MoreGuidelines"],
                questions: [
                    {
                        question: data.dictionary["help.WhatAreThingsThatPotentiallyFraudulentSellersDo"],
                        answer: data.dictionary["help.WhatAreThingsThatPotentiallyFraudulentSellersDo_content"]
                    },
                    {
                        question: data.dictionary["help.WhatShouldIDoIfISuspectAFraudulentSeller"],
                        answer: data.dictionary["help.WhatShouldIDoIfISuspectAFraudulentSeller_content"].replace('<<CONTACTLINK>>', '<a href="mailto:' + emails.support + '">').replace('<</CONTACTLINK>>', '</a>')
                    },
                    {
                        question: data.dictionary["help.HowCanIAvoidAFraud"],
                        answer: data.dictionary["help.HowCanIAvoidAFraud_content"].replace('<<CONTACTLINK>>', '<a href="mailto:' + emails.support + '">').replace('<</CONTACTLINK>>', '</a>')
                    },
                    {
                        question: data.dictionary["help.WhatAreThingsThatPotentiallyFraudulentBuyersDo"],
                        answer: data.dictionary["help.WhatAreThingsThatPotentiallyFraudulentBuyersDo_content"]
                    },
                    {
                        question: data.dictionary["help.WhatShouldIDoIfISuspectAFraudulentBuyer"],
                        answer: data.dictionary["help.WhatShouldIDoIfISuspectAFraudulentBuyer_content"].replace('<<CONTACTLINK>>', '<a href="mailto:' + emails.support + '">').replace('<</CONTACTLINK>>', '</a>')
                    },
                    {
                        question: data.dictionary["help.WhatKindOfPostingsAreForbiddenNotAllowedOnBrand"],
                        answer: data.dictionary["help.WhatKindOfPostingsAreForbiddenNotAllowedOnBrand_content"]
                    }
                ]
            }
        ];
        
        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data),
            topics: topics
        });
    }
});

module.exports.id = 'pages/help';
