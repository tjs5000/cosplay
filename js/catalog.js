
export function loadThumbnails(thumbUrls) {
    const gallery = document.querySelector('.thumbnail-gallery');
    gallery.innerHTML = '';  // Clear current thumbnails

    thumbnails.length = 0;  // Clear the current array
    thumbnails.push(...thumbUrls);  // Add new thumbnails into the global array

    if (!thumbUrls || thumbUrls.length === 0) {
        console.error('No thumbnails found for this product.');
        return;
    }

    thumbUrls.forEach((thumbUrl, index) => {
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.classList.add('thumbnail');

        const img = document.createElement('img');
        img.src = thumbUrl;
        img.alt = `Thumbnail ${index + 1}`;

        // Ensure the event listener is correctly attached to each thumbnail
        img.addEventListener('click', () => {
            // console.log(`Thumbnail clicked: ${index}`);  // Debugging
            displayImageByIndex(index);  // Show large image when thumbnail is clicked
        });

        thumbnailDiv.appendChild(img);
        gallery.appendChild(thumbnailDiv);
    });

    // Initialize navigation for the large image after thumbnails are loaded
    initializeImageNavigation();
}

export function loadProductGallery() {
    return fetch('/data/products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Convert product data object to an array
            const productArray = Object.values(data);

            const galleryContainer = document.getElementById('product-gallery');
            if (!galleryContainer) {
                console.error('Gallery container (#product-gallery) not found.');
                return;
            }

            // Group products by their type for display
            const groupedProducts = groupByType(productArray);

            galleryContainer.innerHTML = ''; // Clear existing content

            Object.keys(groupedProducts).forEach(type => {
                // Create a section for each product type
                const typeSection = document.createElement('div');
                typeSection.classList.add('gallery-section');
                typeSection.innerHTML = `<h2>${type}</h2>`;

                const itemContainer = document.createElement('div');
                itemContainer.classList.add('gallery-items');

                groupedProducts[type].forEach(product => {
                    // // console.log('Rendering product:', product); // Log each product being rendered

                    const item = document.createElement('div');
                    item.classList.add('gallery-item');

                    const img = document.createElement('img');
                    img.src = product.heroImage;
                    img.alt = product.name;
                    img.addEventListener('click', () => {
                        // Load the product details when clicked (this also loads the model)
                        loadProductDetails(product.data);
                    });

                    const label = document.createElement('p');
                    label.textContent = product.name;

                    item.appendChild(img);
                    item.appendChild(label);
                    itemContainer.appendChild(item);
                });

                typeSection.appendChild(itemContainer);
                galleryContainer.appendChild(typeSection);
            });

            // Return the product data for any further processing, if needed
            return productArray;
        })
        .catch(error => console.error('Error loading product gallery:', error));
}


// Helper function to group products by type
function groupByType(products) {
    //  // console.log('Grouping products by type:', products);  // Log products before grouping
    return products.reduce((grouped, product) => {
        const type = product.type;
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(product);
        return grouped;
    }, {});
}