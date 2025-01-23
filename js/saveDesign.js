export function saveCurrentDesign() {
    const designName = prompt("Enter a name for your design:");
    if (!designName) return;
    
    const currentColors = {}; // Fetch current colors from the model
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      const colorName = swatch.querySelector('span').textContent;
      const colorValue = swatch.style.backgroundColor;
      currentColors[colorName] = colorValue;
    });
    
    const designs = JSON.parse(localStorage.getItem('designs')) || {};
    designs[designName] = currentColors;
    localStorage.setItem('designs', JSON.stringify(designs));
  }