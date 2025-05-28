// imports/startup/server/index.js
import { Meteor } from 'meteor/meteor';
import { UserProgress } from '../../api/userProgress.js';

Meteor.startup(async () => {
  console.log('Server is running...');

  try {
    const count = await UserProgress.find().countAsync();

    if (count === 0) {
      await UserProgress.insertAsync({ childId: 'child1', progress: 0 });
      await UserProgress.insertAsync({ childId: 'child2', progress: 0 });
      await UserProgress.insertAsync({ childId: 'child3', progress: 0 });

      await UserProgress.insertAsync({
        childId: 'child1',
        module: 'Baby Play',
        progress: 75
      });

      console.log('Initial user progress seeded.');
    }
  } catch (error) {
    console.error('Error checking or inserting UserProgress:', error);
  }
});
