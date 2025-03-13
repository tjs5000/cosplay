// Function to load JSON data
function loadJSON(file, callback) {
  console.log(`Loading JSON data from ${file}`);
  const xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', file, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState === 4) {
      if (xobj.status === 200) {
        console.log(`Successfully loaded JSON data from ${file}`);
        try {
          const response = JSON.parse(xobj.responseText);
          callback(response);
        } catch (e) {
          console.error(`Failed to parse JSON data from ${file}:`, e);
        }
      } else {
        console.error(`Failed to load JSON data from ${file}, status: ${xobj.status}`);
      }
    }
  };
  xobj.send(null);
}

// Function to fetch and return specific product data
function fetchProductData(url, callback) {
  console.log(`Fetching product data from ${url}`);
  const xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', url, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState === 4) {
      if (xobj.status === 200) {
        console.log(`Successfully fetched product data from ${url}`);
        try {
          const response = JSON.parse(xobj.responseText);
          callback(response);
        } catch (e) {
          console.error(`Failed to parse product data from ${url}:`, e);
          callback(null);  // Call with null if JSON parsing fails
        }
      } else {
        console.error(`Failed to fetch product data from ${url}, status: ${xobj.status}`);
        callback(null);  // Call with null if request fails
      }
    }
  };
  xobj.send(null);
}

// Function to generate buttons grouped by category
function generateButtons(data, container) {
  console.log("Generating buttons");
  const categories = {};

  // Organize products by subCat
  for (const key in data) {
    const product = data[key];
    if (!categories[product.subCat]) {
      categories[product.subCat] = [];
    }
    categories[product.subCat].push(product);
  }

  // Get the main container element and clear any existing content
  const containerEl = document.querySelector(container);
  containerEl.innerHTML = "";

  // Iterate over each category to create a grouping container
  for (const subCat in categories) {
    // Create a div for the current category group
    const catDiv = document.createElement('div');
    catDiv.id = subCat + "Container";  // e.g., "SidearmContainer"
    catDiv.classList.add('categoryGroup'); 

    // Create and append the header for the category
    const heading = document.createElement('h2');
    heading.textContent = subCat;
    catDiv.appendChild(heading);

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('productButtons');
    catDiv.appendChild(buttonGroup);

    // Process each product in the current category
    categories[subCat].forEach(product => {
      // Fetch additional product data
      fetchProductData(product.data, function(productData) {
        let disabled = false;
        let modelData = "";
        let jsonData = "";
        if (productData === null) {
          disabled = true;
        } else {
          modelData = productData.model;
          jsonData = productData.colorOptions;
        }

        // Create the button element
        const button = document.createElement('button');
        button.className = 'catProduct';
        if (disabled) {
          button.disabled = true;
        }
        button.setAttribute('data-sort', product.subCat);
        button.setAttribute('data-model', modelData);
        button.setAttribute('data-json', jsonData);
        button.setAttribute('data-product', product.data);

        // Create the image element with an onerror handler for missing thumbnails
        const img = document.createElement('img');
        img.src = product.heroImage;
        img.alt = product.name;
        img.onerror = function() {
          this.src = '/images/products/thumbnails/unavailable.png';
        };
        button.appendChild(img);

        // Append the product name as text after the image
        button.appendChild(document.createTextNode(" " + product.name));

        // Append the button to the current category's container
        buttonGroup.appendChild(button);
        console.log(`Generated button for product: ${product.name}`);
      });
    });

    // Append the category container to the buttonGroup container
    containerEl.appendChild(catDiv);
  }
  console.log("Finished generating buttons");
}

// Load and generate catalog
export function loadAndGenerateCatalog(jsonFile, container) {
  console.log(`Starting to load and generate catalog for ${jsonFile}`);
  loadJSON(jsonFile, function(data) {
    generateButtons(data, container);
  });
}
