export function fetchPresets(url) {
    return fetch(url)
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching the JSON:', error);
            throw error;
        });
}

export function fetchCustomContent(url) {
    return fetch(url)
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching the JSON:', error);
            throw error;
        });
}

export function fetchHTMLContent(url) {
    return fetch(url)
        .then(response => response.text())
        .catch(error => {
            console.error('Error fetching the HTML:', error);
            return '<h2>Information</h2><p>Sorry, an error occurred while fetching the content.</p>';
        });
}
