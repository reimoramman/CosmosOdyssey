
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
    console.log(tempData)
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

// TODO: Create function to save priceListData, similar to createNewRoute()
async function saveToPriceList(pricelist) {
    if (!pricelist) {
        return
    }
    const response = await fetch(`${APIURL}/pricelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: '*/*' },
        body: JSON.stringify(pricelist)
        // body: JSON.stringify({'price': 10})
    });

    if (!response.ok) {
        throw Error(`Failed to save price list: ${pricelist}`);
    }
    temptData = await response.json();
    return temptData;
}

// Save JSON PriceList data to DB
// TODO: request from the db, most recent pricelist and check if it is still valid OR make an endpoint to get only valid priceList items
//  Then check if any valid prices exist. If not, download new ones. Currently the download is performed without checking for existing data
async function saveJsonToDb() {

    // Get latest valid price list from db
    let currentPriceList = await getCurrentPriceList();
    // If valid prices exist, do nothing
    console.log('Saving price data')
    if (currentPriceList != undefined && currentPriceList.length != 0) {
        console.log('No pricelist')
        return
    }
    // Fetch new price list
    let data = await getMockPriceList();
    let validUntil = data.validUntil;
    if (new Date(validUntil) < new Date()) {
        console.log('Fetched expired price data')
        return
    }
    // Loop through each leg
    data.legs.forEach(async function (leg) {
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
        })
    })
}

// Get Current priceList from Db, if not expired, otherwise get from API
async function getCurrentPriceList() {
    //Fetch historic price list from the database
    let historicPricelist = await getHistoricPriceList();

    // If there is no data in the database, fetch a new price list
    if (!historicPricelist || historicPricelist.length === 0) {
        /*let newPriceList = await getNewPriceList();
        await saveToPriceList(newPriceList);
        return newPriceList;*/
        // return getMockPriceList();
        return getNewPriceList();
    }

    // TODO: Remove expired priceList elements
    // TODO? Replace with an endpoint that filters out expired priceList elements
    let currentDate = new Date();
    let filteredHistoricPricelist = historicPricelist.filter(a => new Date(a.ValidUntil) > new Date());

    if (filteredHistoricPricelist.length === 0) {
        console.log('filteredHistoricPricelist.length', filteredHistoricPricelist.length)
        let newPriceList = await getNewPriceList();
        await saveToPriceList(newPriceList);
        return newPriceList;
        //return getMockPriceList();
        //return getNewPriceList();
    }
    return filteredHistoricPricelist;
}


// Populate dropdown
document.addEventListener("DOMContentLoaded", function () {
    const originSelect = document.getElementById("origin");
    const destinationSelect = document.getElementById("destination");
    const findRoutes = document.getElementById("findRoutes"); // Ensure this exists in HTML

    saveJsonToDb();

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