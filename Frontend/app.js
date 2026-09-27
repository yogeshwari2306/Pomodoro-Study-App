// =========================================================
// FocusBuddy — app.js
// Stage 1: just handles switching between the nav pages.
// In later stages we will add the timer, tasks, etc. here
// (or split into separate files like timer.js, tasks.js).
// =========================================================

// Grab every nav button and every page section from the HTML
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

// Loop through each nav button and listen for clicks
navButtons.forEach(function (button) {
  button.addEventListener('click', function () {

    // 1. Find which page this button wants to show
    //    (it comes from the data-page="..." attribute in the HTML)
    const targetPageId = button.getAttribute('data-page');

    // 2. Remove "active" class from all nav buttons, then add it
    //    only to the one that was just clicked
    navButtons.forEach(function (btn) {
      btn.classList.remove('active');
    });
    button.classList.add('active');

    // 3. Hide every page, then show only the target page
    pages.forEach(function (page) {
      page.classList.remove('active');
    });
    document.getElementById(targetPageId).classList.add('active');
  });
});

// Simple greeting that changes based on time of day.
// This runs once when the page first loads.
function setGreeting() {
  const hour = new Date().getHours();
  let greetingText = 'Good morning 👋';

  if (hour >= 12 && hour < 17) {
    greetingText = 'Good afternoon 👋';
  } else if (hour >= 17) {
    greetingText = 'Good evening 👋';
  }

  const greetingElement = document.querySelector('.greeting');
  if (greetingElement) {
    greetingElement.textContent = greetingText;
  }
}

setGreeting();

// Quick Start button currently just switches to the Pomodoro page.
// Actual timer logic is added in Stage 2.
const quickStartBtn = document.getElementById('quick-start-btn');
quickStartBtn.addEventListener('click', function () {
  document.querySelector('.nav-btn[data-page="pomodoro"]').click();
});