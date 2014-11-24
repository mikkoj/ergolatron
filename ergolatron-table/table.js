var _ = require('lodash');
var request = require('request');
var five = require("johnny-five");
var board = require('./board');
var common = require('./common');
var faye = require('faye');
var fayeClient = new faye.Client('http://ergolatron-faye.azurewebsites.net/faye');

var needToMove = false;
var movingUp = false;
var movingDown = false;
var targetHeight = null;
var heightMargin = 0.5;

var minHeight = 55;
var maxHeight = 130;

board.on("ready", function () {

    console.log('board ready');

    var pinDown = new five.Pin({
        pin: 12
    });

    var pinUp = new five.Pin({
        pin: 13
    });

    pinDown.low();
    pinUp.low();

    var allowControl = true;

    // Let's create a new `Ping` hardware instance for our ultrasonic sensor
    var ultrasonicSensor = new five.Ping(7);

    var addNewHeight = function (cm) {
        request.post(
            'http://ergolatron-server.azurewebsites.net/tables/height',
            {
                json: {
                    tableId: '4321',
                    height: cm
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log("Saved a new height: {0} cm".format(cm));
                } else {
                    console.log("Error: " + error);
                }
            }
        );
    };

    var updateHeightToFaye = function(cm) {
        fayeClient.publish('/sensors', {
            sensor: 'ultraSonic',
            height: cm
        });
    };

    var updateHeightToFayeThrottled = _.throttle(updateHeightToFaye, 500);
    var addNewHeightThrottled = _.throttle(addNewHeight, 5000);

    ultrasonicSensor.on("change", function (err, value) {
        updateHeightToFayeThrottled(this.cm);
        //addNewHeightThrottled(this.cm);
        processMoveToHeight(this.cm);
    });

    var tableDownFunc = function (callback) {
        if (allowControl === false) return;
        console.log('table down start');
        needToMove = true;
        allowControl = false;
        pinDown.high();
        movingDown = true;
        movingUp = false;

        setTimeout(function () {
            console.log('table down stop');
            needToMove = false;
            pinDown.low();
            movingDown = false;
            setTimeout(function () {
                allowControl = true;
            }, 50);
        }, 500);
    };

    var tableUpFunc = function (callback) {
        if (allowControl === false) return;
        console.log('poytä ylös start');
        needToMove = true;
        allowControl = false;
        pinUp.high();
        movingUp = true;
        movingDown = false;

        setTimeout(function () {
            console.log('table up stop');
            needToMove = false;
            pinUp.low();
            movingUp = false;
            setTimeout(function () {
                allowControl = true;
            }, 50);
        }, 500);
    };

    var poytaStopFunc = function () {
        pinDown.low();
        pinUp.low();
    };

    function processMoveToHeight(currentHeight) {
        if (needToMove == false && (movingUp == true || movingDown == true)) {
            console.log('No need to move and moving. - Stop!');
            tableStopMovement();
            return;
        }

        if (needToMove == false || typeof targetHeight === 'undefined' || targetHeight === null) {
            console.log('No need to move - Return.');
            return;
        }

        if ((currentHeight < (minHeight + heightMargin)) ||
            (currentHeight > (maxHeight - heightMargin)) ||
            (currentHeight > (targetHeight - heightMargin) && currentHeight < (targetHeight + heightMargin))) {
            console.log('In target - Stopped. (minHeight + heightMargin) = ' + (minHeight + heightMargin));
            tableStopMovement();
        }

        // Should move up
        if (currentHeight < (targetHeight - heightMargin) && (movingUp == false || movingDown == true)) {
            console.log('ShouldMoveUp: ' + currentHeight < targetHeight - heightMargin);
            movingUp = true;
            pinUp.high();
            return;
        }

        // Should move down
        if (currentHeight > (targetHeight + heightMargin) &&
            (movingDown == false || movingUp == true))
        {
            console.log('ShouldMoveDown: ' + (currentHeight > targetHeight + heightMargin));
            movingDown = true;
            pinDown.high();
        }
    }

    function tableInitMovement(data) {
        if (typeof data === 'undefined') {
            return;
        }

        console.log('InitMovement targetHeight: ' + data);
        needToMove = true;
        targetHeight = data;
    }

    function tableStopMovement() {
        needToMove = false;
        targetHeight = null;
        movingUp = false;
        movingDown = false;
        poytaStopFunc();
    }

    fayeClient.subscribe('/commands', function (message) {
        console.log(message);
        if (message.target === 'table') {
            if (message.command === 'up') {
                console.log('Received up-command.');
                tableUpFunc();
            } else if (message.command === 'down') {
                console.log('Received down-command.');
                tableDownFunc();
            } else if(message.command === 'moveTo') {
                console.log("TableInitMovementMsg: " + message.data)
              tableInitMovement(message.data);
            } else {
                tableStopMovement();
            }
        }
    });

    //tableInitMovement({'targetHeight': 75});
});