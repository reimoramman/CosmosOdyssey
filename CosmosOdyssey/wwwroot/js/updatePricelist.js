
const APIURL = 'https://localhost:7066/api'


// Fetch pricelist for Find Routes
function getHistoricPriceList() {
    fetch(`${APIURL}/pricelist`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => console.log('Pricelist', data))
        .catch(error => console.error('Error:', error));
}

// Get PriceList from TravelPrices API
function getNewPriceList() {
    fetch('https://cosmosodyssey.azurewebsites.net/api/v1.0/TravelPrices', {
        method: 'GET',
        header: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
        .then(data => data.json())
        .then(function (output) {return output });
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
    const response = await fetch(`${APIURL}/pricelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: '*/*' },
        body: JSON.stringify(pricelist)
        // body: JSON.stringify({'price': 10})
    });

    if (!response.ok) {
        throw Error('Failed to save price list');
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
    if (currentPriceList.length != 0) {
        return
    }
    // Fetch new price list
    let data = await getMockPriceList();
    let validUntil = data.validUntil;
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
        return getMockPriceList();
        //return getNewPriceList();
    }

    // TODO: Remove expired priceList elements
    // TODO? Replace with an endpoint that filters out expired priceList elements
    let currentDate = new Date();
    let filteredHistoricPricelist = historicPricelist.filter(a => new Date(a.ValidUntil) > new Date());

    if (filteredHistoricPricelist.length === 0) {
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


    // Fetch and display routes
    /*document.getElementById("findRoutes").addEventListener("click", async function () {
        const origin = documnet.getElementById("origin").value;
        const destination = documen.getElementById("destination").value;
        const companyFilter = documnet.getElementById("companyFiler")?.value || "";
        const sortBy = documnet.getElementById("sortBy")?.value || "";

        if (!origin || !destination) {
            alert("Please selecet both origin and destinatin!");
            return;
        }

        try {
            const response = await fetch(`${APIURL}/Routes/GetRoutes?origin=${origin}&destination=${destination}&company=${companyFilter}&sortBy=${sortBy}`);
            if (!response.ok) throw new Error("Failed to fetch routes");

            const routes = await response.json();
            displayRoutes(routes);
        } catch (error) {
            console.log("ERror fetching routes:", error);
            alert("FAiled to fetch travel routes")
        }
    })
});

function displayRoutes(routes) {
    const routeList = document.getElemetById("routeList");
    routeList.innerHTML = // CLear previous results

    if (routes.length === 0) {
        routeList.innerHTML = "<li>No available routes found.</li>";
        return;
    }

    routes.forEach((route, index) => {
        const listItem = document.createElement("li");

        let routeDetails = route.map(flight => `
            <div>
                <strong>From:</strong> ${flight.travelRoute.origin} → <strong>To:</strong> ${flight.travelRoute.destination}
                <br><strong>Company:</strong> ${flight.companyName} | 
                <strong>Price:</strong> ${flight.price} | 
                <strong>Travel Time:</strong> ${flight.startTime} - ${flight.endTime}
            </div>
        `).join("<hr>"); // Separator between flights)

        listItem.innerHTML = `
            <h3>Route ${index + 1}</h3>
            ${routeDetails}
            <button onclick="makeReservation(${JSON.stringify(route)})">Reserve</button>`;

        routeList.appendChild(listItem);
    });
}

async function makeReservation(route) {
    const firstName = prompt("Enter your first name:");
    const lastName = prompt("Enter your last name:");

    if (!firstName || !lastName) {
        alert("Reservation requires first and last name.");
        return;
    }

    try {
        // Step 1: Create the reservation
        const reservationResponse = await fetch(`${APIURL}/reservation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName,
                lastName,
                totalPrice: route.reduce((sum, flight) => sum + flight.price, 0),
                totalTravelTime: route.reduce((sum, flight) => sum + (new Date(flight.endTime) - new Date(flight.startTime)), 0)
            })
        });

        if (!reservationResponse.ok) throw new Error("Failed to create reservation");

        const reservation = await reservationResponse.json();
        const reservationId = reservation.id;

        // Step 2: Link each selected flight to the reservation
        for (const flight of route) {
            await fetch(`${APIURL}/pricereservation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reservationId,
                    priceId: flight.id  // Link to PriceList entry
                })
            });
        }

        alert("Reservation successful!");
    } catch (error) {
        console.error("Error making reservation:", error);
        alert("Reservation failed. Please try again.");
    }
}*/