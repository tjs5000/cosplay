//model-handler.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { fetchColorOptions } from './product-handler.js'; // Assuming this is a relative path
import * as Pickr from 'https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/pickr.min.js';


export let scene, camera, renderer, controls;
export let materialsData = {};
export const originalMaterialColors = {};
export let printOnlyState = false;
export let model = null;
export let resizeListenerAdded = false; // Track whether resize listener has been added

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let hotspotObjects = [];
let isRotating = true;
let rotationTimeout; // Store the timeout ID globally
export let isModelLoaded = false; // Track if the model is loaded

// Scene Initialization
export function initScene() {
  scene = new THREE.Scene();
  scene.background = null; // Transparent background
}

// Camera Initialization
export function initCamera() {
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(-20, 0, 550);
}

// Renderer Initialization
export function initRenderer() {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, precision: 'highp', depth: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.5;
  renderer.physicallyCorrectLights = true;

  // Get the size of the #three-container and set the renderer size accordingly
  const container = document.getElementById('three-container');
  if (!container) {
    console.error('Container element with id "three-container" not found.');
    return;
  }
  renderer.setSize(container.clientWidth, container.clientHeight);  // Set size to match parent

  document.getElementById('three-container').appendChild(renderer.domElement);

  // Ensure the scene continuously updates
  //renderLoop();
  animate();
  resizeRenderer();
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeRenderer();
      if (isModelLoaded && model) {
        adjustCameraToFitObject(model); // Adjust camera only if the model is loaded
      } else {
        console.warn("Model not loaded or unavailable during resize.");
      }
    }, 100);
  });

  // Pause rotation on click, tap, or swipe
  container.addEventListener('click', () => handlePauseRotation());

  // Listen for touch events (tapping or swiping)
  container.addEventListener('touchstart', () => handlePauseRotation());
  container.addEventListener('touchmove', () => handlePauseRotation());
  container.addEventListener('touchend', () => handlePauseRotation());

  // Function to pause auto-rotation for 30 seconds
  function handlePauseRotation() {
    console.log('Event type:', event.type);
    console.log('Is rotating:', isRotating);
    if (rotationTimeout) {
      clearTimeout(rotationTimeout);
    }
    isRotating = false;
    rotationTimeout = setTimeout(() => {
      isRotating = true;
    }, 30000);
  }

  // Initialize OrbitControls
  initControls()
}

// Animation loop
export function animate() {
  requestAnimationFrame(animate);
  // Ensure controls are initialized before updating
  if (controls) {
    controls.autoRotate = isRotating;
    controls.update();  // Smoothly update camera controls
  }

  renderer.render(scene, camera);  // Render the scene
}

function waitForModelToLoad(callback) {
  if (isModelLoaded) {
    callback();  // If the model is loaded, execute the callback (applyPresetMaterialColors)
  } else {
    setTimeout(() => {
      // console.log("Waiting for model to load...");
      waitForModelToLoad(callback);  // Retry after 100ms
    }, 100);  // Wait 100ms and check again
  }
}

export function resizeRenderer() {
  const container = document.getElementById('three-container');
  const width = container.clientWidth;
  const height = container.clientHeight;

  container.style.height = `${height}px`;  // Set the height of the container dynamically
  renderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// Lighting Setup
export function initLighting() {
  const lights = [
    { type: 'DirectionalLight', color: 0xffffff, intensity: 1, position: [10, 20, 30], castShadow: false },
    { type: 'DirectionalLight', color: 0xffffff, intensity: 0.6, position: [-10, 10, 20], castShadow: false },
    { type: 'SpotLight', color: 0xeeeeff, intensity: 0.6, position: [100, -400, -180], castShadow: true },
    { type: 'DirectionalLight', color: 0xffffff, intensity: 1.0, position: [10, 20, -30], castShadow: false },
    { type: 'DirectionalLight', color: 0xffffff, intensity: 0.6, position: [-10, 10, -20], castShadow: false },
    { type: 'SpotLight', color: 0x3f6877, intensity: 0.6, position: [100, 400, 180], castShadow: true }
  ];

  lights.forEach((lightData) => {
    const light = new THREE[lightData.type](lightData.color, lightData.intensity);
    light.position.set(...lightData.position);
    light.castShadow = lightData.castShadow;
    scene.add(light);
  });

  scene.add(new THREE.AmbientLight(0x3f6877, 0.9));
}

// Controls Initialization
export function initControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.5;
  controls.maxPolarAngle = Math.PI / 2;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.maxDistance = 900;
  if (isRotating) {
    controls.autoRotate = true;
  }
  controls.enablePan = true; // Enable panning
  controls.enableZoom = true; // Enable zooming
  controls.touchZoomRotate = true; // Enable touch zoom and rotate
  controls.minDistance = .05;
}

