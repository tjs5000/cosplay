import { changeMaterialColor } from './model-handler.js';

let globalPickerPosition = { left: 40, bottom: 50 };

export function updateCarousel(carousel, data) {
    carousel.innerHTML = '';
    Object.keys(data).forEach(key => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carousel-item';
        itemDiv.setAttribute('data-preset-name', key); // Add data-preset-name attribute

        const img = document.createElement('img');
        img.src = `images/coats/${key.toLowerCase().replace(/ /g, '-')}.png`;
        img.alt = key;
        img.onerror = function () {
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
    customContent.innerHTML = ''; // Generate swatches once
    Object.entries(colors).forEach(([label, hex]) => {
        const colorCont = document.createElement('div');
        colorCont.className = 'color-container';
        const swatchDiv = document.createElement('div');
        swatchDiv.className = 'color-swatch';
        swatchDiv.style.backgroundColor = hex;
        const swatchLabel = document.createElement('p');
        swatchLabel.textContent = label.replace(/_/g, ' ');

        colorCont.appendChild(swatchDiv);
        colorCont.appendChild(swatchLabel);
        const colorPickerContainer = document.createElement('div');
        colorPickerContainer.id = `color-picker-${label}`;
        colorCont.appendChild(colorPickerContainer);

        customContent.appendChild(colorCont);

        const colorPicker = Pickr.create({
            el: `#color-picker-${label}`,
            theme: 'nano',
            appClass: 'custom-class',
            autoReposition: false,
            inline: false,
            default: hex,
            swatches: ['#FFFFFF', '#030303', '#8C8C8C', '#A9A9A9', '#B3D4DD', '#4E6366', '#E70A0A',
                '#8D0D00', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4',
                '#00BCD4', '#009688', '#007A02', '#8BC34A', '#CDDC39', '#FFEB3B',
                '#FFC107', '#FF9800', '#FF7722', '#4B5320', '#2F4F4F'
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

        colorPicker._rePositioningPicker = function() {
            // Do nothing, so Pickr won't move the dialog automatically
          };

        swatchDiv.addEventListener('click', () => {
            colorPicker.show();
        });
        colorPicker.on('show', () => {
            const pickrContainer = colorPicker.getRoot().app;
            pickrContainer.style.position = 'absolute';
            // On mobile, force a fixed location; on desktop use the global position.
            if (window.matchMedia('(max-width: 1023px)').matches) {
              pickrContainer.style.left = 'calc(50vw - 173px)';
              pickrContainer.style.top = 'unset';
              pickrContainer.style.bottom = '30px';
            } else {
              pickrContainer.style.left = `${globalPickerPosition.left}px`;
              pickrContainer.style.top = 'unset';
            pickrContainer.style.bottom = `${globalPickerPosition.bottom}px`;
            }
            
            // Optionally, show the scrim if needed
            const scrim = document.getElementById('scrim');
            if (scrim) {
              scrim.style.display = 'block';
            }
          });

        colorPicker.on('hide', () => {
            const scrim = document.getElementById('scrim');
            if (scrim) {
                scrim.style.display = 'none';
            }
        });

        colorPicker.on('change', (color) => {
            const hexColor = color.toHEXA().toString();
            swatchDiv.style.backgroundColor = hexColor;
            changeMaterialColor(label, hexColor);
        });

        // Create a grab bar element and insert it at the top of the pickr dialog
        const pickrContainer = colorPicker.getRoot().app;
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        // Insert the drag handle at the top of the picker container
        pickrContainer.insertBefore(dragHandle, pickrContainer.firstChild);

        // Set the container's position to absolute (if not already set) so it can be moved
        pickrContainer.style.position = 'absolute';
        pickrContainer.style.left = `${globalPickerPosition.left}px`;
        pickrContainer.style.bottom = `${globalPickerPosition.bottom}px`;

        let isDragging = false;
        let offset = { x: 0, y: 0 };
        const isDesktop = !window.matchMedia('(max-width: 1023px)').matches;
        if (isDesktop) {
        dragHandle.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent default behavior which might cause jumpy positioning
            isDragging = true;
            // Disable text selection on the entire document while dragging
            document.body.style.userSelect = 'none';

            const rect = pickrContainer.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                
                e.preventDefault();
                let newLeft = e.clientX - offset.x;
                let newTop = e.clientY - offset.y;
                console.log(newTop);
            // Compute new bottom: viewport height minus (new top + container height)
            let newBottom = window.innerHeight - (newTop + pickrContainer.offsetHeight);

            // Constrain horizontal movement (ensure the picker stays within the viewport)
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - pickrContainer.offsetWidth));
            // Constrain vertical movement: newBottom should be between 0 and the max possible
            newBottom = Math.max(0, Math.min(newBottom, window.innerHeight - pickrContainer.offsetHeight));
      
            pickrContainer.style.left = `${newLeft}px`;
            pickrContainer.style.top = 'unset';
            pickrContainer.style.bottom = `${newBottom}px`;
      
            // Update the global position so subsequent pickers show in the same place
            globalPickerPosition.left = newLeft;
            globalPickerPosition.bottom = newBottom;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                // Re-enable text selection after dragging is finished
                document.body.style.userSelect = '';
            }
        });
    }

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