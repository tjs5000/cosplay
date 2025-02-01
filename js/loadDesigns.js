import { initScene, initCamera, initRenderer, initControls, initLighting, loadModel, applyPresetMaterialColors, model, scene, renderer } from './model-handler.js';

let currentDesignName = null;

export function loadDesign(designName) {
    currentDesignName = designName; // Set the currently loaded design
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
    loadModel(modelPath, design.colors, () => {
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
    editDesign();
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
            designNameSpan.className = 'style-name';
            designNameSpan.textContent = designName;
            designDiv.appendChild(designNameSpan);
            designDiv.addEventListener('click', () => loadDesign(designName));
            designsContainer.appendChild(designDiv);

            // Create Download Button
            const downloadButton = document.createElement('button');
            downloadButton.className = 'download-button';
            downloadButton.textContent = '⬇️';
            designDiv.appendChild(downloadButton);
            downloadButton.addEventListener('click', (event) => downloadDesign(designName));
            
            
             // Create and append remove icon
             const removeIcon = document.createElement('span');
             removeIcon.className = 'remove-icon';
             removeIcon.textContent = '\u00D7';

             removeIcon.addEventListener('click', (event) => {
                 event.stopPropagation();
                 if (confirm(`Are you sure you want to remove the design "${designName}"?`)) {
                    removeDesign(designName);
                }
             });
             designDiv.appendChild(removeIcon);
 
             designDiv.addEventListener('click', () => loadDesign(designName));
             designsContainer.appendChild(designDiv);
         });

          // Add the "Upload Design" button
        const uploadDiv = document.createElement('div');
        uploadDiv.className = 'upload-item';
        const uploadButton = document.createElement('button');
        uploadButton.className = 'upload-button';
        uploadButton.textContent = 'Upload a design (JSON format)';
        uploadButton.addEventListener('click', handleUploadClick);
        uploadDiv.appendChild(uploadButton);
        designsContainer.appendChild(uploadDiv);

        return true;
    }
}

function downloadDesign(designName) {
    const designs = JSON.parse(localStorage.getItem('designs'));
    if (!designs || !designs[designName]) {
        alert(`Design "${designName}" not found!`);
        return;
    }

    const { thumbnail, ...designWithoutThumbnail } = designs[designName];
    const blob = new Blob([JSON.stringify(designWithoutThumbnail)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${designName}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function handleUploadClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', handleFileUpload);
    input.click();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = JSON.parse(e.target.result);
                const designs = JSON.parse(localStorage.getItem('designs')) || {};
                const designName = file.name.replace('.json', '');
                designs[designName] = content;
                localStorage.setItem('designs', JSON.stringify(designs));
                listDesigns(); // Refresh the design list
                alert(`Design "${designName}" uploaded successfully!`);
            } catch (error) {
                alert('Invalid JSON file.');
            }
        };
        reader.readAsText(file);
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


function removeDesign(designName) {
    const designs = JSON.parse(localStorage.getItem('designs')) || {};
    delete designs[designName];
    localStorage.setItem('designs', JSON.stringify(designs));
    listDesigns(); // Refresh the design list
}

function editDesign() {
document.getElementById('editDesignBtn').addEventListener('click', () => {
    if (!currentDesignName) {
        alert('No design currently loaded!');
        return;
    }

    const designs = JSON.parse(localStorage.getItem('designs')) || {};
    const design = designs[currentDesignName];
    if (!design) {
        alert(`Design "${currentDesignName}" not found!`);
        return;
    }

    const modelPath = design.modelPath.startsWith('/models/') ? design.modelPath : `/models/${design.modelPath}`;
    const jsonFilePath = design.jsonPath || 'default_materials.json'; // Ensure there is a valid JSON path

    window.loadContent('modelEditor.html', modelPath, jsonFilePath, () => {
        if (design.colors) {
            import('./app.js').then(module => {
                module.initializeModelEditor(modelPath, jsonFilePath, 'myDesigns.html');
                module.applyPresetMaterialColors(currentDesignName, design.colors);
            });
        }
    });
});
};