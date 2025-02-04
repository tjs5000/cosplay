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
itemDiv.appendChild(label);
        itemDiv.appendChild(img);
        
        carousel.appendChild(itemDiv);
    });
}

export function updateCustomContent(customContent, colors) {
    customContent.innerHTML = ''; // Generate swatches once
    Object.entries(colors).forEach(([label, hex]) => {
        const colorCont = document.createElement('div');
        colorCont.className = 'color-container';
        const swatchDiv = document.createElement('div');
        swatchDiv.className = 'color-swatch';
        swatchDiv.style.backgroundColor = hex;
        const swatchLabel = document.createElement('p');
        swatchLabel.textContent = label.replace(/_/g, ' ');
        colorCont.appendChild(swatchLabel);
        colorCont.appendChild(swatchDiv);

        const colorPickerContainer = document.createElement('div');
        colorPickerContainer.id = `color-picker-${label}`;
        colorCont.appendChild(colorPickerContainer);

        customContent.appendChild(colorCont);

        const colorPicker = Pickr.create({
            el: `#color-picker-${label}`,
            theme: 'nano',
            appClass: 'custom-class',
            default: hex,
            swatches: ['#FFFFFF', '#030303', '#8C8C8C', '#A9A9A9', '#B3D4DD', '#4E6366', '#E70A0A',
                '#8D0D00', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4',
                '#00BCD4', '#009688', '#007A02', '#8BC34A', '#CDDC39', '#FFEB3B',
                '#FFC107', '#FF9800','#FF7722', '#4B5320', '#2F4F4F'
            ],
            components: {
                preview: true,
                opacity: false,
                hue: true,
                interaction: {
                    hex: true,
                    rgba: false,
                    input: true,
                    save: false
                }
            }
        });

        swatchDiv.addEventListener('click', () => {
            colorPicker.show();
        });

        colorPicker.on('change', (color) => {
            const hexColor = color.toHEXA().toString();
            swatchDiv.style.backgroundColor = hexColor;
            changeMaterialColor(label, hexColor);
        });
    });
}

export function updateSwatchColors(customContent, colors) {
    Object.entries(colors).forEach(([label, hex]) => {
        const colorPickerElement = document.querySelector(`#color-picker-${label}`);
        if (colorPickerElement) {
            const swatchDiv = colorPickerElement.previousSibling;
            if (swatchDiv) {
                swatchDiv.style.backgroundColor = hex;
            }
        }
    });
}
// Add function to apply preset colors

export function applyPresetColors(presetColors) {
    const customContent = document.getElementById('customContent');
    updateCustomContent(customContent, presetColors);
    
    }