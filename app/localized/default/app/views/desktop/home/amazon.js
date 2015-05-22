'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('home/amazon');

module.exports = Base.extend({
    tagName: 'main',
    id: 'home_amazon',
    events: {
        'click .topic-list-handler': 'onTopicListHandlerClick'
    },
    onTopicListHandlerClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $source = this.$(event.target);
        var $list = $source.siblings('.topic-items-wrapper').find('.topic-items-list');
        var offset = parseInt($list.attr('data-offset'));

        if ($source.hasClass('left') && offset < 14) {
            offset += 1;
            if (offset === 14) {
                $source.hide();
            }
            else if (offset === 1) {
                $source.siblings('.topic-list-handler.right').show();
            }
            $list.attr('data-offset', offset);
            $list.css('margin-left', offset * -165);
        }
        else if ($source.hasClass('right') && offset > 0) {
            offset -= 1;
            if (offset === 0) {
                $source.hide();
            }
            else if (offset === 13) {
                $source.siblings('.topic-list-handler.left').show();
            }
            $list.attr('data-offset', offset);
            $list.css('margin-left', offset * -165);
        }
    }
});
