var log4js = require('log4js');

log4js.configure({
    appenders: {
        app: {type: 'file', filename: 'log/app.log', pattern: '-yyyy-MM-dd.log', alwaysIncludePattern: true}
    },
    categories: {
        default: {appenders: ['app'], level: 'info'},
    }
});

module.exports = {
    log4js
}