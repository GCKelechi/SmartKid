import { Meteor } from 'meteor/meteor';

// Mode templates
import '../imports/ui/body.js';
import '../imports/ui/babyMode.js';
import '../imports/ui/explorerMode.js';
import '../imports/ui/juniorMode.js';

// Subject templates
import '../imports/ui/bla/bla.js';
import '../imports/ui/maths/maths.js';
import '../imports/ui/literacy/literacy.js';
import '../imports/ui/fineart/fineart.js';
import '../imports/ui/music/music.js';

// Global styles
import '/imports/ui/styles.css';

Meteor.startup(() => {
  console.log('Client is running...');
});
