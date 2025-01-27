
const APIURL = 'https://localhost:7066/api'


// Update to take PriceList data instead. From price list data, can get routes also
// Can not get price from route
fetch(`${APIURL}/Routes`, {
    method: 'GET',
    header: { 'Content-Type': 'application/json' }
})
    .then(data => data.json())
    .then(response => console.log(response));

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
        body: JSON.stringify({ 'origin': origin, 'destination': destination })
    });
    tempData = await response.json();
    return tempData;
}

// TODO: Create function to save priceListData, similar to createNewRoute()
async function saveToPriceList(pricelist) {
    const response = await fetch('${APIURL}/PriceList', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: '*/*' },
        body: JSON.stringify({ 'pricelist': pricelist })
    });

    if (!response.ok) {
        throw Error('Failed to save price list');
    }
    temptData = await response.json();
    return temptData;
}

//Save JSON PriceList data to DB
async function saveJsonToDb() {
    let data = await getMockPriceList();
    let validUntil = data.validUntil;

    data.legs.forEach(async function (leg) {
        let legFrom = leg.routeInfo.from.name;
        let legTo = leg.routeInfo.to.name;

        let travelRoute = await getRouteByTravel(legFrom, legTo);
        let routeId = null

        if (travelRoute.length == 0) {
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
            };

            /*try {
                *//*await*//* saveToPriceList(priceData);
                console.log('Saved PRICE DATA:', priceData);
            } catch (error) {
                console.log('Error saving to PriceList:', error);
            }*/
          // saveToPriceList(priceData);
           console.log('PRICE DATA:', priceData)  // TODO: Save to priceList db. Routes are already saved
        })
    })


    //  Function to format price list data
    /*function formatPriceListData(apiData) {
        return apiData.legs.flatMap(leg =>
            leg.providers.map(provider => ({
                validUntil: apiData.validUntil,
                price: provider.price,
                companyName: provider.company.name,
                startTime: provider.flightStart,
                endTime: provider.flightEnd,
                travelRouteId: leg.routeInfo.id
            }))
        )
    }*/

    //let jsonData = getMockPriceList();
    /*{
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "price": 0,
        "companyName": "string",
        "startTime": "2025-01-26T11:00:51.205Z",
        "endTime": "2025-01-26T11:00:51.205Z",
        "validUntil": "2025-01-26T11:00:51.205Z",
        "travelRouteId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "travelRoutes": {
            "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            "origin": "string",
            "destination": "string",
            "priceLists": [
                "string"
            ]
        },
        "priceReservationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    }*/
}

// Get Current priceList from Db, if not expired, otherwise get from API
async function getCurrentPriceList() {
    let historicPricelist = await getHistoricPriceList();

    if (!historicPricelist || historicPricelist.length === 0) {
        let newPriceList = await getNewPriceList();
        await saveToPriceList(mewPriceList);
        return newPriceList
        //return getNewPriceList();
        // TODO: Save new pricelist to database
    }

    // TODO: Remove expired priceList elements
    let currentDate = new Date();
    // TODO? Replace with an endpoint that filters out expired priceList elements
    let filteredHistoricPricelist = historicPricelist.filter(a => new Date(a.ValidUntil) > currentDate);

    if (filteredHistoricPricelist.length === 0) {
        let newPriceList = await getNewPriceList();
        await saveToPriceList(newPriceList);
        return newPriceList
        // TODO: Save new pricelist to database
    }

    // TODO: Format priceList from API to be similar to db format
    return filteredHistoricPricelist;
}


// Populate dropdown
document.addEventListener("DOMContentLoaded", function () {
    const originSelect = document.getElementById("origin");
    const destinationSelect = document.getElementById("destination");

    saveJsonToDb()

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
        }
    });

    // console.log('PriceListOutput', getCurrentPriceList())
});

