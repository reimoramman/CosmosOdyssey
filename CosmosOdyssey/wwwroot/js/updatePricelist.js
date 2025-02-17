
const APIURL = 'https://localhost:7066/api'

let currentDisplayedRoutes = [];


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
    // Get origin and destination form dropdown
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;

    // Check that both values are selected
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

// Filter routes where depart time is adter TIME and route starts at CURRENTLOCATION
// TODO Make it not loop like crazy :D
function findLaterTravels(currentLocation, pricelist, time) {
    let suitableRoutes = [];
    // Iterate through the price list and find valid routes from currentLocation
    pricelist.forEach(route => {
        if (new Date(route.startTime) > time && route.origin == currentLocation) {
            suitableRoutes.push(route);
        }
    })
    console.log('oncomingPrices', suitableRoutes)
    return suitableRoutes
}

/*function findMultiLegRoutes(pricelist, origin, destination, time) {
    const startingTravels = findLaterTravels(origin, pricelist, time);
    startingTravels.forEach(route => {
        findMultiLegRoutesHelper(pricelist, route, destination);
    })
    return resultPaths;
}*/


// Return valid routes, including stopovers
function findMultiLegRoutes(pricelist, origin, destination, time) {
    let resultPaths = []; // Store all valid paths

    // Get all valid starting travels from the origin
    let startingTravels = findLaterTravels(origin, pricelist, time);

    startingTravels.forEach(route => {
        // Recursively find routes leading to the destination
        let path = findMultiLegRoutesHelper(pricelist, route, destination, []);

        if (path.length > 0) {
            resultPaths.push(path);
        }
    });

    console.log("Final Found Routes:", resultPaths);
    return resultPaths;
}

/*function findMultiLegRoutesHelper(pricelist, current, destination) {
    let resultPaths = [];
    if (current.destination == destination) {
        console.log(current)
        return current
    }
    startingTravels = findLaterTravels(current, pricelist, current.endTime)
    startingTravels.forEach(route => {
        findMultiLegRoutesHelper(pricelist, route, destination, route.endTime)
    })
}*/
// Build paths
function findMultiLegRoutesHelper(pricelist, current, destination, path) {
    // Add cuurent route to path
    path.push(current);

    if (current.destination === destination) {
        // Retrurn completed path
        return [...path];
    }

    // Find the next possible flights from the current location
    let nextTravels = findLaterTravels(current.destination, pricelist, current.endTime);
    let validPaths = [];

    // Recursively explore possible routes
    nextTravels.forEach(nextRoute => {
        let newPath = findMultiLegRoutesHelper(pricelist, nextRoute, destination, [...path]);

        if (newPath.length > 0) {
            validPaths.push(newPath);
        }
    });

    // Return first valid path
    return validPaths.length > 0 ? validPaths[0] : [];
}

/*function displayRoutes(routes) {
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
}*/

function displayRoutes(routes) {
    const routeList = document.getElementById("routeList");
    const routesSection = document.getElementById("routes");

    // Show or hide the section
    routesSection.style.display = routes.length > 0 ? "flex" : "none";

    // Clear previous results
    routeList.innerHTML = "";

    console.log("🔍 Debugging: Checking Routes before displaying:", routes);

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
            <h3>Route ${index + 1} - Total Price: ${route.reduce((sum, flight) => sum + flight.price, 0)}</h3>
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


// TODO: Finish the function
async function makeReservation(route) {
    const firstName = prompt("Enter your first name:");
    const lastName = prompt("Enter your last name:");

    if (!firstName || !lastName) {
        alert("Reservation requires first and last name.");
        return;
    }

    // Calculate total price & travel time
    const totalPrice = route.reduce((sum, flight) => sum + flight.price, 0);
    //const totalTravelTimeMs = route.reduce((sum, flight) => sum + (new Date(flight.endTime) - new Date(flight.startTime)), 0);

    // ✅ Convert totalTravelTime to ISO 8601 Duration format (PTxHxMxS)
    /*const totalSeconds = Math.floor(totalTravelTimeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const isoDuration = `PT${hours}H${minutes}M${seconds}S`;*/
    const totalTravelTimeMs = route.reduce((sum, flight) => sum + (new Date(flight.endTime) - new Date(flight.startTime)), 0);
    const totalTravelTime = new Date(totalTravelTimeMs).toISOString().substr(11, 8); //HH:mm:ss

    const reservationData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        totalPrice,
        totalTravelTime,
        createdAt: new Date().toISOString()
    };

    console.log("📤 Sending reservation request:", reservationData);

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
        console.log("✅ Reservation created:", result);

        // Now link the selected route(s) to the reservation
        await linkRoutesToReservation(result.id, route);
        alert("Reservation successful!");
    } catch (error) {
        console.error("❌ Error making reservation:", error);
        alert("Reservation failed. Please try again.");
    }
}




async function linkRoutesToReservation(reservationId, route) {
    for (const flight of route) {
        const priceReservationData = {
            reservationId,
            priceId: flight.id
             // Ensure this matches the `PriceList` ID
        };

        console.log("📤 Linking route to reservation:", priceReservationData);

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

            console.log(`✅ Linked route ${flight.origin} → ${flight.destination}`);
        } catch (error) {
            console.error("❌ Error linking route:", error);
            alert(`Failed to associate route ${flight.origin} → ${flight.destination}`);
        }
    }
}



document.getElementById("companyFilter").addEventListener("change", applyFilters);
document.getElementById("sortBy").addEventListener("change", applyFilters);

async function getCompanyList() {
    try {
        const pricelist = await getLatestPriceList();
        const uniqueCompanies = [...new Set(pricelist.map(route => route.companyName))].filter(Boolean);

        populateDropdown(document.getElementById("companyFilter"), ["All", ...uniqueCompanies]);

    } catch (error) {
        console.error("Error fetching company list:", error);
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    await getCompanyList();  // Fetch companies dynamically
});

function applyFilters() {
    const company = document.getElementById("companyFilter").value;
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

    displayRoutes(filteredRoutes);
}



document.getElementById("findRoutes").addEventListener("click", async function () {
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;

    if (!origin || !destination) {
        alert("Please select both origin and destination");
        return;
    }

    try {
        // Fetch available travel routes
        const pricelist = await getLatestPriceList();

        // Find multi-leg routes
        const possibleRoutes = findMultiLegRoutes(pricelist, origin, destination, new Date());

        currentDisplayedRoutes = possibleRoutes; // Store the results globally for filtering/sorting
        displayRoutes(possibleRoutes);
    } catch (error) {
        console.error("Error fetching routes", error);
        alert("Failed to fetch travel routes");
    }
});