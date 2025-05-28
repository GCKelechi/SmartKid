import { Template } from 'meteor/templating';
import { Howl } from 'howler';
import './babyMode.html';

Template.babyMode.onCreated(function() {
  // Initialization code if needed
});

Template.babyMode.events({
  'click #play-sounds'(event, instance) {
    // Example: Play a "dog" sound
    const sound = new Howl({
      src: ['audio/dog.mp3']
    });
    sound.play();
  },

  'click #show-colors'(event, instance) {
    // You can add logic here for showing colors
    alert('Showing colors activity coming soon!');
  },

  'click #sing-song'(event, instance) {
    // You can add logic here for singing a song
    alert('Singing a song activity coming soon!');
  }
});
