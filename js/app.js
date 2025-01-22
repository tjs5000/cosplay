import { fetchPresets, fetchCustomContent, fetchHTMLContent } from './fetchData.js';
import { updateCarousel, updateCustomContent } from './updateDOM.js';
import { initScene, initCamera, initRenderer, initControls, initLighting, loadModel, applyPresetMaterialColors, updateMaterials, applyDamageTexture, updateDamageTexture, updateQuality, materialsData } from './model-handler.js';

document.addEventListener('DOMContentLoaded', async function () {
    const navItems = document.querySelectorAll('.nav-item');
    const tabs = document.querySelectorAll('.nav-tab');
    const carousel = document.getElementById('carouselContent');
    const backButton = document.querySelector('.back-button');
    const visualsContent = document.getElementById('visualsContent');
    const addonsContent = document.getElementById('addonsContent');
    const customContent = document.getElementById('customContent');
    const optionsContainer = document.getElementById('optionsContainer');

    const jsonFilePath = '/data/mk50_materials.json';
    const modelPath = '/models/MK50_Sidekick.glb';

    let content = 'presets';

    // Initialize scene, camera, renderer, controls, and lighting
    initScene();
    initCamera();
    initRenderer();
    initControls();
    initLighting();

    // Load the model and apply materials
    await loadModel(modelPath);
    fetchPresets(jsonFilePath).then(data => applyPresetMaterialColors('Standard Issue', data));

    const defaultTab = document.querySelector('.nav-tab[data-content="presets"]');
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
        const currentContent = document.querySelector('.content.active');
        const newContent = document.getElementById(`${content}Content`);

        let contentHeight = 0;

        if (content === 'presets') {
            contentHeight = carousel.scrollHeight;
        } else if (content === 'custom') {
            contentHeight = customContent.scrollHeight;
        } else if (content === 'visuals') {
            contentHeight = visualsContent.scrollHeight;
        } else if (content === 'addons') {
            contentHeight = addonsContent.scrollHeight;
        }

        // Animate current content out
        currentContent.classList.add('slide-out');
        currentContent.addEventListener('animationend', function () {
            currentContent.classList.remove('slide-out', 'active');
            currentContent.style.display = 'none';

            // Show new content and animate it in
            newContent.style.display = 'flex'; // or 'block' depending on your layout
            newContent.classList.add('slide-in', 'active');
            newContent.addEventListener('animationend', function () {
                newContent.classList.remove('slide-in');
                optionsContainer.style.height = `${contentHeight}px`; // Update height after animation
            }, { once: true });
        }, { once: true });

        if (content === 'presets') {
            fetchPresets(jsonFilePath).then(data => updateCarousel(carousel, data));
        } else if (content === 'custom') {
            fetchCustomContent(jsonFilePath).then(data => updateCustomContent(customContent, data["Standard Issue"].colors));
        }
    }

    backButton.addEventListener('click', function () {
        alert('Back button clicked');
    });

    // Add event listener for Battle Damage slider
    const battleDamageSlider = document.getElementById('battle-damage-slider');
    const battleDamageValue = document.getElementById('battle-damage-value');
    battleDamageSlider.addEventListener('input', function () {
        const damageLevels = ['new', 'minimal', 'moderate', 'heavy', 'extreme'];
        const damageLevel = damageLevels[battleDamageSlider.value];
        battleDamageValue.textContent = damageLevel.charAt(0).toUpperCase() + damageLevel.slice(1);
        updateDamageTexture(damageLevel);
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
});