// Function to adjust the camera to fit the object
export function adjustCameraToFitObject(object) {
  if (!object || !(object instanceof THREE.Object3D)) {
    console.error('Invalid object passed to adjustCameraToFitObject');
    return;
  }

  const box = new THREE.Box3().setFromObject(object); // Calculate the bounding box
  const size = box.getSize(new THREE.Vector3()); // Get the size of the object
  const center = box.getCenter(new THREE.Vector3()); // Get the center of the object

  // Calculate the distance required to fit the object within the camera's view
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180); // Convert vertical FOV to radians
  const cameraDistance = Math.abs(maxDim / (2 * Math.tan(fov / 2)));

  // Adjust the camera position based on the object's size and center
  camera.position.set((center.x + 100), (center.y + 150), (center.z + 100) + cameraDistance * 1.5); // Adjust multiplier as needed
  camera.lookAt(center);

  // Update camera's projection matrix after resizing or repositioning
  camera.updateProjectionMatrix();
}

// Load 3D Model
export function loadModel(modelPath, materialPath, onLoadCallback) {
  return new Promise((resolve, reject) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

    // If there's an existing model in the scene, remove it
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
      model = null; // Clear the old model reference
      isModelLoaded = false; // Reset the loading state
    }

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // Load the new model
    loader.load(modelPath, function (gltf) {
      model = gltf.scene;
      model.scale.set(1, 1, 1);  // Model scale
      model.position.set(0, 30, 0);  // Model position
      model.updateWorldMatrix(true, true);  // Force update world matrix

      model.traverse(function (child) {
        if (child.isMesh && child.material.name) {
          originalMaterialColors[child.material.name] = child.material.color.getHexString();
        }
      });

      scene.add(model);  // Add the model to the scene
      isModelLoaded = true;  // Mark model as loaded

      adjustCameraToFitObject(model);  // Adjust the camera after the model is loaded

      // Optional Callback
      if (onLoadCallback) {
        onLoadCallback();  // Apply additional processing after model loads
      }

      // Apply damage textures (if needed)
      applyDamageTexture(noDamageTexture);
      // Add the resize event listener if it hasn't been added already
      if (!resizeListenerAdded) {
        window.addEventListener('resize', () => {
          if (isModelLoaded) {
            adjustCameraToFitObject(model);
          }
        });
        resizeListenerAdded = true; // Prevent adding the listener multiple times
      }

      resolve();  // Resolve after the model is loaded
    }, undefined, function (error) {
      console.error('Error loading model:', error);
      reject(error);  // Reject if model loading fails
    });

    // Load material options if materialPath is provided
    if (materialPath) {
      fetchColorOptions(materialPath)
        .then(() => {
          materialsData = data; // Assign fetched data to materialsData
          console.log('Materials data loaded:', materialsData); // Debugging statement
          resolve();  // Resolve after materials are applied
        })
        .catch(error => {
          console.error('Error loading materials:', error);
          reject(error);
        });
    } else {
      // Resolve the promise if no materialPath is provided
      resolve();
    }
  });
}

