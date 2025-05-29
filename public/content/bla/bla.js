import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './bla.html';

Template.bla.onCreated(function() {
  this.activities = new ReactiveVar([]);
  this.currentIndex = new ReactiveVar(0);
  this.feedback = new ReactiveVar('');

  // Load JSON from public folder
  fetch('/content/bla/age7.json')
    .then(response => response.json())
    .then(data => {
      this.activities.set(data);
      this.currentIndex.set(0);
    })
    .catch(err => {
      console.error('Failed to load BLA activities:', err);
    });
});

Template.bla.helpers({
  currentActivity() {
    const instance = Template.instance();
    const activities = instance.activities.get();
    const index = instance.currentIndex.get();
    return activities.length > 0 ? activities[index] : null;
  },
  feedback() {
    return Template.instance().feedback.get();
  }
});

// Helper to compare strings in Blaze
Template.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

Template.bla.events({
  'click .option-btn'(event, instance) {
    const userAnswer = event.currentTarget.dataset.answer;
    const activity = instance.activities.get()[instance.currentIndex.get()];

    if (userAnswer === activity.correctAnswer) {
      instance.feedback.set('Correct! 🎉');
    } else {
      instance.feedback.set(`Try again! The correct answer is "${activity.correctAnswer}".`);
    }
  },

  'click #check-puzzle-answer'(event, instance) {
    const input = document.getElementById('puzzle-answer').value.trim().toUpperCase();
    const activity = instance.activities.get()[instance.currentIndex.get()];

    if (input === activity.answer.toUpperCase()) {
      instance.feedback.set('Well done! 🎉');
    } else {
      instance.feedback.set('Oops! Try again.');
    }
  },

  'click #next-activity'(event, instance) {
    const index = instance.currentIndex.get();
    const activities = instance.activities.get();
    const nextIndex = (index + 1) % activities.length;
    instance.currentIndex.set(nextIndex);
    instance.feedback.set('');
  }
});
