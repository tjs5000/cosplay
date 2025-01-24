import { changeMaterialColor } from './model-handler.js';

export function loadDesign(designName) {
  const designs = JSON.parse(localStorage.getItem('designs')) || {};
  const design = designs[designName];
  if (!design) return;
  
  Object.entries(design).forEach(([colorName, colorValue]) => {
    const swatch = document.querySelector(`.color-swatch span[textContent="${colorName}"]`).parentNode;
    swatch.style.backgroundColor = colorValue;
    // Apply color to model
    changeMaterialColor(colorName, colorValue);
  });
}

document.addEventListener('DOMContentLoaded', function () {
    const designsContainer = document.getElementById('designsContainer');
    const designs = JSON.parse(localStorage.getItem('designs')) || {};

    Object.keys(designs).forEach(designName => {
        const designDiv = document.createElement('div');
        designDiv.className = 'design-item';
        designDiv.textContent = designName;
        designDiv.addEventListener('click', () => loadDesign(designName));
        designsContainer.appendChild(designDiv);
    });

    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Add navigation functionality here
        });
    });

    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function () {
            // Add back button functionality here
        });
    }
});

