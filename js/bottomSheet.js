document.addEventListener('DOMContentLoaded', function() {
    const bottomSheet = document.getElementById('bottomSheet');
    const bottomSheetContent = document.getElementById('bottomSheetContent');
    const closeBtn = document.getElementById('closeBtn');
    const scrim = document.getElementById('scrim');
    const infoIcons = document.querySelectorAll('.info-icon');

    infoIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const infoId = this.getAttribute('data-info');
            showBottomSheet(infoId);
        });
    });

    bottomSheet.addEventListener('click', function(event) {
        if (event.target === bottomSheet) {
            hideBottomSheet();
        }
    });

    scrim.addEventListener('click', function() {
        hideBottomSheet();
    });

    closeBtn.addEventListener('click', function() {
        hideBottomSheet();
    });

    function fetchHTMLContent(url) {
        return fetch(url)
            .then(response => response.text())
            .catch(error => {
                console.error('Error fetching the HTML:', error);
                return '<h2>Information</h2><p>Sorry, an error occurred while fetching the content.</p>';
            });
    }

    function showBottomSheet(infoId) {
        let contentUrl = '';

        switch(infoId) {
            case 'battle-damage-info':
                contentUrl = '/content-modules/battle-damage-info.html';
                break;
            case 'finishing-quality-info':
                contentUrl = '/content-modules/finishing-quality-info.html';
                break;
            case 'movable-components-info':
                contentUrl = '/content-modules/movable-components-info.html';
                break;
            case 'leds-info':
                contentUrl = '/content-modules/leds-info.html';
                break;
            case 'removable-accessories-info':
                contentUrl = '/content-modules/removable-accessories-info.html';
                break;
            case 'touch-screen-info':
                contentUrl = '/content-modules/touch-screen-info.html';
                break;
            default:
                contentUrl = '';
        }

        if (contentUrl) {
            fetchHTMLContent(contentUrl).then(htmlContent => {
                bottomSheetContent.innerHTML = htmlContent;
                bottomSheetContent.appendChild(closeBtn); // Append the close button again after loading content
                bottomSheet.classList.add('show');
                scrim.style.display = 'block'; // Show the scrim
            });
        } else {
            bottomSheetContent.innerHTML = '<h2>Information</h2><p>No additional details available.</p>';
            bottomSheetContent.appendChild(closeBtn); // Append the close button again after loading content
            bottomSheet.classList.add('show');
            scrim.style.display = 'block'; // Show the scrim
        }
    }

    function hideBottomSheet() {
        bottomSheet.classList.remove('show');
        scrim.style.display = 'none'; // Hide the scrim
    }
});
