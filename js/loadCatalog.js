// Function to load JSON data
function loadJSON(file, callback) {
    const xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file, true);
    xobj.onreadystatechange = function () {
      if (xobj.readyState === 4 && xobj.status === "200") {
        callback(JSON.parse(xobj.responseText));
      }
    };
    xobj.send(null);
  }
  
  // Function to fetch and return specific product data
  function fetchProductData(url, callback) {
    const xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
      if (xobj.readyState === 4 && xobj.status === "200") {
        callback(JSON.parse(xobj.responseText));
      }
    };
    xobj.send(null);
  }
  
  // Function to generate buttons
  function generateButtons(data, container) {
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
        });
      });
    }
  }
  
  // Load and generate armor catalog
  loadJSON('/data/armor_products.json', function(data) {
    generateButtons(data, '.catProductContainer');
  });