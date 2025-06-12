// server/main.js
import { Meteor } from 'meteor/meteor';
import '../imports/startup/server'; // ✅ Your existing startup logic

// Method to update the user's email securely
Meteor.methods({
  updateUserEmail(newEmail) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    // Ensure the email is a string and follows basic email format
    check(newEmail, String);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      throw new Meteor.Error('invalid-email', 'Please provide a valid email address.');
    }

    Meteor.users.update(this.userId, {
      $set: { 'emails.0.address': newEmail }
    });
  }
});

Meteor.startup(() => {
  console.log('Main server startup executed.');
});
