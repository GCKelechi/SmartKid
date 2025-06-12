import { Template } from 'meteor/templating';
import { Profiles } from '../api/profiles.js'; // Ensure correct path

Template.profile.events({
  // Handle profile creation
  'submit #profile-form': function(event) {
    event.preventDefault();
    const target = event.target;
    const age = target.age.value;
    const profilePicture = target.profilePicture.files[0];
    const username = target.username.value;

    // Call method to create the profile
    Meteor.call('profiles.create', { age, profilePicture, username }, (error) => {
      if (error) {
        alert(error.reason);
      } else {
        alert('Profile created!');
      }
    });
  },

  // Handle edit button click
  'click #edit-profile': function() {
    // Show the edit profile form
    document.getElementById('edit-profile-form').style.display = 'block';
    document.getElementById('profile-form').style.display = 'none'; // Hide create form
  },

  // Handle cancel edit
  'click #cancel-edit': function() {
    document.getElementById('edit-profile-form').style.display = 'none'; // Hide edit form
    document.getElementById('profile-form').style.display = 'block'; // Show create form
  },

  // Handle profile editing
  'submit #edit-profile': function(event) {
    event.preventDefault();
    const target = event.target;
    const age = target.editAge.value;
    const profilePicture = target.editProfilePicture.files[0];
    const username = target.editUsername.value;

    // Call method to update the profile
    Meteor.call('profiles.update', { age, profilePicture, username }, (error) => {
      if (error) {
        alert(error.reason);
      } else {
        alert('Profile updated!');
        document.getElementById('edit-profile-form').style.display = 'none'; // Hide edit form
        document.getElementById('profile-form').style.display = 'block'; // Show create form
      }
    });
  },
});