// explorerMode.js
Template.explorerMode.events({
  'click .math-question': function(event) {
    const answer = event.currentTarget.dataset.answer;
    // Check answer and provide feedback
  }
});
