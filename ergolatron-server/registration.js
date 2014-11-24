var client = require('./db.client.local');
var common = require('./common');

var Registration = function() {
    var self = this;

    self.registerNewTable = function(newTableDefinition, res) {
        var tableId = newTableDefinition.tableId;
        if (typeof tableId === 'undefined') {
            res.json(400, { error: 'tableId not defined' });
        }
        if (client.isTableRegistered(tableId)) {
            var message = 'table with id {0} already registered'.format(tableId);
            console.log(message);
            res.json(400, { error: message });
            return;
        }

        client.insertNewTable(newTableDefinition);
        console.log('registered table with id {0}'.format(tableId));
        res.send(200);
    };
};

var registration = new Registration();
module.exports = registration;