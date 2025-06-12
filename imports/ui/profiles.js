import { Template } from 'meteor/templating';
import { Profiles } from '../api/profiles.js'; // Ensure correct path

Template.profile.events({
  'submit #profile-form': function(event) {
    event.preventDefault();
    const target = event.target;
    const age = target.age.value;
    const profilePicture = target.profilePicture.files[0];

    // Handle profile picture upload and save other details
    // Example: Save to a Meteor collection
    Meteor.call('profiles.create', age, profilePicture, (error) => {
      if (error) {
        alert(error.reason);
      } else {
        alert('Profile created!');
      }
    });
  },
});