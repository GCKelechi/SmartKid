import { Mongo } from 'meteor/mongo';

export const UserProgress = new Mongo.Collection('userProgress');

// Example of saving progress
UserProgress.insert({
  childId: 'child1',
  module: 'Baby Play',
  progress: 75 // percentage
});
