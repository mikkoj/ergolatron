var client = require('../db.client.local');
var registration = require('../registration');
var ergonomicsCalculator = require('../ergonomicsCalculator');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    var tables = client.getAllTables();
    res.send(tables);
});

router.post('/register', function (req, res) {
    var jsonInput = req.body;
    registration.registerNewTable(jsonInput, res);
});

router.post('/height', function (req, res) {
    var jsonInput = req.body;
    client.insertNewHeightEventForTable(jsonInput);
    client.updateCurrentTableHeight(jsonInput);

    var stats = ergonomicsCalculator.calculateStats(jsonInput.tableId);
    client.updateTableStats(jsonInput.tableId, stats);

    ergonomicsCalculator.checkForAlerts(jsonInput.tableId);

    res.send(200);
});

router.get('/:tableId', function (req, res) {
    var tableId = req.param("tableId");
    var table = client.getTable(tableId);
    res.send(table);
});

router.get('/:tableId/heights', function (req, res) {
    var tableId = req.param("tableId");
    var heightEvents = client.getTableEventsForTable(tableId).value();
    res.send(heightEvents);
});

router.post('/:tableId/alerts', function (req, res) {
    var tableId = req.param("tableId");
    var alertsData = req.body.alerts;
    var table = client.getTable(tableId);
    if (table === null) {
        res.send(400);
    }
    client.updateTableAlerts(tableId, alertsData);
    res.send(200);
});

module.exports = router;