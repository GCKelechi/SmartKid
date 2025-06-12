import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './body.html';
import './babyMode.html';
import './juniorMode.html';
import './explorerMode.html';

Template.homePage.events({
  // Learning mode buttons
  'click #baby-mode'(event) {
    console.log('Baby Mode button clicked');
    showSubjectDropdown();
    loadModeActivities('baby');
  },

  'click #junior-mode'(event) {
    console.log('Junior Mode button clicked');
    showSubjectDropdown();
    loadModeActivities('junior');
  },

  'click #explorer-mode'(event) {
    console.log('Explorer Mode button clicked');
    showSubjectDropdown();
    loadModeActivities('explorer');
  },

  // Logout handler
  'click #logout-button'() {
    Meteor.logout((err) => {
      if (err) {
        console.error('Logout failed', err);
      } else {
        console.log('Logged out successfully');
      }
    });
  },

  // Show Edit Profile form
  'click #edit-profile'(event) {
    const form = document.getElementById('edit-profile-form');
    if (form) {
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
  },

  // Handle profile update
  'submit #profile-update-form'(event) {
    event.preventDefault();

    const newEmail = event.target['new-email'].value;
    const newPassword = event.target['new-password'].value;

    // Update email if provided
    if (newEmail) {
      Meteor.call('updateUserEmail', newEmail, (err) => {
        if (err) {
          console.error('Email update failed:', err.reason);
        } else {
          console.log('Email updated successfully');
        }
      });
    }

    // Update password if provided
    if (newPassword) {
      Accounts.changePassword('', newPassword, (err) => {
        if (err) {
          console.error('Password update failed:', err.reason);
        } else {
          console.log('Password updated successfully');
        }
      });
    }

    // Optionally hide the form after update
    document.getElementById('edit-profile-form').style.display = 'none';
  }
});

// Load activities for the selected mode
function loadModeActivities(mode) {
  const activitiesContainer = document.getElementById('activities-container');
  if (!activitiesContainer) return;

  activitiesContainer.innerHTML = '';

  console.log(`Loading activities for mode: ${mode}`);

  switch (mode) {
    case 'baby':
      Blaze.render(Template.babyMode, activitiesContainer);
      break;
    case 'junior':
      Blaze.render(Template.juniorMode, activitiesContainer);
      break;
    case 'explorer':
      Blaze.render(Template.explorerMode, activitiesContainer);
      break;
    default:
      console.error('Unknown mode:', mode);
  }
}

// Show the subject selection dropdown
function showSubjectDropdown() {
  const subjectSelection = document.getElementById('subject-selection');
  if (subjectSelection) {
    subjectSelection.style.display = 'block';
  }
}
