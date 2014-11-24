var _ = require('lodash');
var low = require('lowdb');
var db = low();

var tables = db('tables');
var tableHeightEvents = db('tableHeightEvents');


var DbClient = function () {
    var self = this;

    // create new item
    self.insertNewTable = function (tableDefinition) {
        tableDefinition.created = new Date().toJSON();
        tableDefinition.updated = new Date().toJSON();
        tableDefinition.currentHeight = -1;
        tableDefinition.stats = [];
        tableDefinition.alerts = null;
        tables.push(tableDefinition);
    };

    self.getAllTables = function() {
        return tables.value();
    };

    self.getTable = function(tableId) {
        return tables.find({ 'tableId' : tableId }).value();
    };

    self.isTableRegistered = function(tableId) {
        return tables.some({ 'tableId' : tableId }).value();
    };

    self.getTableEventsForTable = function(tableId) {
        var tableEvents = tableHeightEvents.filter({ 'tableId' : tableId });
        return tableEvents;
    };

    self.insertNewHeightEventForTable = function(event) {
        if (typeof event.timestamp === 'undefined') {
            event.timestamp = new Date().toJSON();
        }
        tableHeightEvents.push(event);
    };

    self.updateCurrentTableHeight = function(event) {
        var table = self.getTable(event.tableId);
        table.currentHeight = event.height;
        table.updated = new Date().toJSON();
        var index = tables.indexOf(table);
        if (~index) {
            tables[index] = table;
        }
    };

    self.updateTableStats = function(tableId, newStats) {
        var table = self.getTable(tableId);
        table.stats = newStats;
        var index = tables.indexOf(table);
        if (~index) {
            tables[index] = table;
        }
    };

    self.updateTableAlerts = function(tableId, newAlerts) {
        var table = self.getTable(tableId);
        table.alerts = newAlerts;
        var index = tables.indexOf(table);
        if (~index) {
            tables[index] = table;
        }
    };
};

var client = new DbClient();
module.exports = client;