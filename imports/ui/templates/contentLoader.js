import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './contentLoader.html';

Template.contentLoader.onCreated(function () {
  this.activities = new ReactiveVar([]);
  this.currentIndex = new ReactiveVar(0);
  this.feedback = new ReactiveVar('');

  const subject = this.data.subject;
  const age = this.data.age;
  const path = `/content/${subject}.json`;

  fetch(path)
    .then(res => res.json())
    .then(json => {
      this.activities.set(json[`age${age}`] || []);
    })
    .catch(err => console.error('Error loading JSON:', err));
});

Template.contentLoader.helpers({
  subjectTitle() {
    return Template.instance().data.subject.toUpperCase();
  },
  currentActivity() {
    const instance = Template.instance();
    const activities = instance.activities.get();
    const index = instance.currentIndex.get();
    return activities.length ? activities[index] : null;
  },
  activityTemplate() {
    const activity = Template.instance().currentActivity?.get();
    if (!activity) return null;
    return `activity_${activity.type}`;
  },
  feedback() {
    return Template.instance().feedback.get();
  }
});

Template.contentLoader.events({
  'click .option-btn'(event, instance) {
    const answer = event.currentTarget.dataset.answer;
    const activity = instance.activities.get()[instance.currentIndex.get()];

    if (answer === activity.correct || answer === activity.correctAnswer) {
      instance.feedback.set('Correct! 🎉');
    } else {
      instance.feedback.set('Try again!');
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
    const nextIndex = (index + 1) % instance.activities.get().length;
    instance.currentIndex.set(nextIndex);
    instance.feedback.set('');
  }
});
