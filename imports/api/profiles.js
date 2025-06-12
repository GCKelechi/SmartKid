import { Mongo } from 'meteor/mongo';

export const Profiles = new Mongo.Collection('profiles');

Meteor.methods({
  'profiles.create'(age, profilePicture) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Profiles.insert({
      userId: this.userId,
      age,
      profilePicture,
      createdAt: new Date(),
    });
  },
});