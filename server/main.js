// server/main.js
import { Meteor } from 'meteor/meteor';
import '../imports/startup/server'; // ✅ This already runs your startup logic

Meteor.startup(() => {
  console.log('Main server startup executed.'); // Optional logging
});