export function updateMaterials() {

  return new Promise((resolve, reject) => {
    try {
      const selectedStyle = document.getElementById('selectedStyle');
      if (!selectedStyle) {
        reject('selectedStyle element not found!');
        return;
      }
      let style = "Standard Issue";

      if (selectedStyle.innerHTML !== null) {
        style = selectedStyle.innerHTML;
      };
      const qualitySelect = document.getElementById('selectedQuality');
      const materialList = document.getElementById('materialList');
      const saveBtns = document.getElementById('saveBtns');
      const productContent = document.querySelector('.product-content');

      if (!isModelLoaded) {
        console.warn('updateMaterials: Model is not loaded yet. Cannot update materials.');
        reject('Model is not loaded yet. Cannot update materials.');  // Reject if model is not loaded
        return;
      }

      // Handle Print Only selection
      let quality = qualitySelect.getAttribute('data-value');
      if (quality === 'printonly') {
        printOnlyState = true;
        applyNoPaintTexture();
      }

      // Clear Print Only texture if not using Print Only
      if (quality !== 'printonly' && printOnlyState) {
        printOnlyState = false;
        clearPrintOnlyTexture();
      }


      if (!style || !materialsData[style]) {
        console.log(style, " : ", materialsData);
        console.error(`**** Materials for style '${style}' not found.`);
        reject(`Materials for style '${style}' not found.`);  // Reject if materials not found
        return;
      }
      // Apply custom materials or preset materials
      if (style === 'Custom') {
        materialList.style.display = 'flex';
        saveBtns.style.display = 'flex';
        productContent.classList.add('customize-layout');
        displayMaterialOptions();
        // console.log("Custom Material");
      } else {
        materialList.style.display = 'none';
        saveBtns.style.display = 'none';
        productContent.classList.remove('customize-layout');

        // console.log("Preset Material");

        // Apply materials immediately if the model is loaded
        if (isModelLoaded) {
          applyPresetMaterialColors(style);
          updateDamageTexture();
        } else {
          waitForModelToLoad(() => applyPresetMaterialColors(style));  // Wait and then apply the materials
        }
      }
      resolve();  // Resolve the promise when done
    } catch (error) {
      reject(error);  // Reject the promise if an error occurs
    }
  });
}


export function applyPresetMaterialColors(style) {
  if (!model) {
    console.error('Model not loaded yet. Cannot apply preset material colors.');
    return;
  }
  if (!materialsData[style]) {
    console.error(`**** Materials for style '${style}' not found.`);
    console.log('Current materialsData:', materialsData); // Debugging statement
    return;
  }

  if (!isModelLoaded) {
    console.error('Model is not loaded yet. Cannot apply materials.');
    return;
  }

  // console.log(`Applying colors for style: ${style}`);

  // Traverse the model and apply the material colors
  model.traverse((child) => {
    if (child.isMesh) {
      const materialName = child.material.name;
      const color = materialsData[style]?.colors[materialName];

      if (color) {
        child.material.color.set(color);  // Apply the color
        child.material.needsUpdate = true;  // Ensure the material updates
        // // console.log(`Applied color ${color} to material ${materialName}`);
      } else {
        console.warn(`**** No color found for material: ${materialName}`);
      }
    }
  });
}



/*   export function changeMaterialColor(materialName, color) {
    if (!model) return;
  
    model.traverse((child) => {
        if (child.isMesh && child.material.name === materialName) {
            child.material.color.set(color);
        }
    });
  } */
export function changeMaterialColor(materialName, hexColor) {
  if (!model) return;
  model.traverse((child) => {
    if (child.isMesh && child.material && child.material.name === materialName) {
      const color = new THREE.Color(hexColor);
      child.material.color.set(color);
      child.material.needsUpdate = true;
  }
  });
}

export function applyNoPaintStyle() {
  const styleSelectContainer = document.querySelector('#styleSelect-container');
  const noPaintOption = styleSelectContainer.querySelector('.option[data-value="No Paint"]');
  const activeOption = styleSelectContainer.querySelector('.option.active');
  const newStyle = document.querySelector('#selectedStyle');

  if (noPaintOption) {
    if (activeOption) {
      // activeOption.classList.remove('active');
    }

    // Add the active class to the "No Paint" option and update the span
    //noPaintOption.classList.add('active');
    newStyle.setAttribute('data-value', 'No Paint');
    newStyle.innerHTML = 'No Paint';
  }
}


export function applyNoPaintTexture() {
  if (!model) {
    console.error('Model is not loaded or undefined.');
    return;
  }

  printOnlyState = true;

  // Apply the texture specifically for the "No Paint" style
  const textureLoader = new THREE.TextureLoader();
  const noPaintTexture = textureLoader.load('/models/textures/printed.png', (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 1);

    model.traverse((child) => {
      if (child.isMesh) {
        child.material.map = texture;  // Apply texture to the material
        child.material.bumpMap = texture;
        child.material.bumpScale = 0.1;
        child.material.transparent = false;
        child.material.needsUpdate = true;
      }
    });
  });

  // Call the function that updates the UI to make "No Paint" active
  applyNoPaintStyle();
}


