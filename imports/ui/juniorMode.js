// juniorMode.js
Template.juniorMode.events({
  'click .abc-letter': function(event) {
    const letter = event.currentTarget.dataset.letter;

    // Example logic for letter tracing (stub)
    console.log(`Tracing letter: ${letter}`);

    // Provide feedback (e.g., visual or audio)
    alert(`Great! You clicked on letter ${letter}. Keep practicing!`);

    // You could add more complex tracing logic here, e.g., drawing on canvas
  }
});
