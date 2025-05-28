import { Template } from 'meteor/templating';
import './body.html'; // Update this if you renamed the file to main.html or something else

Template.homePage.events({
  'click #child1, click #child2, click #child3': function (event) {
    document.getElementById('profile-selection').style.display = 'none';
    document.getElementById('learning-menu').style.display = 'block';
  },
  'click #baby-mode': function () {
    console.log('Loading Baby Mode activities...');
    // Load Baby Mode activities here
  },
  'click #junior-mode': function () {
    console.log('Loading Junior Learner activities...');
    // Load Junior Learner activities here
  },
  'click #explorer-mode': function () {
    console.log('Loading Explorer Mode activities...');
    // Load Explorer Mode activities here
  }
});