export function clearPrintOnlyTexture() {
  // console.log('HELLO ---  clearPrintOnlyTexture');
  printOnlyState = false;
  // Check if the model is defined before traversing it
  if (!model) {
    console.error('Model is not loaded or undefined.');
    return;
  }
  model.traverse((child) => {
    if (child.isMesh) {
      child.material.map = null;  // Clear the texture map
      child.material.bumpMap = null;  // Clear the bump map
      child.material.needsUpdate = true;  // Ensure the material updates
    }
  });
}

export function displayMaterialOptions() {
  const materialList = document.getElementById('materialList');
  materialList.innerHTML = ''; 
  const encounteredMaterials = new Set(); 
  const materialsArray = []; 
  let materialName = null;

  if (!model) return;

  model.traverse((child) => {
      if (child.isMesh && child.material) {
          materialName = child.material.name;
          if (!materialName || encounteredMaterials.has(materialName)) return;
          encounteredMaterials.add(materialName);
          materialsArray.push(materialName);
      }
  });

  materialsArray.sort((a, b) => a.localeCompare(b));

  materialsArray.forEach((materialName) => {
      const currentColor = getMaterialColorFromPresetOrCurrent(materialName);
      const transparentColor = hexToRGBA(currentColor, 0.4);

      const materialDiv = document.createElement('div');
      materialDiv.classList.add('material-item');

      const label = document.createElement('label');
      label.classList.add('material-label');
      label.innerText = materialName;

      materialDiv.style.backgroundColor = transparentColor;

      materialDiv.appendChild(label);
      materialList.appendChild(materialDiv);
  });
}

/**
* Function to convert hex color to RGBA with a specified alpha value.
* @param {string} hex - The hex color (e.g., "#ff0000").
* @param {number} alpha - The alpha value for transparency (0 to 1).
* @returns {string} - The RGBA color string (e.g., "rgba(255, 0, 0, 0.4)").
*/
function hexToRGBA(hex, alpha) {
  // Remove the "#" if it's there
  hex = hex.replace(/^#/, '');

  // Parse r, g, b values from hex string
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Return the RGBA string with the alpha value
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}




/**
* This function retrieves the material color either from the selected preset or the current state.
*/
function getMaterialColorFromPresetOrCurrent(materialName) {
  const style = document.getElementById('styleSelect').value;

  // If the style is a preset (like 'Metal'), retrieve the preset color
  if (materialsData[style] && materialsData[style].colors && materialsData[style].colors[materialName]) {
    let color = materialsData[style].colors[materialName];

    // Ensure the color starts with a single `#`
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      console.error(`**** Invalid color format for ${materialName}: ${color}`);
      return '#ffffff'; // Default to white in case of invalid hex
    }
    // console.log(`getPreset --- Material: ${materialName}, Color: ${color}`);
    return color;
  }

  // Otherwise, get the current material color from the model
  const material = getModelMaterial(materialName);
  return material ? material.color.getHexString() : '#333333';  // Return the current color or default to gray
}

/**
* Helper function to get a material object from the 3D model by its name.
*/
function getModelMaterial(materialName) {
  let foundMaterial = null;
  model.traverse((child) => {
    if (child.isMesh && child.material && child.material.name === materialName) {
      foundMaterial = child.material;
    }
  });
  return foundMaterial;
}

/**
 * Function to reset the material color back to its original preset color.
 * @param {string} materialName - The name of the material.
 * @param {object} colorPicker - The Pickr instance.
 * @param {string} originalColor - The original preset color.
 */
function resetMaterialColor(materialName, colorPicker, originalColor) {
  // Reset the material color in the 3D model
  changeMaterialColor(materialName, originalColor);

  // Reset the color in the Pickr color picker
  colorPicker.setColor(originalColor);
}


