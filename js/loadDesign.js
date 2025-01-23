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