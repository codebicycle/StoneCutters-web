'use strict';

module.exports = {
    controllers: require('./controllers'),
    marketing: require('./marketing'),
    common: require('./common'),
    dataAdapter: require('./dataAdapter'),
    hijri: require('./hijri'),
    numbers: require('./numbers'),
    features: require('./features'),
    timeAgo: function(itemDate) {
        var current = new Date();
        var currentMonth = current.getMonth() + 1;
        var formatDate;
        var hour = (itemDate.hour < 10 ? '0' : '') + itemDate.hour;
        var minute = (itemDate.minute < 10 ? '0' : '') + itemDate.minute;
        var monthArr = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
        var diffDays = current.getDate() - itemDate.day;

        if (current.getFullYear() == itemDate.year && currentMonth == itemDate.month && diffDays === 0){
            formatDate = {
                hour: hour + ':' + minute, 
                dictionary: 'messages_date_format.Today'
            };
        }
        else if (current.getFullYear() == itemDate.year && currentMonth == itemDate.month && diffDays === 1 ) {
            formatDate = {
                hour: hour + ':' + minute, 
                dictionary: 'messages_date_format.Yesterday'
            };
        }
        else{
            formatDate = {
                day: itemDate.day,
                dictionary: 'messages_date_format.1' + monthArr[itemDate.month]
            };
        }
        return formatDate;
    }
};
