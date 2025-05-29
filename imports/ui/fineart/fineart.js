import './fineart.html';

Template.fineart.onCreated(function () {
  this.content = new ReactiveVar('Loading...');
  const age = Session.get('selectedAge');
  const filePath = `/content/fineart/fineart-${age}.json`;

  fetch(filePath)
    .then(res => res.json())
    .then(data => this.content.set(data.activities.join('<br>')))
    .catch(() => this.content.set('Failed to load content.'));
});

Template.fineart.helpers({
  content() {
    return Template.instance().content.get();
  }
});
