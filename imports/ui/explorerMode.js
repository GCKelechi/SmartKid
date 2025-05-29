// explorerMode.js
import { Template } from 'meteor/templating';
import './explorerMode.html';

Template.explorerMode.events({
  'click #check-answer'(event, instance) {
    const input = instance.find('#answer-input');
    const feedback = instance.find('#feedback');

    const userAnswer = parseInt(input.value);
    const correctAnswer = 4;

    if (userAnswer === correctAnswer) {
      feedback.textContent = "✅ Correct!";
      feedback.style.color = "green";
    } else {
      feedback.textContent = "❌ Try again.";
      feedback.style.color = "red";
    }
  },

  'click .subject-btn'(event, instance) {
    const subject = event.currentTarget.dataset.subject;
    const container = instance.find('#subject-content');

    fetch(`/content/${subject}.json`)
      .then(response => response.json())
      .then(data => {
        let html = '';

        if (Array.isArray(data)) {
          data.forEach(item => {
            html += `<div class="subject-item">
              <h4>${item.title || 'Untitled Activity'}</h4>
              <p>${item.description || ''}</p>
            </div>`;
          });
        } else {
          html = `<p>No valid content found.</p>`;
        }

        container.innerHTML = html;
      })
      .catch(err => {
        container.innerHTML = `<p style="color:red;">Failed to load ${subject} content.</p>`;
        console.error(`Error loading ${subject}.json:`, err);
      });
  }
});
