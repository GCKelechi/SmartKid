import { Template } from 'meteor/templating';
import './juniorMode.html';
import { Howl } from 'howler';

Template.juniorMode.events({
  'click .abc-letter'(event) {
    const letter = event.currentTarget.dataset.letter;
    const sound = new Howl({
      src: [`audio/letters/${letter}.mp3`]
    });
    sound.play();
  }
});
