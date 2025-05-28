// explorerMode.js
Template.explorerMode.events({
  'click #check-answer': function(event) {
    event.preventDefault();
    const userAnswer = parseInt(document.getElementById('answer-input').value, 10);
    const feedbackEl = document.getElementById('feedback');

    if (userAnswer === 4) {
      feedbackEl.textContent = 'Correct! 🎉';
      feedbackEl.style.color = 'green';
    } else {
      feedbackEl.textContent = 'Oops, try again!';
      feedbackEl.style.color = 'red';
    }
  }
});
