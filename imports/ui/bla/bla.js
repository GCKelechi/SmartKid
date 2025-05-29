import './bla.html';

Template.bla.onCreated(function () {
  this.content = new ReactiveVar('Loading...');
  const age = Session.get('selectedAge'); // e.g., "age4"
  const filePath = `/content/bla/bla-${age}.json`;

  fetch(filePath)
    .then(res => res.json())
    .then(data => this.content.set(data.activities.join('<br>')))
    .catch(() => this.content.set('Failed to load content.'));
});

Template.bla.helpers({
  content() {
    return Template.instance().content.get();
  }
});
