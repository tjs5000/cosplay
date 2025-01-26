import { initScene, initCamera, initRenderer, initControls, initLighting, loadModel, applyPresetMaterialColors, model, scene, renderer } from './model-handler.js';

export function loadDesign(designName) {
    console.log(`Loading design: ${designName}`);
    const designs = JSON.parse(localStorage.getItem('designs')) || {};
    console.log(`Designs in localStorage:`, designs);
    const design = designs[designName];
    if (!design) {
        console.warn(`Design not found: ${designName}`);
        return;
    }
    const modelPath = design.modelPath.startsWith('/models/') ? design.modelPath : `/models/${design.modelPath}`;
    console.log(`Fetching model from: ${modelPath}`);

    // Remove the existing model if present
    if (model) {
        console.log('Removing old model...');
        scene.remove(model);
        // Dispose of the model's geometry and materials to free up memory
        model.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat) => {
                            if (mat.map) mat.map.dispose();
                            mat.dispose();
                        });
                    } else {
                        if (child.material.map) child.material.map.dispose();
                        child.material.dispose();
                    }
                }
            }
        });
        console.log('Old model removed and resources disposed');
    }

    // Reinitialize the 3D environment to ensure a clean state
    initScene();
    initCamera();
    initRenderer();
    initControls();
    initLighting();

    // Load new model and apply custom colors
    loadModel(modelPath).then(() => {
        console.log(`Model ${modelPath} loaded successfully.`);

        if (design.colors) {
            applyPresetMaterialColors(designName, design.colors);
        } else {
            console.warn(`Colors not found for design ${designName}`);
        }
    }).catch(error => {
        console.error('Error loading model:', error);
    });
}

export function initializeDesigns() {
    const hasDesigns =listDesigns();
    createPlaceholder(hasDesigns);

    const designs = JSON.parse(localStorage.getItem('designs')) || {};
    console.log('materialsData updated with local storage designs:', designs);
}

export function listDesigns() {
    console.log(`Listing designs...`);
    const designsContainer = document.getElementById('designsContainer');
    const designs = JSON.parse(localStorage.getItem('designs')) || {};
    console.log(`Designs in localStorage:`, designs);

    designsContainer.innerHTML = '';
    if (Object.keys(designs).length === 0) {
        designsContainer.classList.add('no-designs');
        return false;
    } else {
        Object.keys(designs).forEach(designName => {
            console.log(`Adding design to list: ${designName}`);
            // Create container for each design
            const designDiv = document.createElement('div');
            designDiv.className = 'design-item';

            // Create and append thumbnail
            const designThumb = document.createElement('img');
            designThumb.className = 'thumbnail';
             designThumb.src = designs[designName].thumbnail || '/images/coats/missing.png'; 
            designDiv.appendChild(designThumb);

            // Create and append design name
            const designNameSpan = document.createElement('span');
            designNameSpan.textContent = designName;
            designDiv.appendChild(designNameSpan);
            designDiv.addEventListener('click', () => loadDesign(designName));
            designsContainer.appendChild(designDiv);
        });
        return true;
    }
}

function createPlaceholder(hasDesigns) {
    // Select the container element
    const container = document.getElementById('three-container');

    // Create a canvas element
    const canvas = document.createElement('canvas');

    // Set canvas dimensions
    canvas.width = container.clientWidth || 400; // Default to 600 if container width is not set
    canvas.height = container.clientHeight || 500; // Default to 400 if container height is not set

    // Get the 2D rendering context
    const ctx = canvas.getContext('2d');

  

    // Set text properties
    ctx.font = '28px Arial';
    ctx.fillStyle = '#FFFFFFCC';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Render text
    if (hasDesigns) {
        const text = 'Select a design to view';
        const x = canvas.width / 2; // Center horizontally
        const y = canvas.height / 2.5; // Center vertically
        ctx.fillText(text, x, y);
    } else {
        const text1 = 'No designs found.';
        const text2 = 'Please create one.';
        const x = canvas.width / 2; // Center horizontally
        const y = canvas.height / 2.5; // Vertical position for the first line
        const lineSpacing = 40; // Spacing between lines

        // Draw each line of text
        ctx.fillText(text1, x, y); // First line
        ctx.fillText(text2, x, y + lineSpacing); // Second line
    }

    // Append the canvas to the container
    container.appendChild(canvas);
}
