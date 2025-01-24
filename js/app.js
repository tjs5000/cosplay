import { fetchPresets, fetchCustomContent, fetchHTMLContent } from './fetchData.js';
import { updateCarousel, updateCustomContent } from './updateDOM.js';
import { initScene, initCamera, initRenderer, initControls, initLighting, loadModel, applyPresetMaterialColors, updateMaterials, applyDamageTexture, updateDamageTexture, updateQuality, materialsData } from './model-handler.js';
import { saveCurrentDesign } from './saveDesign.js';
import { loadDesign } from './loadDesigns.js';

document.addEventListener('DOMContentLoaded', async function () {
    const navItems = document.querySelectorAll('.nav-item');
    const tabs = document.querySelectorAll('.nav-tab');
    const carousel = document.getElementById('presetsContent');
    const backButton = document.querySelector('.back-button');
    const homeButton = document.getElementById('home');
    const armorButton = document.getElementById('armor');
    const weaponsButton = document.getElementById('weapons');
    const designsButton = document.getElementById('designs');
    const saveButton = document.getElementById('saveDesigns');
    const cartButton = document.querySelector('.cart-button');
    const moreButton = document.getElementById('more');
    const visualsContent = document.getElementById('visualsContent');
    const addonsContent = document.getElementById('addonsContent');
    const customContent = document.getElementById('customContent');
    const optionsContainer = document.getElementById('optionsContainer');
    

    const jsonFilePath = '/data/mk50_materials.json';
    const modelPath = '/models/MK50_Sidekick.glb';
    const defaultTab = document.querySelector('.nav-tab[data-content="presets"]');

    let content = defaultTab;

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

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            content = tab.getAttribute('data-content');
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
        newContent.classList.add('slide-in', 'active');
        newContent.addEventListener('animationend', function () {
            newContent.classList.remove('slide-in');
        }, { once: true });
    
        // Update container height
        optionsContainer.style.height = `${newContent.scrollHeight}px`;
    
        // Update content based on the selected tab
        if (content === 'presets') {
            fetchPresets(jsonFilePath).then(data => updateCarousel(carousel, data));
        } else if (content === 'custom') {
            fetchCustomContent(jsonFilePath).then(data => updateCustomContent(customContent, data["Standard Issue"].colors));
        } else if (content === 'visuals') {
            // Handle visuals content update here if needed
        } else if (content === 'addons') {
            // Handle add-ons content update here if needed
        }
    }

        /* // Animate current content out
        activeContent.classList.add('slide-out');
        console.log('Added slide-out to active content:', activeContent);

        activeContent.addEventListener('animationend', function handleAnimationEnd() {
            console.log('Animation ended for:', activeContent);
            activeContent.classList.remove('slide-out', 'active');
            activeContent.style.display = 'none';

            let contentHeight = 0;

            const newContent = document.getElementById(`${content}Content`);
            newContent.style.display = 'flex';
            newContent.classList.add('slide-in', 'active');
            console.log('Added slide-in to new content:', newContent);
            optionsContainer.style.height = `${newContent.scrollHeight}px`; 
            
            newContent.addEventListener('animationend', function () {
                newContent.classList.remove('slide-in');
                console.log('Removed slide-in from new content:', newContent);
            }, { once: true });

            optionsContainer.style.height = `${newContent.scrollHeight}px`;

            if (content === 'presets') {
                fetchPresets(jsonFilePath).then(data => updateCarousel(carousel, data));
            } else if (content === 'custom') {
                fetchCustomContent(jsonFilePath).then(data => updateCustomContent(customContent, data["Standard Issue"].colors));
            }
        }, { once: true });
    } */

    // Add event listener for Battle Damage slider
    const battleDamageSlider = document.getElementById('battle-damage-slider');
    const battleDamageValue = document.getElementById('battle-damage-value');
    battleDamageSlider.addEventListener('input', function () {
        const damageLevels = ['new', 'minimal', 'moderate', 'heavy', 'extreme'];
        const damageLevel = damageLevels[battleDamageSlider.value];
        battleDamageValue.textContent = damageLevel.charAt(0).toUpperCase() + damageLevel.slice(1);
        updateDamageTexture(damageLevel);
    });

    // Add event listener for Battle Damage slider
    const qualitySlider = document.getElementById('finishing-quality-slider');
    const qualityValue = document.getElementById('finishing-quality-value');
    qualitySlider.addEventListener('input', function () {
        const qualityLevels = ['Print Only', 'Basic', 'Standard', 'High'];
        const qualityLevel = qualityLevels[qualitySlider.value];
        qualityValue.textContent = qualityLevel.charAt(0).toUpperCase() + qualityLevel.slice(1);
        updateDamageTexture(qualityLevel);

    });

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

battleDamageSlider.addEventListener('input', function () {
    const damageLevels = ['new', 'minimal', 'moderate', 'heavy', 'extreme'];
    const damageLevel = damageLevels[battleDamageSlider.value];
    battleDamageValue.textContent = damageLevel.charAt(0).toUpperCase() + damageLevel.slice(1);
    updateDamageTexture(damageLevel);
});



    backButton.addEventListener('click', function () {
        alert('Back button clicked');
    });

    homeButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    armorButton.addEventListener('click', function () {
        alert('Armor Catalog button clicked');
    });

    weaponsButton.addEventListener('click', function () {
        alert('Weapons Catalog button clicked');
    });

    designsButton.addEventListener('click', () => {
    window.location.href = 'myDesigns.html';
  });

    moreButton.addEventListener('click', function () {
        alert('More Menu button clicked');
    });

    cartButton.addEventListener('click', function () {
        alert('Cart button clicked');
    });


    saveButton.addEventListener('click', saveCurrentDesign);



});