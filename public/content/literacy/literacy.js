import { Template } from 'meteor/templating';
import './literacy.html';

Template.literacy.events({
  'click #check-literacy-answer'(event, instance) {
    const answer = document.getElementById("literacy-input").value.trim().toLowerCase();
    const feedback = document.getElementById("literacy-feedback");
    feedback.innerText = answer === "apple" ? "Well done! 🍎" : "Oops, try again!";
  }
});
