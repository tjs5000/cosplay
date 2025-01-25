import { loadAndGenerateCatalog } from './loadCatalog.js';
import { reattachEventListeners } from './eventHandlers.js'

document.addEventListener('DOMContentLoaded', function () {
    let originPage = 'homeContent.html'; // Default origin page
    const navPageIds = ['home', 'armor', 'weapons', 'designs', 'contact'];

    function loadContent(page, modelPath, jsonFilePath, callback) {
        fetch(page)
            .then(response => response.text())
            .then(data => {
                document.getElementById('contentContainer').innerHTML = data;

                // Page conditional checks for attaching event listeners
                if (page === 'homeContent.html') {
                    const contactLink = document.getElementById('contact-link');
                    if (contactLink) {
                        contactLink.addEventListener('click', function () {
                            handleNavigation('contact');
                        });
                    }
                }

                if (page === 'modelEditor.html') {
                    document.querySelector('.back-button').style.display = 'block'; // Show Back button
                    import('./app.js').then(module => {
                        module.initializeModelEditor(modelPath, jsonFilePath);
                    });
                } else {
                    document.querySelector('.back-button').style.display = 'none'; // Hide Back button
                }

                // Check if the loaded content is `contact.html`
                if (page === 'contact.html') {
                    const form = document.querySelector('form');
                    if (form) {
                        form.addEventListener('submit', function (event) {
                            event.preventDefault();
                            // Handle form submission
                        });
                    } else {
                        console.error("Form not found in dynamically loaded content");
                    }
                }

                // Load the loadCatalog.js script when armorCatalog.html or weaponsCatalog.html is loaded
                if (jsonFilePath) {
                    loadAndGenerateCatalog(jsonFilePath, '.catProductContainer');
                    if (typeof callback === 'function') {
                        callback();
                    }
                } else {
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
                reattachEventListeners();
            })
            .catch(error => console.error('Error loading content:', error));
    }

    // Make loadContent globally accessible
    window.loadContent = loadContent;

    function handleNavigation(pageId) {
        const page = pageId === 'home' ? 'homeContent.html' :
            pageId === 'armor' ? 'armorCatalog.html' :
                pageId === 'weapons' ? 'weaponsCatalog.html' :
                    pageId === 'designs' ? 'myDesigns.html' :
                        pageId === 'contact' ? 'contact.html' :
                            pageId === 'cart' ? 'cart.html' :
                                pageId === 'sent' ? 'sentContent.html' :
                                    pageId === 'error' ? 'errorContent.html' :
                                        'homeContent.html';
        const jsonFilePath = pageId === 'armor' ? '/data/armor_products.json' :
            pageId === 'weapons' ? '/data/weapon_products.json' : null;

        originPage = page;
        loadContent(page, null, jsonFilePath);

        // Update the URL
        const newUrl = `${window.location.origin}${window.location.pathname}?c=${pageId}`;
        window.history.pushState({ page: pageId }, '', newUrl);
        if (navPageIds.includes(pageId)) {
            navButtons.forEach(nav => nav.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
        }
    }

    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            handleNavigation(button.id);

            // Remove "active" class from all nav items
            navButtons.forEach(nav => nav.classList.remove('active'));
            // Add "active" class to the clicked nav item
            button.classList.add('active');
        });
    });

    document.getElementById('contentContainer').addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('catProduct')) {
            const modelPath = event.target.getAttribute('data-model');
            const jsonFilePath = event.target.getAttribute('data-json');
            loadContent('modelEditor.html', modelPath, jsonFilePath);
        }
    });

    // Back button event listener
    document.querySelector('.back-button').addEventListener('click', function () {
        loadContent(originPage); // Navigate back to the origin page
    });

    // Function to parse query parameters
    function getQueryParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const queries = queryString.split("&");
        queries.forEach(query => {
            const [key, value] = query.split("=");
            params[key] = value;
        });
        return params;
    }

    // Handle deep-linking on page load
    const queryParams = getQueryParams();
    if (queryParams.c) {
        handleNavigation(queryParams.c);
    } else {
        loadContent('homeContent.html');
        document.getElementById('home').classList.add('active');
    }

    // Handle back and forward browser navigation
    window.addEventListener('popstate', function (event) {
        if (event.state && event.state.page) {
            handleNavigation(event.state.page);
        } else {
            loadContent('homeContent.html');
            document.getElementById('home').classList.add('active');
        }
    });
});