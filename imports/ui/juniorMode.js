import { Template } from 'meteor/templating';
import './juniorMode.html';

Template.juniorMode.events({
  'click #junior-maths'() {
    document.getElementById('junior-activity-output').innerText = 'Maths: Solve simple math problems!';
  },
  'click #junior-literacy'() {
    document.getElementById('junior-activity-output').innerText = 'Literacy: Read fun short stories!';
  },
  'click #junior-fineart'() {
    document.getElementById('junior-activity-output').innerText = 'Fine Art: Draw shapes and patterns!';
  },
  'click #junior-music'() {
    document.getElementById('junior-activity-output').innerText = 'Music: Listen and play with tunes!';
  },
  'click #junior-bible'() {
    document.getElementById('junior-activity-output').innerText = 'Bible Learning: Discover Bible heroes!';
  }
});
