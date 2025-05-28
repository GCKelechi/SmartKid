import { Mongo } from 'meteor/mongo';

// Define and export the collection
export const UserProgress = new Mongo.Collection('userProgress');

// Optional: helper function (for external display, not Mongo helpers)
export function getProgressDisplayName(progressDoc) {
  return `Progress for ${progressDoc.childId}`;
}