export function toggleMaterialSelection(materialName) {
  const colorInput = document.getElementById(`color-${materialName}`);
  const checkbox = document.getElementById(`check-${materialName}`);
  if (checkbox.checked) {
    colorInput.style.display = 'inline-block';
  } else {
    colorInput.style.display = 'none';
    resetMaterialToOriginalColor(materialName);
  }
}




// Load textures for damage levels
export let noDamageTexture, minimalDamageTexture, moderateDamageTexture, heavyDamageTexture, extremeDamageTexture, noDamageBumpmap, minimalDamageBumpmap, moderateDamageBumpmap, heavyDamageBumpmap, extremeDamageBumpmap;
const textureLoader = new THREE.TextureLoader();
noDamageTexture = textureLoader.load('models/textures/no-damage.png');
noDamageBumpmap = textureLoader.load('models/textures/no-damage-bumpmap.png');

minimalDamageTexture = textureLoader.load('models/textures/minimal-damage.png');
minimalDamageBumpmap = textureLoader.load('models/textures/minimal-damage-bumpmap.png');

moderateDamageTexture = textureLoader.load('models/textures/moderate-damage.png');
moderateDamageBumpmap = textureLoader.load('models/textures/moderate-damage-bumpmap.png');

heavyDamageTexture = textureLoader.load('models/textures/heavy-damage.png');
heavyDamageBumpmap = textureLoader.load('models/textures/heavy-damage-bumpmap.png');

extremeDamageTexture = textureLoader.load('models/textures/extreme-damage.png');
extremeDamageBumpmap = textureLoader.load('models/textures/extreme-damage-bumpmap.png');

export function applyDamageTexture(texture, bumpmap) {
  model.traverse(function (child) {
    if (child.isMesh) {
      child.material.map = texture;
      child.material.bumpMap = bumpmap;
      child.material.bumpScale = 0.05;
      child.material.transparent = false;
      child.material.needsUpdate = true;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
    }
  });
}

// Handle the damage selection dropdown
export function updateDamageTexture(damageLevel = 'new') {
  const damageSelect = document.getElementById('battle-damage-slider').getAttribute('value');

  switch (damageLevel) {
    case 'new':
      applyDamageTexture(noDamageTexture, noDamageBumpmap);
      break;
    case 'minimal':
      applyDamageTexture(minimalDamageTexture, minimalDamageBumpmap);
      break;
    case 'moderate':
      applyDamageTexture(moderateDamageTexture, moderateDamageBumpmap);
      break;
    case 'heavy':
      applyDamageTexture(heavyDamageTexture, heavyDamageBumpmap);
      break;
    case 'extreme':
      applyDamageTexture(extremeDamageTexture, extremeDamageBumpmap);
      break;
    default:
      applyDamageTexture(noDamageTexture, noDamageBumpmap);
      break;
  }
}


// Handle the damage selection dropdown
export function updateQuality() {
  const qualitySelect = document.getElementById('selectedQuality').getAttribute('data-value');
  const styleSelectContainer = document.querySelector('#styleSelect-container');
  const activeStyleOption = styleSelectContainer.querySelector('.option.active');
  const noPaintOption = styleSelectContainer.querySelector('.option[data-value="No Paint"]');

  if (qualitySelect === 'printonly') {
    // If "Print Only" is selected, trigger "No Paint" style
    if (noPaintOption && activeStyleOption !== noPaintOption) {
      // Remove the active class from the currently active style option
      if (activeStyleOption) {
        activeStyleOption.classList.remove('active');
      }

      // Programmatically activate the "No Paint" option
      noPaintOption.classList.add('active');

      // Update the selected style display to show "No Paint"
      const styleSelectSpan = document.getElementById('selectedStyle');
      styleSelectSpan.setAttribute('data-value', 'No Paint');
      styleSelectSpan.innerHTML = 'No Paint';

      // Trigger the associated material update for "No Paint"
      updateMaterials();  // Ensure materials are updated
    }
  } else {
    clearPrintOnlyTexture(); // Clear any print-only textures if another quality is selected
    updateMaterials();  // Ensure materials are updated
  }
  updateDescription();
}


// Handle the damage selection dropdown
export function updateAdditionalOptions() {
  const otherOptionsSelect = document.getElementById('selectedAdditionalOptions').getAttribute('data-value');
  return
}
