document.addEventListener('DOMContentLoaded', function () {
    function loadContent(page, modelPath, jsonFilePath) {
        fetch(page)
            .then(response => response.text())
            .then(data => {
                document.getElementById('contentContainer').innerHTML = data;
                if (page === 'modelEditor.html') {
                    import('./app.js').then(module => {
                        module.initializeModelEditor(modelPath, jsonFilePath);
                    });
                }
            })
            .catch(error => console.error('Error loading content:', error));
    }

    // Make loadContent globally accessible
    window.loadContent = loadContent;

    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const page = button.id === 'home' ? 'homeContent.html' : 
                         button.id === 'armor' ? 'armorCatalog.html' : 
                         button.id === 'weapons' ? 'weaponsCatalog.html' : 
                         button.id === 'designs' ? 'myDesigns.html' : 
                         button.id === 'more' ? 'moreContent.html' : 
                         button.id === 'cart' ? 'cart.html' : 
                         'homeContent.html';
            loadContent(page);
        });
    });
    document.getElementById('contentContainer').addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('catProduct')) {
            const modelPath = event.target.getAttribute('data-model');
            const jsonFilePath = event.target.getAttribute('data-json');
            loadContent('modelEditor.html', modelPath, jsonFilePath);
        }
    });

    // Load the default page
    loadContent('homeContent.html');
});