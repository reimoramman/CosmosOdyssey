

document.getElementById("testButton").addEventListener("click", function () {

    console.log('help me')

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