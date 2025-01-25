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
          }
        } else {
          console.error(`Failed to fetch product data from ${url}, status: ${xobj.status}`);
        }
      }
    };
    xobj.send(null);
}

// Function to generate buttons
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

    // Generate HTML for each category and product
    let htmlContent = '';
    for (const subCat in categories) {
        htmlContent += `<h2>${subCat}</h2>`;
        categories[subCat].forEach(product => {
            fetchProductData(product.data, function(productData) {
                htmlContent += `
                    <button class="catProduct" 
                           data-sort="${product.subCat}" 
                           data-model="${productData.model}" 
                           data-json="${productData.colorOptions}">
                      <img src="${product.heroImage}" alt="${product.name}" /> ${product.name}
                    </button>
                `;
                document.querySelector(container).innerHTML = htmlContent;
                console.log(`Generated button for product: ${product.name}`);
            });
        });
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