import { fetchPresets, fetchCustomContent } from './fetchData.js';
import { updateCarousel, updateCustomContent, applyPresetColors, updateSwatchColors } from './updateDOM.js';
import { initScene, initCamera, initRenderer, initControls, initLighting, loadModel, applyPresetMaterialColors, updateDamageTexture, materialsData  } from './model-handler.js';
import { saveCurrentDesign } from './saveDesign.js';
import { loadDesign } from './loadDesigns.js';

export async function initializeModelEditor(modelSrc = 'MK50_Sidekick.glb', jsonSrc = 'mk50_materials.json') {
    if (document.querySelector('.product-title')) {
        const tabs = document.querySelectorAll('.nav-tab');
        const carousel = document.getElementById('presetsContent');
        const saveButton = document.getElementById('saveDesigns');
        const visualsContent = document.getElementById('visualsContent');
        const addonsContent = document.getElementById('addonsContent');
        const customContent = document.getElementById('customContent');
        const optionsContainer = document.getElementById('optionsContainer');

        const jsonFilePath = '/data/materials/' + jsonSrc;
        const modelPath = '/models/' + modelSrc;
        const defaultTab = document.querySelector('.nav-tab[data-content="presets"]');

        // Initialize scene, camera, renderer, controls, and lighting
        initScene();
        initCamera();
        initRenderer();
        initControls();
        initLighting();

        // Load the model and apply materials
        await loadModel(modelPath);
        fetchPresets(jsonFilePath).then(data => applyPresetMaterialColors('Standard Issue', data));

        defaultTab.classList.add('active');
        fetchPresets(jsonFilePath).then(data => updateCarousel(carousel, data));

        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const content = tab.getAttribute('data-content');
                tabs.forEach(tab => tab.classList.remove('active'));
                this.classList.add('active');
                switchContent(content);
            });
        });

        function switchContent(content) {
            let activeContent = document.querySelector('.content.active');
            if (!activeContent) {
                activeContent = carousel;
            }

            // Animate current content out
            activeContent.classList.add('slide-out');

            // Use a timeout as a fallback
            const animationTimeout = setTimeout(() => {
                handleAnimationEnd(activeContent, content);
            }, 400); // Adjust timeout duration as needed

            activeContent.addEventListener('animationend', function handleAnimationEndEvent() {
                clearTimeout(animationTimeout);
                handleAnimationEnd(activeContent, content);
                activeContent.removeEventListener('animationend', handleAnimationEndEvent);
            });
        }

        function handleAnimationEnd(activeContent, content) {
            activeContent.classList.remove('slide-out', 'active');
            activeContent.style.display = 'none';

            // Show the new content
            const newContent = document.getElementById(`${content}Content`);
            newContent.style.display = 'flex';
            newContent.classList.add('slide-in');
            newContent.classList.add('active');
            newContent.addEventListener('animationend', function () {
                newContent.classList.remove('slide-in');
            }, { once: true });

            // Update container height
            optionsContainer.style.height = `${newContent.scrollHeight}px`;

            // Update content based on the selected tab
            if (content === 'presets') {
                fetchPresets(jsonFilePath).then(data => updateCarousel(carousel, data));
            } else if (content === 'custom') {
                fetchCustomContent(jsonFilePath).then(data => updateSwatchColors(customContent, data["Standard Issue"].colors));
            }
        }
        // Add event listener for sliders
        function setupSlider(sliderId, valueId, valuesArray, updateFunction) {
            const slider = document.getElementById(sliderId);
            const value = document.getElementById(valueId);
            slider.addEventListener('input', function () {
                const level = valuesArray[slider.value];
                value.textContent = level.charAt(0).toUpperCase() + level.slice(1);
                updateFunction(level);
            });
        }

        setupSlider('battle-damage-slider', 'battle-damage-value', ['new', 'minimal', 'moderate', 'heavy', 'extreme'], updateDamageTexture);
        setupSlider('finishing-quality-slider', 'finishing-quality-value', ['Print Only', 'Basic', 'Standard', 'High'], updateDamageTexture);

        // Add event listener for Presets carousel
        carousel.addEventListener('click', function (event) {
            const presetOption = event.target.closest('.carousel-item');
            if (presetOption) {
                const presetName = presetOption.getAttribute('data-preset-name');
                fetchPresets(jsonFilePath).then(data => {
                    Object.assign(materialsData, data);
                    const presetColors = data[presetName]?.colors;
                    if (presetColors) {
                        applyPresetMaterialColors(presetName);
                        applyPresetColors(presetColors);
                    }
                });
            }
        });

        // Define color variables
const colors = {
    filled: "#00bfff", // Filled segments
    empty: "#515155",    // Unfilled segments
    ticks: "#202629",   // Boundary lines
};

function updateSliderBackground(slider) {
    const max = parseInt(slider.max);
    const value = parseInt(slider.value);
    const step = 100 / max; // Width of each segment
    const filledSegments = value;

    let gradientStops = [];

    // Loop through each segment and set the color based on whether it's filled
    for (let i = 0; i <= max; i++) {
        const start = i * step;
        const end = start + step - 1;

        if (i < filledSegments) {
            // Filled segment (blue)
            gradientStops.push(`${colors.filled} ${start}%, ${colors.filled} ${end}%`);
        } else {
            // Unfilled segment (gray)
            gradientStops.push(`${colors.empty} ${start}%, ${colors.empty} ${end}%`);
        }

        // Add white boundary between segments
        if (i < max) {
            const boundaryStart = end + 1;
            gradientStops.push(`${colors.ticks} ${boundaryStart}%, ${colors.ticks} ${boundaryStart + 1}%`);
        }
    }

    // Set the background style dynamically
    slider.style.background = `linear-gradient(to right, ${gradientStops.join(", ")})`;
}

// Attach event listeners to all sliders with the class "custom-slider"
const sliders = document.querySelectorAll(".custom-slider");
sliders.forEach(slider => {
    slider.addEventListener("input", () => updateSliderBackground(slider));

    // Set initial background state
    updateSliderBackground(slider);
});

// Existing event listeners for sliders





        saveButton.addEventListener('click', saveCurrentDesign);
    }
}