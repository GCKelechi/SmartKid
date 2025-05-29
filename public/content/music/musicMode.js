Template.musicMode.onCreated(function () {
  this.lessons = new ReactiveVar([]);

  fetch('/content/music/age7.json')
    .then(response => response.json())
    .then(data => {
      this.lessons.set(data.lessons);
    })
    .catch(error => {
      console.error("Failed to load music lessons:", error);
    });
});

Template.musicMode.helpers({
  lessons() {
    return Template.instance().lessons.get();
  }
});

Template.musicMode.events({
  'click .answer-option'(event) {
    const selected = event.currentTarget.innerText;
    const correct = this.answer;
    if (selected === correct) {
      alert("Correct!");
    } else {
      alert("Try again!");
    }
  }
});
