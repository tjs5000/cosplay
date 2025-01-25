import { changeMaterialColor, loadModel } from './model-handler.js';

export function loadDesign(designName) {
    console.log(`Loading design: ${designName}`); // Debug log
    const designs = JSON.parse(localStorage.getItem('designs')) || {};
    console.log(`Designs in localStorage:`, designs); // Debug log
    const design = designs[designName];
    if (!design) {
        console.warn(`Design not found: ${designName}`); // Debug log
        return;
    }
    fetch(design.productPath)
        .then(response => response.json())
        .then(productData => {
            if (productData.model) {
                const modelPath = `/models/${productData.model}`;
                loadModel(modelPath).then(() => {
                    console.log(`Model ${productData.model} loaded successfully.`);
                    applyColors(design.colors);

                }).catch(error => {
                    console.error('Error loading model:', error);
                });
            } else {
                console.error('Model path not found in product data');
            }
        })
        .catch(error => {
            console.error('Error loading product data:', error);
        });

}


function applyColors(design) {
    Object.entries(design).forEach(([colorName, colorValue]) => {
        // Apply color to model
        changeMaterialColor(colorName, colorValue);
    });
}

export function listDesigns() {
    console.log(`Listing designs...`); // Debug log
    const designsContainer = document.getElementById('designsContainer');
    const designs = JSON.parse(localStorage.getItem('designs')) || {};
    console.log(`Designs in localStorage:`, designs); // Debug log

    designsContainer.innerHTML = ''; // Clear the container
    if (Object.keys(designs).length === 0) {
        designsContainer.textContent = 'No designs found.';
    } else {
        Object.keys(designs).forEach(designName => {
            console.log(`Adding design to list: ${designName}`); // Debug log
            const designDiv = document.createElement('div');
            designDiv.className = 'design-item';
            designDiv.textContent = designName;
            designDiv.addEventListener('click', () => loadDesign(designName));
            designsContainer.appendChild(designDiv);
        });
    }
}

// Export the listDesigns function to be used as a callback
export function initializeDesigns() {
    listDesigns();
}