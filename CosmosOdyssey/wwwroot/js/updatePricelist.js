

document.getElementById("testButton").addEventListener("click", function () {

    console.log('help me');

    fetch('https://localhost:7066/api/Routes', {
        method: 'GET',
        header: { 'Content-Type': 'application/json' }
    })
    .then(data => data.json())
    .then(response => console.log(response));
});

// Update to take PriceList data instead. From price list data, can get routes also
// Can not get price from route
fetch('https://localhost:7066/api/Routes', {
    method: 'GET',
    header: { 'Content-Type': 'application/json' }
})
    .then(data => data.json())
    .then(response => console.log(response));

fetch('https://localhost:7066/api/pricelist', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
})
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
console.log('pricelist 1');


// Populate dropdown attempt1 
document.addEventListener("DOMContentLoaded", function () {
    const originSelect = document.getElementById("origin");
    const destinationSelect = document.getElementById("destination");

    // Function to populate dropdowns
    function populateDropdown(selectElement, options) {
        selectElement.innerHTML = '<option value="">-- Select --</option>'; // Default option
        console.log("populate1")
        options.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }

    // Fetch route data from API
    fetch('https://localhost:7066/api/Routes', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch routes');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched route data:', data);

            // Extract unique origins and destinations
            const origins = [...new Set(data.map(route => route.origin))];
            const destinations = [...new Set(data.map(route => route.destination))];

            // Populate select elements
            populateDropdown(originSelect, origins);
            populateDropdown(destinationSelect, destinations);
        })
        .catch(error => console.error('Error fetching route data:', error));

    findRoutes.addEventListener("click", function () {
        const selectedOrigin = originSelect.value;
        const selectedDestination = destinationSelect.value;

        if (!selectedOrigin || !selectedDestination) {
            alert("Please select both origin and destination!");
            return;
            console.log("button1")
        }
    });
});

