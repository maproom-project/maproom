const fs = require("fs");
const parser = require("body-parser");
const express = require("express");
const router = express.Router();

// access to .env variables
require("dotenv").config();

// determines whether object has matching
// values for the passed-in properties
const hasProps = (obj, props) => {
  for (key in props)
    if (obj[key] !== props[key])
      return false;
  return true;
};

router.get("/maps", parser.json(), (req, res) => {
  const { path, filter } = req.query;

  // load previously-uploaded maps
  const file = fs.readFileSync(path, "utf-8");
  const maps = JSON.parse(file);

  // remove maps not matching specified criteria
  const decoded = decodeURIComponent(filter || "{}");
  const filters = JSON.parse(decoded);
  for (mapname in maps)
    if (!hasProps(maps[mapname], filters))
      delete maps[mapname];

  // send remaining maps
  res.status(200).json(maps);
});

router.post("/maps", parser.json(), (req, res) => {
  // form data passed through request body
  const { mapname, path, ...args } = req.body;

  // load previously-uploaded data
  const file = fs.readFileSync(path, "utf-8");
  const data = JSON.parse(file);

  // check for input-related errors
  if (Object.values(req.body).some(a => a === null || a === "")) {
    res.status(400).send("Please fill out all required information.");
  } else if (data[mapname]) {
    res.status(400).send(`"${mapname}" has already been uploaded.`);
  } else {
    // append new data
    data[mapname] = args;
    // apply formatting & overwrite existing json
    let appended = JSON.stringify(data, null, 2);
    fs.writeFile(path, appended, () => {});
    res.status(200).send("Your map is pending approval.");
  }
});

router.put("/maps", parser.json(), (req, res) => {
  // relevant info from request body
  const { updates, password } = req.body;

  // load previously-uploaded maps
  const file = fs.readFileSync("data/mapbox.json", "utf-8");
  const data = JSON.parse(file);

  if (password == process.env.update_password) {
    // update provided map values
    for ([map, props] of Object.entries(updates))
      for ([key, value] of Object.entries(props))
        if (data[map] && data[map][key] !== null)
          data[map][key] = updates[map][key];

    // apply formatting & overwrite existing json
    let newdata = JSON.stringify(data, null, 2);
    fs.writeFile("data/mapbox.json", newdata, () => { });
    res.status(200).send("Maps have been updated!");
  } else {
    res.status(400).send("Password is incorrect. Try again.");
  }
});

module.exports = router;
