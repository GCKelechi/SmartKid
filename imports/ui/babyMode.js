// babyMode.js
Template.babyMode.onCreated(function() {
  // Initialization code for Baby Mode
});

Template.babyMode.helpers({
  playSound: function(animal) {
    const sound = new Howl({
      src: [`audio/${animal}.mp3`]
    });
    sound.play();
  }
});
