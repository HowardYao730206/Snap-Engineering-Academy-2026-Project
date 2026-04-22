var selectedState = null;

// State abbr map
var stateName = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

// Some good color scheme thanks to my photography class :)
// Color map for the map(Why does this sounds funny), mostly use for the map
var colorDefault = "#c8d8e8";
var colorHover = "#a0b8d0";
var colorClicked = "#f0a500";

// When we are not selecting any state, we want to present all of the resturant on the right panel
function getAllRestaurants() {
  var all = [];
  // The sets of the keys of our dataset
  var abbrs = Object.keys(restaurantData);
  for (var i = 0; i < abbrs.length; i++) {
    var stateData = restaurantData[abbrs[i]];
    for (var j = 0; j < stateData.length; j++) {
      all.push(stateData[j]);
    }
  }
  return all;
}

//These are the helper function for map

//return the shape <path> element by abbreviation
function getPath(abbr) {
  // CSS selector string
  return document.querySelector("#usMap path." + abbr.toLowerCase());
}

//return a array of all paths(for all states)
function getAllPaths() {
  var paths = [];
  var abbrs = Object.keys(stateName);
  for (var i = 0; i < abbrs.length; i++) {
    var p = getPath(abbrs[i]);
    if (p) paths.push(p);
  }
  return paths;
}

//Get abbreviation by path
function getAbbr(path) {
  var classes = path.getAttribute("class").split(" ");
  for (var i = 0; i < classes.length; i++) {
    // use the class label, tx -> TX and check if it exist
    var c = classes[i].toUpperCase();
    if (stateName[c]) return c;
  }
  return null;
}

// Color, when we click or hover on a state the color should change
// If we click on a new State, we want to erase the old one(just erase all) and light up the new clicked State

//Add this later, change color of the state when onClick and/or hover
function setColor(path, color) {
  path.setAttribute("fill", color);
}

// Reset the color of the states
function resetColors() {
  var paths = getAllPaths();
  for (var i = 0; i < paths.length; i++) {
    setColor(paths[i], colorDefault);
  }
}

//SVG structure:
/* <g class="state">
        <path class="al" .../>
        <path class="ak" .../>
        ... 
      </g>
      */

// Initialize the map
function initMap() {
  var paths = getAllPaths();
  console.log("Found paths:", paths.length);

  //Add event listener to every state:

  // Super weird bug! varriable declared by var is in function-scoped, because the loop will always runs, no matter
  // what state we pressed, Wyoming will always be the one chosen, change it to let(block-scoped) fix the problem
  for (let i = 0; i < paths.length; i++) {
    let path = paths[i];
    let abbr = getAbbr(path);

    setColor(path, colorDefault);

    path.addEventListener("mouseover", function () {
      setColor(path, colorHover);
    });

    path.addEventListener("mouseout", function () {
      if (abbr === selectedState) setColor(path, colorClicked);
      else setColor(path, colorDefault);
    });

    path.addEventListener("click", function () {
      selectState(abbr);
    });
  }
}

// Select case, few thing we want to handle
/* 
if already selected, select again will reset it and update the right panel
else we select that state, give it "Selected Color" and update the right panel
 */
function selectState(abbr) {
  if (selectedState === abbr) {
    selectedState = null;
    resetColors();
    document.getElementById("stateName").textContent = "All States";
    document.getElementById("stateSpecialty").textContent = "";
  } else {
    selectedState = abbr;
    // Must reset the old one
    resetColors();
    setColor(getPath(abbr), colorClicked);
    document.getElementById("stateName").textContent = stateName[abbr];
    document.getElementById("stateSpecialty").textContent =
      "Specialty: " + restaurantData[abbr][0].specialty;
  }

  renderCards();
}

