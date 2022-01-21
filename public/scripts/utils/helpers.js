/**
 * Converts string or array of strings into usable options
 * for a dropdown selection menu.
 * 
 * @param {string|string[]} items Options to be added.
 * @param {string} id HTML id of the dropdown menu.
 */
export const addDropdownOptions = (id, items) => {
  // converts string to array when adding only one item
  if (typeof items === "string")
    items = [items];

  for (let i = 0; i < items.length; i++) {
    let option = document.createElement("option");
    option.textContent = items[i];
    document.getElementById(id).appendChild(option);
  }
};

/**
 * Filters through and extracts map's custom data layers.
 * Returns only layers with no metadata (i.e. not mapbox
 * defaults) that are not in the blacklist. Historical
 * maps are also excluded from the returned array unless
 * specified otherwise.
 * 
 * @param {object} map Application's current map.
 * @param {object} historical Historical map JSON data.
 * @returns {object[]} Custom-made data layers.
 */
export const getCurrentFilters = (map, historical) => {
  const blacklist = ["background", "satellite"];
  if (map.getStyle().name !== "Mapbox Outdoors") // todo; fix this
    Object.keys(historical).forEach(name => blacklist.push(name));
  return map.getStyle().layers.filter(layer =>
    !layer["metadata"] && !blacklist.includes(layer.id));
};

/**
 * Toggles visibility of passed-in data layers. Function
 * accepts either a layer object, an array of layer objects,
 * a layer name, or an array of layer names.
 * 
 * @param {object} map Application's current map.
 * @param {object[]} filters List of affected data layers.
 * @param {boolean} bool Visibility-related boolean.
 */
export const setFilterVisibility = (map, filters, bool) => {
  // converts string to array when adding only one item
  if (typeof filters === "string")
    filters = [filters];

  filters.forEach(filter =>
    map.setLayoutProperty(filter.id ? filter.id : filter,
      "visibility", bool ? "visible" : "none"));
};

/**
 * Performs necessary steps upon switching map styles:
 *  - Clears dropdown menu & defaults to placeholder.
 *  - Adds new layers and disables their visibility.
 *  - Hides dropdown for styles w/o custom layers. 
 * 
 * @param {object} map Application's current map.
 * @param {object} historical Historical map JSON data.
 * @param {string} id HTML id of the dropdown menu.
 */
export const addFilters = (map, id, historical) => {
  // remove existing dropdown filters
  const dropdown = document.getElementById(id);
  dropdown.options.length = 1;
  dropdown.selectedIndex = 0;

  // add filters and disable visibility
  const filters = getCurrentFilters(map, historical);
  addDropdownOptions(id, filters.map(obj => obj.id));
  setFilterVisibility(map, filters, false);

  // display dropdown if custom layers are present
  if (dropdown.options.length === 1)
    dropdown.style.display = "none";
  else if (dropdown.options.length > 1)
    dropdown.style.display = "block";
}

/**
 * Creates new MapBox layer for each historical map stored
 * in the local database, historical.json.
 * 
 * @param {object} map Application's current map.
 * @param {object} state Object storing historical map info.
 */
 export const addHistoricalLayers = (map, state) => {
  Object.keys(state.historical).forEach(key => {
    const sections = state.historical[key].url.split("/");
    const identifier = sections[sections.length - 1];
    map.addLayer({
      'id': `${key}`,
      'type': 'raster',
      'source': {
        'type': 'raster',
        'tiles': [
          `https://geoserver.ecds.emory.edu/ATLMaps/` +
          `wms?bbox={bbox-epsg-3857}&format=image/png` +
          `&service=WMS&version=1.1.0&request=GetMap` +
          `&srs=EPSG:3857&transparent=true&width=256` +
          `&height=256&layers=ATLMaps:${identifier}`
        ],
        'tileSize': 256
      }
    });
  });
};

/**
 * Determines whether a given number is representative of a date
 * between January 1st, 2000 and January 1st, 2030.
 * 
 * @param {number} unix Value passed-in from dataset.
 * @returns {date|number} Corresponding date or original number.
 */
export const isDate = (unix) => {
  return (unix > 946702800000 && unix < 1893474000000) ?
    new Date(unix).toLocaleString() : unix;
}
