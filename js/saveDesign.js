export function saveCurrentDesign(productCat, productPath) {
  const designName = prompt("Enter a name for your design:");
  if (!designName) return;

  const currentColors = {}; // Fetch current colors from the model
  document.querySelectorAll('.color-swatch').forEach(swatch => {
      const colorNameElement = swatch.previousElementSibling;
      if (colorNameElement) {
          const colorName = colorNameElement.textContent;
          const colorValue = rgbToHex(swatch.style.backgroundColor);
          currentColors[colorName] = colorValue;
      } else {
          console.error('No preceding p element found within .color-container');
      }
  });

  const designs = JSON.parse(localStorage.getItem('designs')) || {};
  designs[designName] = {
      productCat: productCat,
      productPath: productPath,
      colors: currentColors
  };
  localStorage.setItem('designs', JSON.stringify(designs));
}

// Function to convert RGB to HEX
function rgbToHex(rgb) {
  const rgbArray = rgb.match(/\d+/g);
  return `#${((1 << 24) + (parseInt(rgbArray[0]) << 16) + (parseInt(rgbArray[1]) << 8) + parseInt(rgbArray[2])).toString(16).slice(1).toUpperCase()}`;
}