// Render the right panel card for each resturant
// We display data after filtered and sorted
function renderCards() {
  var data = selectedState
    ? restaurantData[selectedState] || []
    : getAllRestaurants();

  // Search/filters by restaurant name
  var searchVal = document.getElementById("searchInput").value.toLowerCase();
  var filtered = [];
  for (var i = 0; i < data.length; i++) {
    if (
      searchVal == "" ||
      data[i].name.toLowerCase().indexOf(searchVal) !== -1
    ) {
      filtered.push(data[i]);
    }
  }

  // Sort
  var sortVal = document.getElementById("sortSelect").value;
  if (sortVal === "rating-desc") {
    filtered.sort(function (a, b) {
      return b.rating - a.rating;
    });
  } else if (sortVal === "rating-asc") {
    filtered.sort(function (a, b) {
      return a.rating - b.rating;
    });
  } else if (sortVal === "price-desc") {
    filtered.sort(function (a, b) {
      return b.priceRange.length - a.priceRange.length;
    });
  } else if (sortVal === "price-asc") {
    filtered.sort(function (a, b) {
      return a.priceRange.length - b.priceRange.length;
    });
  } else if (sortVal === "name") {
    filtered.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
  }

  // Update count
  document.getElementById("restaurantCount").textContent =
    filtered.length + " restaurants";

  // Added this to accomandate the max card can appear in one screen
  // The DOM overloads and become slow when too many elements appear at the sametime
  var visible = filtered.slice(0, 50);

  // After we have our final sets of data, visible, we start render them by generating HTML for each resturant
  var html = "";
  for (var i = 0; i < visible.length; i++) {
    var r = visible[i];

    //Ex:
    /* 

              <div class='restaurant-card'>
            <img src='https://maps.googleapis.com/...' alt='Mcdonald'">
            <h3>Mcdonald</h3>
            <div class='info-row'>
              <span>⭐ 6.7 </span>
              <span>(6767 reviews)</span>
              <span>$$</span>
              <span style='color:green'>Open</span>
            </div>
            <div class='info-row'>
              <strong>CA</strong> — Berkeley — XXXX
            </div>
            <a href='XXX.com' target='_blank'>Website</a>
            <a href='tel:xxx'>xxx</a>
          </div>

     */

    html += "<div class='restaurant-card'>";
    html +=
      "<img src='" +
      r.imageUrl +
      "' alt='" +
      r.name +
      "' onerror=\"this.style.display='none'\">";
    html += "<h3>" + r.name + "</h3>" + "<div class='info-row'>";
    html += "<span>⭐ " + r.rating + "</span>";
    html += "<span> (" + r.reviewCount + " reviews)</span>";
    if (r.priceRange) html += "<span>" + r.priceRange + "</span>";
    if (r.isOpenNow === true) html += "<span style='color:green'>Open</span>";
    if (r.isOpenNow === false) html += "<span style='color:#999'>Closed</span>";
    html += "</div>";
    html += "<div class='info-row'>";
    if (!selectedState) html += "<strong>" + r.stateName + "</strong> — ";
    html += r.city + (r.address ? " — " + r.address : "") + "</div>";
    if (r.website)
      html += "<a href='" + r.website + "' target='_blank'>Website</a>";
    if (r.phone) html += "<a href='tel:" + r.phone + "'>" + r.phone + "</a>";
    html += "</div>";
  }

  document.getElementById("cardList").innerHTML = html;
}

// Render whenever the filter and sort condition is changed
document.getElementById("searchInput").addEventListener("input", function () {
  currentPage = 1;
  renderCards();
});

document.getElementById("sortSelect").addEventListener("change", function () {
  currentPage = 1;
  renderCards();
});

// On start up, we will fetch from our SVG file
// Fetch the "<svg> ... and paste it onto the mapContainer"
fetch("us-map.svg")
  .then(function (response) {
    return response.text();
  })
  .then(function (svgText) {
    document.getElementById("mapContainer").innerHTML = svgText;

    // find the svg element inside the mapContainer
    var svg = document.querySelector("#mapContainer svg");
    svg.setAttribute("id", "usMap");

    initMap();
    renderCards();
  });
