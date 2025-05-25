import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// Create a collection for user progress (example)
export const UserProgress = new Mongo.Collection('userProgress');

Meteor.startup(() => {
  // Code to run on server startup
  console.log('Server is running...');
  
  // Example: Initialize some data
  if (UserProgress.find().count() === 0) {
    UserProgress.insert({ childId: 'child1', progress: 0 });
    UserProgress.insert({ childId: 'child2', progress: 0 });
    UserProgress.insert({ childId: 'child3', progress: 0 });
  }
});