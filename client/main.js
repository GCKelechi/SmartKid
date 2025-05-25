import { Meteor } from 'meteor/meteor';
import '../imports/ui/body.js'; // Correct path to body.js
import '../imports/ui/babyMode.js'; // Correct path to babyMode.js
import '../imports/ui/explorerMode.js'; // Correct path to explorerMode.js
import '../imports/ui/juniorMode.js'; // Correct path to juniorMode.js

Meteor.startup(() => {
  console.log('Client is running...');
});