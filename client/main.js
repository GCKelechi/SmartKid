import { Meteor } from 'meteor/meteor';
import '../imports/ui/body.js';
import '../imports/ui/babyMode.js';
import '../imports/ui/explorerMode.js';
import '../imports/ui/juniorMode.js';
import '../imports/ui/bla/bla.js';
import '../imports/ui/maths/maths.js';
import '../imports/ui/literacy/literacy.js';
import '../imports/ui/fineart/fineart.js';
import '../imports/ui/music/music.js';
import '/imports/ui/styles.css';
import 'meteor/accounts-ui'; // Ensure this imports the accounts UI package
import { Accounts } from 'meteor/accounts-base';


// Configure Accounts UI
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL',
});

// Log when the client starts
Meteor.startup(() => {
  console.log('Client is running...');
  console.log('Login Buttons Template:', Template.loginButtons); // Log the loginButtons template
});