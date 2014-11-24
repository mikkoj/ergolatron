var http = require('http');
var querystring = require('querystring');

var smsGlobal = {
    user: 'asdf',
    password: 'asdf',
    from: 'Ergolatron'
};

var SmsGlobalClient = function () {
    var self = this;

    self.sendSms = function (smsNumber, text) {
        console.log('Sending SMS #' + smsNumber + ' ' + JSON.stringify(text) + '...');

        var options = {
            hostname: 'www.smsglobal.com',
            path: '/http-api.php?' + querystring.stringify({
                action: 'sendsms',
                user: smsGlobal.user,
                password: smsGlobal.password,
                from: smsGlobal.from,
                to: smsNumber.toString(),
                text: text
            })
        };

        var req = http.get(options, function (res) {
            console.log('SMS #' + smsNumber + ' ' + JSON.stringify(text) + ' sent.');
            clearTimeout(abortTimeout);
            req.abort()
        });

        req.on('error', function (err) {
            console.log('Sending SMS #' + smsNumber + ' ' + JSON.stringify(text) + ' failed.');
            console.log('Sending SMS #' + smsNumber + ' ' + JSON.stringify(text) + ' scheduled.');
            clearTimeout(abortTimeout);
            setTimeout(function () {
                self.sendSms(smsNumber, text);
            }, 1000)
        });

        var abortTimeout = setTimeout(function () {
            console.log('Sending SMS #' + smsNumber + ' ' + JSON.stringify(text) + ' timed out.');
            req.abort();
        }, 1000 * 20);
    }
};

var smsGlobalClient = new SmsGlobalClient();
module.exports = smsGlobalClient;