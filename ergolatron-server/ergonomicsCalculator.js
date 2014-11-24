var common = require('./common');
var moment = require('moment');
var client = require('./db.client.local');
var smsGlobalClient = require('./smsglobal.client');

var ErgonomicsCalculator = function() {
    var self = this;

    self.maxSittingHeight = 70;
    self.maxSaddleHeight = 85;
    self.lastSms = null;

    self.calculateStats = function(tableId) {
        var heightEvents = client.getTableEventsForTable(tableId);
        var sittingEventCount = heightEvents.filter(function(event) {
            return event.height < self.maxSittingHeight;
        }).size();
        var sittingMinutes = (sittingEventCount * 5.0) / 60;

        var saddleEventCount = heightEvents.filter(function(event) {
            return event.height > self.maxSittingHeight &&
                   event.height <= self.maxSaddleHeight;
        }).size();
        var saddleMinutes = (saddleEventCount * 5.0) / 60;

        var standingEventCount = heightEvents.filter(function(event) {
            return event.height > self.maxSaddleHeight;
        }).size();
        var standingMinutes = (standingEventCount * 5.0) / 60;

        return {
            sittingMinutes: sittingMinutes,
            saddleMinutes: saddleMinutes,
            standingMinutes: standingMinutes
        };
    };

    self.checkForAlerts = function(tableId, res) {
        if (self.lastSms != null) {
            var minutesSinceLastSms = moment.utc(moment().diff(self.lastSms)).minutes();
            console.log(minutesSinceLastSms);
            if (minutesSinceLastSms < 5) {
                console.log('wont send message');
                return;
            }
        }

        var table = client.getTable(tableId);
        if (table.alerts === null) {
            return;
        }
        if (table.stats.sittingMinutes < table.alerts.sittingMax) {
            smsGlobalClient.sendSms(table.phoneNumber, 'Stand up, please.');
            self.lastSms = moment();
        }
    };
};

var ergonomicsCalculator = new ErgonomicsCalculator();
module.exports = ergonomicsCalculator;