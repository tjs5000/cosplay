export async function saveCurrentDesign(productCat, modelPath, jsonPath) {
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

  const modifiedJsonPath = jsonPath.replace("/data/materials/", "");
  // Capture the screenshot from the canvas
  const thumbnail = await captureThumbnail(); 
 
  const designs = JSON.parse(localStorage.getItem('designs')) || {};
  designs[designName] = {
    productCat: productCat,
    modelPath: modelPath,
    jsonPath: jsonPath,
    colors: currentColors,
    thumbnail: thumbnail
  };

  localStorage.setItem('designs', JSON.stringify(designs));
}

// Function to convert RGB to HEX
function rgbToHex(rgb) {
  const rgbArray = rgb.match(/\d+/g);
  return `#${((1 << 24) + (parseInt(rgbArray[0]) << 16) + (parseInt(rgbArray[1]) << 8) + parseInt(rgbArray[2])).toString(16).slice(1).toUpperCase()}`;
}


function captureThumbnail() {
  return new Promise((resolve, reject) => {
    const canvas = document.getElementById('three-container').querySelector('canvas');
    if (!canvas) {
      reject('Canvas not found');
      return;
    }

    const thumbnail = canvas.toDataURL('image/png');

    // Create an offscreen canvas for cropping
    const offscreenCanvas = document.createElement('canvas');
    const context = offscreenCanvas.getContext('2d');

    // Set the desired cropped size
    const cropWidth = 500; // example width
    const cropHeight = 500; // example height
    offscreenCanvas.width = cropWidth;
    offscreenCanvas.height = cropHeight;

    // Draw the captured image onto the offscreen canvas and crop it
    const image = new Image();
    image.src = thumbnail;

    image.onload = () => {
      // Crop the image to the center of the original canvas
      const startX = (image.width - cropWidth) / 2;
      const startY = (image.height - cropHeight) / 2;
      context.drawImage(image, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      // Get the cropped image data
      const croppedThumbnail = offscreenCanvas.toDataURL('image/png');
      resolve(croppedThumbnail);
    };

    image.onerror = (error) => {
      reject(`Image failed to load: ${error}`);
    };
  });
}
