import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

// Define the Profiles collection
export const Profiles = new Mongo.Collection('profiles');

// Define Meteor methods for managing profiles
Meteor.methods({
  'profiles.create'({ age, profilePicture }) {
    check(age, Number);
    check(profilePicture, Match.Optional(File)); // Adjust based on your implementation

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Profiles.insert({
      userId: this.userId,
      age,
      profilePicture, // Handle file upload appropriately
      createdAt: new Date(),
    });
  },

  'profiles.update'({ age, profilePicture, username }) {
    check(age, Number);
    check(username, String);
    check(profilePicture, Match.Optional(File)); // Adjust based on your implementation

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Profiles.update({ userId: this.userId }, {
      $set: {
        age,
        username,
        profilePicture, // Handle file upload appropriately
      },
    });
  },
});