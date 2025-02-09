
const APIURL = 'https://localhost:7066/api'


// Get PriceList from db
async function getHistoricPriceList() {
    const response = await fetch(`${APIURL}/pricelist`);
    tempData = await response.json();
    return tempData;
}

// Get PriceList from TravelPrices API
async function getNewPriceList() {
    const response = await fetch(`${APIURL}/proxy/fetch-data`);
    tempData = await response.json();
    return tempData;
}

// Get PriceList from JSON file (Static data for testing)
async function getMockPriceList() {
    const response = await fetch('./TravelPrices.json');
    tempData = await response.json();
    return tempData;
}

// Save pricelist object to db
async function saveToPriceList(pricelist) {
    if (!pricelist) {
        return
    }
    const response = await fetch(`${APIURL}/pricelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: '*/*' },
        body: JSON.stringify(pricelist)
    });

    if (!response.ok) {
        throw Error(`Failed to save price list: ${pricelist}`);
    }
    temptData = await response.json();
    return temptData;
}

// Reformat and save PriceList data to db
async function saveJsonToDb(currentPriceList) {
    pricelist = []
    let validUntil = currentPriceList.validUntil;
    // Loop through each leg
    currentPriceList.legs.forEach(async function (leg) {
        let origin = leg.routeInfo.from.name;
        let destination = leg.routeInfo.to.name;

        leg.providers.forEach(function (provider) {
            let companyName = provider.company.name
            let flightEnd = provider.flightEnd
            let flightStart = provider.flightStart
            let price = provider.price

            let priceData = {
                "validUntil": validUntil,
                "price": price,
                "companyName": companyName,
                "startTime": flightStart,
                "endTime": flightEnd,
                "origin": origin,
                "destination": destination
            }
            saveToPriceList(priceData);
            pricelist.push(priceData);
        })
    })
    return pricelist;
}

// Get latest pricelist data. If data in db is expired, request from api and save to db also
async function getLatestPriceList() {
    let currentPriceList = await getHistoricPriceList();
    if (currentPriceList.length === 0) {
        newPriceList = await getNewPriceList();
        currentPriceList = await saveJsonToDb(newPriceList)
    }
    return currentPriceList;
}





// Function to populate dropdowns
function populateDropdown(selectElement, options) {
    const selectedValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select --</option>'; // Default option
    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });

    // Ensure, that the selected value does not get deselected
    selectElement.value = selectedValue;
}


// Populate dropdown
document.addEventListener("DOMContentLoaded", async function () {
    const originSelect = document.getElementById("origin");
    const destinationSelect = document.getElementById("destination");
    const findRoutes = document.getElementById("findRoutes"); // Ensure this exists in HTML

    // Fetch Prices and routes from PriceList
    const pricelist = await getLatestPriceList();
    console.log(pricelist);

    // Extract unique origins and destinations
    const uniqueOrigins = [...new Set(pricelist.map(route => route.origin))];
    const uniqueDestinations = [...new Set(pricelist.map(route => route.destination))];

    // Populate origin and destination dropdowns
    populateDropdown(originSelect, uniqueOrigins);
    populateDropdown(destinationSelect, uniqueDestinations);

    // Prevent selecting the same destination as origin
    originSelect.addEventListener("change", function () {
        const selectedOrigin = originSelect.value;
        const filteredDestinations = uniqueDestinations.filter(destination => destination !== selectedOrigin);
        populateDropdown(destinationSelect, filteredDestinations);
        populateDropdown(originSelect, uniqueOrigins);
    });

    // Prevent selecting the same origin as destination
    destinationSelect.addEventListener('change', function () {
        const selectedDestination = destination.value;
        const filteredOrigins = uniqueOrigins.filter(origin => origin !== selectedDestination);
        populateDropdown(originSelect, filteredOrigins);
        populateDropdown(destinationSelect, uniqueDestinations);
    });


    // Prevent selecting the same origin and destination when clicking "Find Routes"

    findRoutes.addEventListener("click", function () {

    });
})


document.getElementById("findRoutes").addEventListener("click", async function () {
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;

    if (!origin || !destination) {
        alert("Please slect both origin and destination");
        return;
    }

    try {
        //Fetch direct and indirect routes
        const pricelist = await getLatestPriceList();

        //Find paths from origin to destination
        const possibleRoutes = findMultiLegRoutes(pricelist, origin, destination, new Date());

        displayRoutes(possibleRoutes);
    } catch (error) {
        console.error("Error fetchign routes", error);
        alert("Failed to fetch travel routes")
    }
});

function findLaterTravels(currentLocation, pricelist, time) {
    let suitableRoutes = [];
    pricelist.forEach(route => {
        if (new Date(route.startTime) > time && route.origin == currentLocation) {
            suitableRoutes.push(route);
        }
    })
    console.log('oncomingPrices', suitableRoutes)
    return suitableRoutes
}

function findMultiLegRoutes(pricelist, origin, destination, time) {
    const startingTravels = findLaterTravels(origin, pricelist, time);
    startingTravels.forEach(route => {
        findMultiLegRoutesHelper(pricelist, route, destination);
    })
    return resultPaths;
}

function findMultiLegRoutesHelper(pricelist, current, destination) {
    let resultPaths = [];
    if (current.destination == destination) {
        console.log(current)
        return current
    }
    startingTravels = findLaterTravels(current, pricelist, current.endTime)
    startingTravels.forEach(route => {
        findMultiLegRoutesHelper(pricelist, route, destination, route.endTime)
    })
}

function displayRoutes(routes) {
    const routeList = document.getElementById("routeList");
    routeList.innerHTML = "";

    routes.forEach((route, index) => {
        const listItem = document.createElement("li");

        let routeDetails = route.map(flight => `
        <div>
            <strong>From:</strong> ${flight.origin} → <strong>To:</strong> ${flight.routeId}
            <br><strong>Company:</strong> ${flight.companyName} |
            <strong>Price:</strong> ${flight.price} |
            <strong>Travel time:<strong> ${flight.startTime} - ${flight.endTime}
        </div>
        `).join("<hr>");

        listItem.innerHTML = `
        <h3>ROute ${index + 1} - Total Price: ${route[route.length - 1].totalPrice}</h3>
        ${routeDetails}
        <button onclick="makeReservation(${JSON.stringify(route)})">Reserve</button>
        `;

        routeList.appendChild(listItem);
    });
}


// TODO: Finish the function
async function makeReservation() {

}