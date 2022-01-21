let data = password = table = null;
const editable = ["approved", "active"];
const blacklist = ["token"];

// necessary html elements
const form = document.querySelector("form");
const button = document.querySelector("button");
const message = document.querySelector("p");

// retrieves data for all maps
fetch("/api/maps?path=data/mapbox.json", {
  method: "GET",
  headers: { "Content-Type": "application/json" }
})
  .then(async res => {
    // requests map data & populates table
    table = document.querySelector("table");
    data = await res.json();
    generateTable();
    populateTable();
  });

const generateTable = () => {
  // props -> ["name", "url", ···, "active"]
  const mapObj = Object.entries(data)[0][1];
  const props = ["name", ...Object.keys(mapObj)];

  let thead = table.createTHead();
  let row = thead.insertRow();

  // creates header for each map property
  props.forEach(prop => {
    if (!blacklist.includes(prop)) {
      let th = document.createElement("th");
      th.innerHTML = prop.toUpperCase();
      row.appendChild(th);
    }
  });
};

const populateTable = () => {
  for ([map, info] of Object.entries(data)) {
    // manually add mapname
    let row = table.insertRow();
    row.insertCell().innerHTML = map;

    // iteratively add remaining props
    for (prop in info) {
      if (editable.includes(prop)) {
        // insert checkboxes w/ current value
        let box = document.createElement("input");
        box.className = prop;
        box.type = "checkbox";
        box.checked = info[prop];
        row.insertCell().appendChild(box);
      } else if (!blacklist.includes(prop)) {
        // insert text content if not editable
        row.insertCell().innerHTML = info[prop];
      }
    }
  }
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  editable.forEach(prop => {
    // update map data to mirror checkbox deltas
    const elements = document.getElementsByClassName(prop);
    Array.prototype.forEach.call(elements, (ele, i) => {
      Object.entries(data)[i][1][prop] = ele.checked;
    });
  });

  // temporarily disable submissions
  button.innerHTML = "Processing";
  button.disabled = true;

  // sets mandatory wait time between requests (1s)
  await new Promise(resolve => setTimeout(resolve, 1000));

  // overwrite existing json
  fetch("/api/maps", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, updates: data })
  })
    .then(async response => {
      // configures helper text beneath submit button
      message.innerHTML = await response.text();

      // resets form state on successful update
      if (response.status === 200) {
        password = null;
        form.reset();
      }
    });

  // re-enable submissions
  button.disabled = false;
  button.innerHTML = "Submit";
});

// mutator function used to update password state
function handlePassword(e) { password = e.target.value }
