import { Template } from 'meteor/templating';
import './babyMode.html';

Template.babyMode.events({
  'click #baby-maths'() {
    document.getElementById('baby-activity-output').innerText = 'Maths: Let’s count together!';
  },
  'click #baby-literacy'() {
    document.getElementById('baby-activity-output').innerText = 'Literacy: Look at these fun letters!';
  },
  'click #baby-fineart'() {
    document.getElementById('baby-activity-output').innerText = 'Fine Art: Let’s play with colors!';
  },
  'click #baby-music'() {
    document.getElementById('baby-activity-output').innerText = 'Music: Time to sing and dance!';
  },
  'click #baby-bible'() {
    document.getElementById('baby-activity-output').innerText = 'Bible Learning: Let’s hear a Bible story!';
  }
});
