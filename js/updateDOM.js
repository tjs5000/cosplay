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

        customContent.appendChild(colorCont);
    });
}