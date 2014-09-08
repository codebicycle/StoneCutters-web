var path = require('path');

require('blanket')({
    pattern: path.join(__dirname, '..', 'server')
});
