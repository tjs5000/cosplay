import { fetchPresets, fetchCustomContent, fetchHTMLContent } from './fetchData.js';
import { updateCarousel, updateCustomContent } from './updateDOM.js';
import { initScene, initCamera, initRenderer, initControls, initLighting, loadModel, applyPresetMaterialColors, updateMaterials, applyDamageTexture, updateDamageTexture, updateQuality } from './model-handler.js';

document.addEventListener('DOMContentLoaded', async function () {
    const navItems = document.querySelectorAll('.nav-item');
    const tabs = document.querySelectorAll('.nav-tab');
    const carousel = document.getElementById('carousel');
    const backButton = document.querySelector('.back-button');
    const visualsContent = document.getElementById('visuals-content');
    const addonsContent = document.getElementById('addons-content');
    const customContent = document.getElementById('custom-content');
    const optionsContainer = document.getElementById('optionsContainer');

    const jsonFilePath = '/data/mk50_materials.json';
    const modelPath = '/models/MK50_Sidekick.glb';

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
            const content = tab.getAttribute('data-content');
            tabs.forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');
            visualsContent.style.display = 'none';
            addonsContent.style.display = 'none';
            customContent.style.display = 'none';
            carousel.style.display = 'none';
            if (content === 'presets') {
                fetchPresets(jsonFilePath).then(data => updateCarousel(carousel, data));
                carousel.style.display = 'flex';
            } else if (content === 'custom') {
                fetchCustomContent(jsonFilePath).then(data => updateCustomContent(customContent, data["Standard Issue"].colors));
                customContent.style.display = 'flex';
            } else if (content === 'visuals') {
                visualsContent.style.display = 'block';
            } else if (content === 'addons') {
                addonsContent.style.display = 'block';
            }
            adjustContainerHeight();
        });
    });

    backButton.addEventListener('click', function () {
        alert('Back button clicked');
    });

    function adjustContainerHeight() {
        const activeContent = document.querySelector('.nav-tab.active').getAttribute('data-content');
        let contentHeight = 0;

        if (activeContent === 'presets') {
            contentHeight = carousel.scrollHeight;
        } else if (activeContent === 'custom') {
            contentHeight = customContent.scrollHeight;
        } else if (activeContent === 'visuals') {
            contentHeight = visualsContent.scrollHeight;
        } else if (activeContent === 'addons') {
            contentHeight = addonsContent.scrollHeight;
        }

        optionsContainer.style.height = `${contentHeight}px`;
    }

    // Adjust container height initially
    adjustContainerHeight();

        // Add event listener for Battle Damage slider
        const battleDamageSlider = document.getElementById('battle-damage-slider');
        battleDamageSlider.addEventListener('input', function () {
            const damageLevels = ['new', 'minimal', 'moderate', 'heavy', 'extreme'];
            const damageLevel = damageLevels[battleDamageSlider.value];
            updateDamageTexture(damageLevel);
        });
});