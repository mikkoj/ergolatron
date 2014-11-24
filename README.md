#Ergolatron - Cloud-controlled work desk using Arduino, Johnny-Five, Faye, and Polymer

[Read about the project on the Nortal Blog](http://blog.nortal.com/cloud-controlled-work-desks-using-arduinos-node-js-polymer/)

  - **ergolatron-faye**: a faye-instance for publish-subscribe messaging between tables and the UI
  - **ergolatron-table**: receives commands from Faye and handles controlling the arduino with Johnny-Five
  - **ergolatron-ui**: simple Polymer-UI for showing the current height of registered tables
  - **ergolatron-server**: Node.JS Express app for handling table-registrations, stats and SMS-messaging

 ![cloud-architecture](http://blog.nortal.com/wp-content/uploads/2014/11/ergolatron-cloud1.png)