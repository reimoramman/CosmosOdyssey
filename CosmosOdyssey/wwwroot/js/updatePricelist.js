
const APIURL = 'https://localhost:7066/api'


// Fetch pricelist for Find Routes
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

// Get price data from JSON file (Static data)
async function getMockPriceList() {
    const response = await fetch('./TravelPrices.json');
    tempData = await response.json();
    return tempData;
}

async function getRouteByTravel(origin, destination) {
    const response = await fetch(`${APIURL}/Routes/${origin}-${destination}`);
    tempData = await response.json();
    return tempData;
}

async function createNewRoute(origin, destination) {
    const response = await fetch(`${APIURL}/Routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
        body: JSON.stringify({'origin': origin, 'destination': destination})
    })
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

// Save JSON PriceList from json to DB
async function saveJsonToDb(currentPriceList) {
    pricelist = []
    let validUntil = currentPriceList.validUntil;
    // Loop through each leg
    console.log(currentPriceList)
    currentPriceList.legs.forEach(async function (leg) {
        let legFrom = leg.routeInfo.from.name;
        let legTo = leg.routeInfo.to.name;
        // Check if route already exists in DB
        let travelRoute = await getRouteByTravel(legFrom, legTo);
        let routeId = null

        if (travelRoute.length == 0) {
            // If route does not exist creaete new route
            let newRoute = await createNewRoute(legFrom, legTo);
            routeId = newRoute.id
        }
        else {
            routeId = travelRoute[0].id
        }

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
                "travelRouteId": routeId
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


// Populate dropdown
document.addEventListener("DOMContentLoaded", function () {
    const originSelect = document.getElementById("origin");
    const destinationSelect = document.getElementById("destination");
    const findRoutes = document.getElementById("findRoutes"); // Ensure this exists in HTML

    getLatestPriceList();

    // Function to populate dropdowns
    function populateDropdown(selectElement, options) {
        selectElement.innerHTML = '<option value="">-- Select --</option>'; // Default option
        options.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }

    // Fetch route data from API
    fetch(`${APIURL}/Routes`, {
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
            // Extract unique origins and destinations
            const uniqueOrigins = [...new Set(data.map(route => route.origin))];
            const uniqueDestinations = [...new Set(data.map(route => route.destination))];

            // Populate origin and destination dropdowns
            populateDropdown(originSelect, uniqueOrigins);
            populateDropdown(destinationSelect, uniqueDestinations);
        })
        .catch(error => console.error('Error fetching route data:', error));

    // TODO? Precent selecting the same origin as destinationn?
    // Prevent selecting the same destination as origin
    originSelect.addEventListener("change", function () {
        const selectedOrigin = originSelect.value;

        fetch(`${APIURL}/Routes`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.json())
            .then(data => {
                const availableDestinations = [...new Set(data.map(route => route.destination))];

                // Filter out the selected origin from the destination list
                const filteredDestinations = availableDestinations.filter(destination => destination !== selectedOrigin);

                // Repopulate destination dropdown
                populateDropdown(destinationSelect, filteredDestinations);
            })
            .catch(error => console.error('Error fetching filtered destinations:', error));
    });

    // Prevent selecting the same origin and destination when clicking "Find Routes"

    findRoutes.addEventListener("click", function () {
        const selectedOrigin = originSelect.value;
        const selectedDestination = destinationSelect.value;

        if (!selectedOrigin || !selectedDestination) {
            alert("Please select both origin and destination!");
            return;
        }


        //Should prevention not work 
        if (selectedOrigin === selectedDestination) {
            alert("Origin and destination cannot be the same!");
            destinationSelect.value = ""; // Reset destination selection
            return;
        }
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
        const response = await fetch(`${APUIRL}/Routes`);
        const allRoutes = await response.json();

        //Find paths from origin to destination
        const possibleRoutes = findMultiLegRoutes(allRoutes, origin, destination);

        displayRoutes(possibleRoutes);
    } catch (error) {
        console.error("Error fetchign routes", error);
        alert("Failed to fetch travel routes")
    }
});

function findMultiLegRoutes(allRoutes, origin, destination) {
    let resultPaths = [];
    let que = [[{ origin, path: [], totalPrice: 0, totalTime: 0 }]];

    while (que.length > 0 ) {
        let currentPath = queue.shift();
        let lastStep = currentPath[currentPath.length - 1];

        if (lastStep.origin === destination) {
            //remove initial node
            resultPaths.push(currnetPath.slice(1));
            continue;
        }

        let nextStep = allRoutes.filter(route => route.origin === lastStep.origin);
        for (let nextStep of nextStep) {
            que.push([...currentPath, {
                origin: nextStep.destination,
                routeId: nextStep.id,
                companyName: nextStep.companyName,
                price: nextStep.price,
                startTime: mextStep.startTime,
                endTime: nextStep.endTime,
                totalPrice: lastStep.totalPrice + mextStep.price,
                totalTime: lastStep.totalTime + (new Date(nextStep.endTime) - new Date(nextStep.startTime))
            }]);
        }
    }

    return resultPaths;
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