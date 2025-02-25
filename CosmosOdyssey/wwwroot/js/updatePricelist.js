
const APIURL = 'https://localhost:7066/api'

let currentDisplayedRoutes = [];


// Get PriceList from db
async function getHistoricPriceList() {
    const response = await fetch(`${APIURL}/pricelist/active`);
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
        let distance = leg.routeInfo.distance;

        leg.providers.forEach(function (provider) {
            let companyName = provider.company.name
            let flightEnd = provider.flightEnd
            let flightStart = provider.flightStart
            let price = provider.price

            let priceData = {
                "id": provider.id,
                "validUntil": validUntil,
                "price": price,
                "companyName": companyName,
                "startTime": flightStart,
                "endTime": flightEnd,
                "origin": origin,
                "destination": destination,
                "distance": distance
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
    keep15PriceList();
    return currentPriceList;
}

async function keep15PriceList() {
    const response = await fetch(`${APIURL}/pricelist/DeleteOldPriceLists`);
    tempData = await response.json();
}

// Function to populate dropdowns
function populateDropdown(selectElement, options, default_value = '-- Select --') {
    const selectedValue = selectElement.value;
    selectElement.innerHTML = `<option value="">${default_value}</option>`; // Default option
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
    const filterSelect = document.getElementById("companyFilter");
    const findRoutes = document.getElementById("findRoutes"); // Ensure this exists in HTML

    // Fetch Prices and routes from PriceList
    const pricelist = await getLatestPriceList();

    // Extract unique origins and destinations
    const uniqueOrigins = [...new Set(pricelist.map(route => route.origin))];
    const uniqueDestinations = [...new Set(pricelist.map(route => route.destination))];  // TODO:: remove companies with no routes
    const uniqueCompanies = [...new Set(pricelist.map(route => route.companyName))].filter(Boolean);

    // Populate origin and destination dropdowns
    populateDropdown(originSelect, uniqueOrigins);
    populateDropdown(destinationSelect, uniqueDestinations);
    populateDropdown(filterSelect, uniqueCompanies, 'All')

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

    findRoutes.addEventListener("click", async function () {
        // Get origin and destination form dropdown
        const origin = document.getElementById("origin").value;
        const destination = document.getElementById("destination").value;

        // Check that both values are selected
        if (!origin || !destination) {
            alert("Please slect both origin and destination");
            return;
        }

        try {
            //Find paths from origin to destination
            const possibleRoutes = findMultiLegRoutes(pricelist, origin, destination, new Date());
            currentDisplayedRoutes = possibleRoutes; // Store the results globally for filtering/sorting
            displayRoutes(possibleRoutes);
        } catch (error) {
            alert("Failed to fetch travel routes")
        }
    });
})

// Filter routes where depart time is adter TIME and route starts at CURRENTLOCATION
function findLaterTravels(pricelist, currentLocation, time) {
    let suitableRoutes = [];
    // Iterate through the price list and find valid routes from currentLocation
    pricelist.forEach(route => {
        if (new Date(route.startTime) > time && route.origin == currentLocation) {
            suitableRoutes.push(route);
        }
    })
    return suitableRoutes
}

// Return valid routes, including stopovers
function findMultiLegRoutes(pricelist, origin, destination, time) {
    let resultPaths = []; // Store all valid paths

    // Get all valid starting travels from the origin
    let startingTravels = findLaterTravels(pricelist, origin, time);

    startingTravels.forEach(route => {
        let allPaths = [];
        findMultiLegRoutesHelper(pricelist, route, destination, [], allPaths);
        resultPaths.push(...allPaths); // Store found paths
    });

    return resultPaths;
}

function findMultiLegRoutesHelper(pricelist, current, destination, path, allPaths) {
    let newPath = [...path, current]; // Copy path to avoid shared mutation

    if (current.destination === destination) {
        allPaths.push(newPath); // Store completed path
    } else {
        let nextRoutes = findLaterTravels(pricelist, current.destination, new Date(current.endTime));
        nextRoutes.forEach(travel => {
            findMultiLegRoutesHelper(pricelist, travel, destination, newPath, allPaths);
        });
    }
}

function displayRoutes(routes) {
    const routeList = document.getElementById("routeList");
    const routesSection = document.getElementById("routes");

    // Show or hide the section
    routesSection.style.display = routes.length > 0 ? "flex" : "none";

    // Clear previous results
    routeList.innerHTML = "";

    routes.forEach((route, index) => {
        const listItem = document.createElement("li");
        listItem.classList.add("route-box"); // Apply the new styling

        // Create a detailed view of each flight in the route
        let routeDetails = route.map(flight => {
            const startTimeUTC = new Date(flight.startTime).toLocaleString('en-GB', { timeZone: 'UTC' }) + " UTC"; // convert to readable utc 
            const endTimeUTC = new Date(flight.endTime).toLocaleString('en-GB', { timeZone: 'UTC' }) + " UTC";

            return `
            <div>
                <strong>From:</strong> ${flight.origin} → <strong>To:</strong> ${flight.destination}
                <br><strong>Company:</strong> ${flight.companyName} |
                <strong>Price:</strong> ${flight.price} |
                <strong>Travel time (UTC):</strong> ${startTimeUTC} - ${endTimeUTC}
            </div>`;
        }).join("<hr>");

        // Create route box with a reservation button
        listItem.innerHTML = `
            <h2>Route ${index + 1}<h2>
            <h3>Total Price: ${route.reduce((sum, flight) => sum + flight.price, 0)}</h3>
            <h3>Total Distance: ${route.reduce((sum, flight) => sum + flight.distance, 0)}</h3>
            <h3>Total Travel Time: ${calculateTotalTravelTime(route)}</h3>
            ${routeDetails}
            <button class="reserve-btn" data-route='${JSON.stringify(route)}'>Reserve</button>
        `;

        routeList.appendChild(listItem);
    });

    document.querySelectorAll(".reserve-btn").forEach(button => {
        button.addEventListener("click", function () {
            const route = JSON.parse(this.dataset.route);
            makeReservation(route);
        });
    });
}

function calculateTotalTravelTime(route) {
    if (route.length === 0) return "00:00:00";

    const startTime = new Date(route[0].startTime); // First flight start
    const endTime = new Date(route[route.length - 1].endTime); // Last flight end

    const totalTravelTimeMs = endTime - startTime; // Difference in milliseconds

    // Convert to HH:MM:SS format
    const hours = Math.floor(totalTravelTimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalTravelTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalTravelTimeMs % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function makeReservation(route) {
    const firstName = prompt("Enter your first name:");
    const lastName = prompt("Enter your last name:");

    if (!firstName || !lastName) {
        alert("Reservation requires first and last name.");
        return;
    }

    // Calculate total price & travel time
    const totalPrice = route.reduce((sum, flight) => sum + flight.price, 0);
    const totalTravelTimeMs = route.reduce((sum, flight) => sum + (new Date(flight.endTime) - new Date(flight.startTime)), 0);
    const totalTravelTime = new Date(totalTravelTimeMs).toISOString().substr(11, 8); //HH:mm:ss

    const reservationData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        totalPrice,
        totalTravelTime,
        createdAt: new Date().toISOString()
    };

    try {
        const response = await fetch(`${APIURL}/reservation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reservationData)
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to create reservation: ${errorMessage}`);
        }

        const result = await response.json();

        // Now link the selected route(s) to the reservation
        await linkRoutesToReservation(result.id, route);
        alert("Reservation successful!");
    } catch (error) {
        alert("Reservation failed. Please try again.");
    }
}


async function linkRoutesToReservation(reservationId, route) {
    for (const flight of route) {
        console.log("FLIGHT", flight);
        const priceReservationData = {
            reservationId: reservationId,
            priceId: flight.id,
            // Ensure this matches the `PriceList` ID
        };

        try {
            const response = await fetch(`${APIURL}/priceReservation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(priceReservationData)
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Failed to associate route ${flight.origin} → ${flight.destination}: ${errorMessage}`);
            }

        } catch (error) {
            alert(`Failed to associate route ${flight.origin} → ${flight.destination}`);
        }
    }
}



document.getElementById("companyFilter").addEventListener("change", applyFilters);
document.getElementById("sortBy").addEventListener("change", applyFilters);

function applyFilters() {
    const companyFilter = document.getElementById("companyFilter");
    const company = companyFilter.value;
    const sortBy = document.getElementById("sortBy").value;

    let filteredRoutes = [...currentDisplayedRoutes]; // Clone array to avoid modifying original data

    // Apply Company Filter
    if (company && company !== "All") {
        filteredRoutes = filteredRoutes.filter(route =>
            route.some(flight => flight.companyName === company)
        );
    }

    // Apply Sorting
    if (sortBy === "price") {
        filteredRoutes.sort((a, b) =>
            a.reduce((sum, flight) => sum + flight.price, 0) -
            b.reduce((sum, flight) => sum + flight.price, 0)
        );
    } else if (sortBy === "distance") {
        filteredRoutes.sort((a, b) =>
            a.reduce((sum, flight) => sum + flight.distance, 0) -
            b.reduce((sum, flight) => sum + flight.distance, 0)
        );
    } else if (sortBy === "travelTime") {
        filteredRoutes.sort((a, b) =>
            a.reduce((sum, flight) => sum + (new Date(flight.endTime) - new Date(flight.startTime)), 0) -
            b.reduce((sum, flight) => sum + (new Date(flight.endTime) - new Date(flight.startTime)), 0)
        );
    }
    updateCompanyFilter(filteredRoutes);
    displayRoutes(filteredRoutes);
}

function updateCompanyFilter() {
    const companyFilter = document.getElementById("companyFilter");

    // Get all unique company names from all available routes
    const allCompanies = [...new Set(currentDisplayedRoutes.flatMap(route => route.map(flight => flight.companyName)))];

    // Preserve the currently selected company if possible
    const selectedCompany = companyFilter.value;

    // Keep "All" as the default option
    companyFilter.innerHTML = '<option value="All">All</option>';

    // Populate the dropdown with all companies
    allCompanies.forEach(company => {
        const option = document.createElement("option");
        option.value = company;
        option.textContent = company;
        companyFilter.appendChild(option);
    });

    // Restore previously selected company (if still available)
    if (allCompanies.includes(selectedCompany)) {
        companyFilter.value = selectedCompany;
    }
}