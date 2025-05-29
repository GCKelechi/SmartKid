import { Template } from 'meteor/templating';
import './maths.html';

Template.maths.events({
  'click #check-math-answer'(event, instance) {
    const answer = parseInt(document.getElementById("math-input").value);
    const feedback = document.getElementById("math-feedback");
    feedback.innerText = answer === 8 ? "Correct! 🎉" : "Try again!";
  }
});
