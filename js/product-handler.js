import { loadModel, materialsData, updateMaterials, applyPresetMaterialColors, isModelLoaded, model, displayMaterialOptions } from './model-handler.js';


export function fetchColorOptions(colorOptionsFile) {
    return fetch(colorOptionsFile)
        .then(response => response.json())
        .then(data => {
            // Update materialsData properties without reassigning
            Object.assign(materialsData, data);

            // Extract the style names (keys from the materials data)
            const styles = Object.keys(data);

            // Check for a default style in the JSON
            let defaultStyle = styles[0];  // Fallback default to the first style if none is marked as default
            styles.forEach(style => {
                if (data[style].default) {
                    defaultStyle = style;  // Set to the style with "default": true
                }
            });

            // Populate the <select> element with new styles only if it hasn't been done yet
            const styleSelect = document.getElementById('styleSelect');
            if (styleSelect && styleSelect.options && styleSelect.options.length === 0) {
                // Only populate if no options have been populated yet
                console.log('Populating styleSelect for the first time');
                populateSelectOptions('styleSelect', styles);
            } else if (!styleSelect) {
                console.error('styleSelect element not found');
            } else {
                console.log('StyleSelect already populated, skipping repopulation');
            }

      // Set the dropdown to the default style
      const selectedSpan = document.getElementById('selectedStyle');
      if (selectedSpan) {
        selectedSpan.textContent = defaultStyle; // Set the default style text
        selectedSpan.setAttribute('data-value', defaultStyle);
      }

      // Apply the default style to the new model
      applyPresetMaterialColors(defaultStyle);
      updateMaterials(); // Apply the materials

            // Reapply custom dropdown logic
            initializeDropdowns();  // Ensure custom dropdown logic is reapplied
            setupEventListeners(); // Ensure listeners are reapplied
        })
        .catch(error => console.error('Error loading color options:', error));
}




export function waitForMaterialListToLoad() {
    return new Promise((resolve, reject) => {
        const materialList = document.getElementById('styleSelect');

        function checkMaterialList() {
            if (materialList && materialList.children.length > 0) {
                resolve();
            } else {
                setTimeout(checkMaterialList, 100);
            }
        }

        checkMaterialList();
    });
}


export function displayMainImage(imageUrl, index) {
    const mainwrapper = document.getElementById('main-product-img-wrapper');
    const mainImg = document.getElementById('main-product-img');
    const threeContainer = document.getElementById('three-container');

    currentImageIndex = index;  // Set the current image index
    mainImg.src = imageUrl;  // Set the large image source
    mainImg.style.display = 'flex';  // Show the large image
    threeContainer.style.visibility = 'hidden';  // Hide the 3D model container
    threeContainer.style.pointerEvents = 'none';  // Disable 3D model interaction
}

export function updateProductDetails(product) {
    loadThumbnails(product.thumbnails);
    document.getElementById('productDescription').querySelector('h1').textContent = product.title;
    document.getElementById('productDescription').querySelector('p').textContent = product.description;
}

export function loadProductDetails(productFile) 
{
    resetMaterialListPosition(); 
    return fetch(productFile)
        .then(response => response.json())
        .then(data => {
            // Update product information (Title, Description)
            updateProductDetails(data);
            loadThumbnails(data.thumbnails);

            // Load the 3D model for the product
            loadModel(data.model, data.materialOptions, () => {
                if (isModelLoaded && model) {
                    // Ensure materials are applied after the model is fully loaded
                    fetchColorOptions(data.colorOptions).then(() => {
                        // Apply the selected preset after the model is loaded
                        const style = document.getElementById('styleSelect').value;
                        if (style) {
                            applyPresetMaterialColors(style);
                        }
                        // Now that the model is loaded, apply any saved customizations
                        loadCurrentProductState();

                        // Ensure the materials are updated after customization
                        updateMaterials()
                            .then(() => {
                                // Call to display the materials in the list after options are available
                                displayMaterialOptions();
                            }).catch((error) => {
                                console.error('Error fetching color options:', error);
                            });
                    })
                }
            });

            // Populate the dropdown for style presets (optional)
            if (data.colorOptions) {
                // Fetch the material options file (JSON)
                fetch(data.colorOptions)
                    .then(response => response.json())
                    .then(materialData => {
                        // Extract the style names (keys from the materialData)
                        const styles = Object.keys(materialData);
            
                        // Pass the styles to the populateSelectOptions function
                        populateSelectOptions('styleSelect', styles, false, '/images/coats/');
            
                        // Optionally, ensure dropdown logic is reapplied
                      //  initializeDropdowns();  // Reinitialize custom dropdowns if needed
                    })
                    .catch(error => console.error('Error loading materials:', error));
            }
            

            setupEventListeners();
        })
        .catch(error => console.error('Error loading product details:', error));
}

