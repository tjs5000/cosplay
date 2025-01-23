import * as Pickr from 'https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/pickr.min.js';
import { changeMaterialColor } from './model-handler.js';
export function updateCarousel(carousel, data) {
    carousel.innerHTML = '';
    Object.keys(data).forEach(key => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carousel-item';
        itemDiv.setAttribute('data-preset-name', key); // Add data-preset-name attribute

        const img = document.createElement('img');
        img.src = `images/coats/${key.toLowerCase().replace(/ /g, '-')}.png`;
        img.alt = key;
        img.onerror = function() {
            this.src = 'images/coats/missing.png';
        };

        const label = document.createElement('p');
        label.textContent = key;

        itemDiv.appendChild(img);
        itemDiv.appendChild(label);
        carousel.appendChild(itemDiv);
    });
}

export function updateCustomContent(customContent, colors) {
    customContent.innerHTML = '';
    Object.entries(colors).forEach(([label, hex]) => {
        const colorCont = document.createElement('div');
        colorCont.className = 'color-container';
        const swatchDiv = document.createElement('div');
        swatchDiv.className = 'color-swatch';
        swatchDiv.style.backgroundColor = hex;
        const swatchLabel = document.createElement('span');
        swatchLabel.textContent = label;
        colorCont.appendChild(swatchDiv);
        colorCont.appendChild(swatchLabel);

        // Create container for the color picker (hidden, the picker will be triggered by clicking the swatch)
        const colorPickerContainer = document.createElement('div');
        colorPickerContainer.id = `color-picker-${label}`;
        colorCont.appendChild(colorPickerContainer);

        // Initialize the Pickr instance for color picking with the current color
        const colorPicker = Pickr.create({
            el: `#color-picker-${label}`,
            theme: 'nano', // Or 'classic' or 'monolith'
            default: hex, // Use the current color as the default
            swatches: [
                '#FFFFFF', '#030303', '#8C8C8C', '#B3D4DD', '#4E6366', '#E70A0A',
                '#8D0D00', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4',
                '#00BCD4', '#009688', '#007A02', '#8BC34A', '#CDDC39', '#FFEB3B',
                '#FFC107', '#FF9800', '#FF7722'
            ],
            components: {
                preview: true, // Show preview swatch
                opacity: false, // No opacity slider
                hue: true, // Enable hue slider
                interaction: {
                    hex: true,  // Show Hex input
                    rgba: false,  // Hide RGBA
                    input: true,  // Allow direct color input
                    save: false   // Hide save button
                }
            }
        });

        // Add click event listener to the swatch to open the color picker
        swatchDiv.addEventListener('click', () => {
            colorPicker.show(); // Show the color picker when the swatch is clicked
        });

        // Listen for the 'change' event for real-time color updates
        colorPicker.on('change', (color) => {
            const hexColor = color.toHEXA().toString();  // Convert color to HEX format
            swatchDiv.style.backgroundColor = hexColor;  // Update the swatch background color
            // Apply the color to the model (assuming you have a function for this)
            changeMaterialColor(label, hexColor);
        });

        customContent.appendChild(colorCont);
    });
}