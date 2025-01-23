import { fetchPresets, fetchCustomContent, fetchHTMLContent } from './fetchData.js';
import { updateCarousel, updateCustomContent } from './updateDOM.js';
import { initScene, initCamera, initRenderer, initControls, initLighting, loadModel, applyPresetMaterialColors, updateMaterials, applyDamageTexture, updateDamageTexture, updateQuality, materialsData } from './model-handler.js';

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
    }

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


    backButton.addEventListener('click', function () {
        alert('Back button clicked');
    });

    homeButton.addEventListener('click', function () {
        alert('Home button clicked');
    });

    armorButton.addEventListener('click', function () {
        alert('Armor Catalog button clicked');
    });

    weaponsButton.addEventListener('click', function () {
        alert('Weapons Catalog button clicked');
    });

    designsButton.addEventListener('click', function () {
        alert('My Designs button clicked');
    });

    moreButton.addEventListener('click', function () {
        alert('More Menu button clicked');
    });

    cartButton.addEventListener('click', function () {
        alert('Cart button clicked');
    });


    saveButton.addEventListener('click', function () {
        alert('Save Design button clicked');
    });



});