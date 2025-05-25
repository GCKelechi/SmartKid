import { Template } from 'meteor/templating';
import './body.html'; // Correctly import the body HTML template

Template.body.events({
  'click #child1, click #child2, click #child3': function(event) {
    document.getElementById('profile-selection').style.display = 'none';
    document.getElementById('learning-menu').style.display = 'block';
  },
  'click #baby-mode': function() {
    // Load Baby Mode activities
  },
  'click #junior-mode': function() {
    // Load Junior Mode activities
  },
  'click #explorer-mode': function() {
    // Load Explorer Mode activities
  }
});