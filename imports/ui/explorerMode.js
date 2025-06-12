import { Template } from 'meteor/templating';
import './explorerMode.html';

Template.explorerMode.events({
  'click #explorer-maths'() {
    document.getElementById('explorer-activity-output').innerText = 'Maths lessons will be loaded here...';
  },
  'click #explorer-literacy'() {
    document.getElementById('explorer-activity-output').innerText = 'Literacy lessons will be loaded here...';
  },
  'click #explorer-fineart'() {
    document.getElementById('explorer-activity-output').innerText = 'Fine Art lessons will be loaded here...';
  },
  'click #explorer-music'() {
    document.getElementById('explorer-activity-output').innerText = 'Music lessons will be loaded here...';
  },
  'click #explorer-bible'() {
    document.getElementById('explorer-activity-output').innerText = 'Bible Learning lessons will be loaded here...';
  }
});
