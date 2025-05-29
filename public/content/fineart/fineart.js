import { Template } from 'meteor/templating';
import './fineArt.html';

Template.fineArt.events({
  'click .color-choice'(event, instance) {
    const chosen = event.currentTarget.dataset.color;
    const feedback = document.getElementById("art-feedback");
    feedback.innerText = chosen === "yellow" ? "Beautiful! 🌟" : "Hmm, try yellow!";
  }
});
