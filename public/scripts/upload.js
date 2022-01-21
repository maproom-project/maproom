// user input & other request information
const requestBodies = [
  { // mapbox map data format
    path: "data/mapbox.json",
    mapname: null, url: null, token: null,
    date: new Date().toUTCString(),
    approved: false, active: false
  },
  { // historical map data format
    path: "data/historical.json",
    mapname: null, url: null,
    date: new Date().toUTCString()
  }
];

// mutator functions used by form to update state
function handleMapboxName(e) { requestBodies[0]["mapname"] = e.target.value }
function handleMapboxUrl(e) { requestBodies[0]["url"] = e.target.value }
function handleMapboxToken(e) { requestBodies[0]["token"] = e.target.value }

function handleHistoricalName(e) { requestBodies[1]["mapname"] = e.target.value }
function handleHistoricalUrl(e) { requestBodies[1]["url"] = e.target.value }

// generalized submit handler applied to all types of map uploads
const subHandler = async (event, form, button, message, body) => {
  event.preventDefault();

  // temporarily disable submissions
  button.innerHTML = "Processing";
  button.disabled = true;

  // sets mandatory wait time between requests (1s)
  await new Promise(resolve => setTimeout(resolve, 1000));

  // addmap post request
  fetch("/api/maps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
    .then(async response => {
      // configures helper text beneath submit button
      message.innerHTML = await response.text();
      message.style.color = response.status === 200
        ? "#80cba0" : "#e77e7e";
    });

  // re-enable submissions
  button.disabled = false;
  button.innerHTML = "Submit";
};

// 
requestBodies.forEach((body, i) => {
  // retrieve elements associated with each upload
  const form = document.getElementsByTagName("form")[i];
  const button = document.getElementsByTagName("button")[i];
  const message = document.getElementsByTagName("p")[i];

  // add 
  form.addEventListener("submit", async (event) =>
    subHandler(event, form, button, message, body)
  );
});
