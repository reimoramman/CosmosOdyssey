/*// V6imalikud teekonnad
const routes = {
    Mercury: ["Venus"],
    Venus: ["Mercury", "Earth"],
    Earth: ["Uranus", "Jupiter"],
    Mars: ["Venus"],
    Jupiter: ["Mars", "Venus"],
    Saturn: ["Earth", "Neptune"],
    Uranus: ["Saturn", "Neptune"],
    Neptune: ["Uranus", "Mercury"]
  };
  
  // Anna valik(ud) kuhu alugs asukoha
  document.getElementById("origin").addEventListener("change", function() {
    const origin = this.value;
    const destinationSelect = document.getElementById("destination");
  
    // Clear current options
    destinationSelect.innerHTML = "<option value=''>-- Select a destination --</option>";
  
    if (routes[origin]) {
      routes[origin].forEach(function(destination) {
        const option = document.createElement("option");
        option.value = destination;
        option.textContent = destination;
        destinationSelect.appendChild(option);
      });
    }
  });
  
  // Handle the route search
  document.getElementById("findRoutes").addEventListener("click", function() {
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;
  
    if (origin && destination) {
      const routeList = document.getElementById("routeList");
  
      // Clear previous results
      routeList.innerHTML = "";
  
      // Here, you can add code to fetch the travel deals from the API based on the selected routes
      const listItem = document.createElement("li");
      listItem.textContent = `From ${origin} to ${destination}`;
      routeList.appendChild(listItem);
    } else {
      alert("Please select both origin and destination.");
    }
  });*/